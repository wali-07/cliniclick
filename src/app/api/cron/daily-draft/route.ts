/**
 * Vercel cron handler - daily article drafter.
 *
 * Fires daily at 04:00 UTC (= 08:00 UAE) per the `vercel.json` cron config.
 * For each invocation:
 *
 *   1. Verify caller via Vercel's CRON_SECRET (set automatically when the
 *      cron is provisioned, mirrored as an env var).
 *   2. Compute today's date in UAE timezone.
 *   3. Fetch editorial/calendar.yaml + src/content/articles/index.ts
 *      from origin/main via the GitHub Contents API.
 *   4. Find today's due QUEUED entry. If none, log + 200 OK + done.
 *   5. Run the full agent pipeline (Drafter -> Editor/Brand/Legal/Compliance/SEO QA
 *      with up to 3 cycles -> Visuals -> Image-Brand + Image-Safety) entirely
 *      in memory via runDraftPipeline().
 *   6. Create preview branch `editorial/<slug>` from main (idempotent).
 *   7. Commit the bundle (article + barrel + calendar + hero webp) to that
 *      branch in ONE commit via the Trees API.
 *   8. Send a Telegram message with [Approve & publish] [Reject] buttons
 *      and the Vercel preview URL for the new branch.
 *
 * The next event is a button tap from Abdullah, handled by the webhook at
 * /api/telegram-webhook/[secret].
 *
 * Timeout: configured for Fluid Compute on Vercel Pro (800s ceiling).
 * A typical run is 5-8 minutes (multiple Claude calls + Recraft + image
 * gates). Headroom is comfortable.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getFileContent,
  createBranchFromMain,
  commitFilesToBranch,
  previewBranchName,
  type FileChange,
} from "../../../../../agents/lib/github-storage";
import { parseCalendar } from "../../../../../agents/lib/calendar";
import { runDraftPipeline } from "../../../../../agents/lib/pipeline-core";
import {
  sendMessageWithButtons,
  escapeMd,
  encodeCallback,
} from "../../../../../agents/lib/telegram";
import { vercelPreviewUrl } from "../../../../../agents/lib/github";

export const dynamic = "force-dynamic";
// Vercel Pro + Fluid Compute. Pipeline runs ~5-8 min; cap at the platform
// ceiling (800s) so we never hit timeout on a slow Recraft cycle.
export const maxDuration = 800;

const CALENDAR_PATH = "editorial/calendar.yaml";
const INDEX_PATH = "src/content/articles/index.ts";

/** UAE local date as YYYY-MM-DD. We compute this in JS rather than relying
 *  on the runtime timezone, which Vercel doesn't guarantee. */
function uaeToday(): string {
  // UAE is UTC+4 year-round (no DST). Shift the current UTC instant by
  // 4 hours and take the date portion.
  const now = new Date();
  const uaeMs = now.getTime() + 4 * 60 * 60 * 1000;
  return new Date(uaeMs).toISOString().slice(0, 10);
}

/** Resolve the "today" the run targets - either the natural UAE date or
 *  an explicit ?date=YYYY-MM-DD override for manual catch-up runs. */
function resolveToday(req: NextRequest): string {
  const override = req.nextUrl.searchParams.get("date");
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return override;
  return uaeToday();
}

function isAuthorized(req: NextRequest): boolean {
  // Vercel cron auto-attaches Authorization: Bearer <CRON_SECRET>. We
  // accept it OR a manual run with the same secret in a query string
  // (for one-off testing from a terminal).
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${expected}`) return true;
  const fromQuery = req.nextUrl.searchParams.get("secret");
  return fromQuery === expected;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const today = resolveToday(req);
  const log = (m: string) => console.log(m); // surfaces in Vercel function logs

  try {
    // ----- Fetch current state from main -----
    const [calRes, indexRes] = await Promise.all([
      getFileContent({ path: CALENDAR_PATH, ref: "main" }),
      getFileContent({ path: INDEX_PATH, ref: "main" }),
    ]);
    const calendar = parseCalendar(calRes.content);

    // ----- Find today's due queued entry -----
    // Defensive: order by dueDate ascending, take the first due-and-queued.
    // If multiple are due today, we still process only one per run so push
    // velocity stays at ~1 article/day.
    const candidates = calendar
      .filter((e) => e.status === "queued" && e.dueDate <= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const entry = candidates[0];
    if (!entry) {
      log(`[daily-draft] ${today}: no queued entry due. Exiting.`);
      return NextResponse.json({ ok: true, date: today, drafted: null });
    }
    log(`[daily-draft] ${today}: drafting "${entry.slug}" (due ${entry.dueDate})`);

    // ----- Run the pipeline (5-8 min) -----
    const bundle = await runDraftPipeline({
      entry,
      currentIndexTs: indexRes.content,
      currentCalendarYaml: calRes.content,
      maxCycles: 3,
      log,
    });

    if (!bundle.converged) {
      log(
        `[daily-draft] ${entry.slug}: did NOT converge after ${bundle.cyclesUsed} cycles. Verdicts: ${JSON.stringify(
          bundle.verdicts
        )}`
      );
      // Still commit the partial draft so Abdullah can inspect on the
      // preview branch + Reject button is available. The calendar entry
      // is already flipped to awaiting-approval inside runDraftPipeline.
    }

    // ----- Prepare the file bundle for the preview branch -----
    const branch = previewBranchName(entry.slug);
    const files: FileChange[] = [
      { path: bundle.articleFileRel, content: bundle.articleTs },
      { path: INDEX_PATH, content: bundle.indexTs },
      { path: CALENDAR_PATH, content: bundle.calendarYaml },
    ];
    if (bundle.heroBuffer) {
      files.push({
        path: `public/article-images/${entry.slug}.webp`,
        content: bundle.heroBuffer,
      });
    }

    // ----- Create branch + commit -----
    log(`[daily-draft] Creating preview branch ${branch}...`);
    await createBranchFromMain(branch);
    log(`[daily-draft] Committing ${files.length} file(s) to ${branch}...`);
    const commit = await commitFilesToBranch({
      branch,
      files,
      message: `Editorial draft: ${entry.title}\n\nslug: ${entry.slug}\nparent: ${entry.parentType}/${entry.parentSlug}\nkind: ${entry.kind}\ncycles: ${bundle.cyclesUsed}/${3}\nconverged: ${bundle.converged}\n\nGenerated by the editorial cron pipeline. Approve via Telegram to merge.`,
    });
    log(`[daily-draft] Committed: ${commit.sha}`);

    // ----- Telegram approval message -----
    const preview = await vercelPreviewUrl(branch);
    const wordEstimate = Math.round(bundle.articleTs.length / 6);
    const verdictsLine = (Object.keys(bundle.verdicts) as Array<keyof typeof bundle.verdicts>)
      .map((r) => `${escapeMd(r)}\\: ${bundle.verdicts[r] === "PASS" ? "✅" : "⚠️"}`)
      .join("  ");
    const heroLine = bundle.hero
      ? `Hero\\: ✅ \\(${bundle.hero.width}×${bundle.hero.height}\\)`
      : `Hero\\: ⚠️ text\\-only`;

    const text = [
      `*📄 Draft ready\\: ${escapeMd(entry.title)}*`,
      ``,
      `Kind\\: ${escapeMd(entry.kind)}  ·  Parent\\: ${escapeMd(`${entry.parentType}/${entry.parentSlug}`)}`,
      `Converged in ${bundle.cyclesUsed} cycle${bundle.cyclesUsed === 1 ? "" : "s"}, \\~${wordEstimate} words`,
      verdictsLine,
      heroLine,
      ``,
      `*Preview\\:* ${escapeMd(preview)}`,
      ``,
      bundle.converged
        ? `Tap *Approve* to merge to main \\(live in \\~60s\\)\\.`
        : `⚠️ Did NOT converge\\. Review carefully before approving\\.`,
    ].join("\n");

    const msgId = await sendMessageWithButtons({
      text,
      buttons: [
        [
          {
            text: "✅ Approve & publish",
            callback_data: encodeCallback({ action: "approve", type: "article", slug: entry.slug }),
          },
          {
            text: "❌ Reject",
            callback_data: encodeCallback({ action: "reject", type: "article", slug: entry.slug }),
          },
        ],
      ],
    });
    log(`[daily-draft] Telegram message ${msgId} sent for ${entry.slug}.`);

    return NextResponse.json({
      ok: true,
      date: today,
      drafted: entry.slug,
      branch,
      commitSha: commit.sha,
      preview,
      converged: bundle.converged,
      verdicts: bundle.verdicts,
      telegramMsgId: msgId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`[daily-draft] FATAL: ${msg}`);
    // Best-effort telegram heads-up so a silent cron failure doesn't pile
    // up unnoticed. Swallow errors here so the response still surfaces
    // the real failure for Vercel's function log.
    try {
      await sendMessageWithButtons({
        text: `*⚠️ Daily draft FAILED*\n\n${escapeMd(msg.slice(0, 500))}`,
        buttons: [],
      });
    } catch {
      /* noop */
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
