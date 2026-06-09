/**
 * Vercel webhook handler - Telegram callback queries (button taps).
 *
 * URL: https://cliniclick.ae/api/telegram-webhook/<TELEGRAM_WEBHOOK_SECRET>
 *
 * Two layers of verification:
 *   1. The [secret] in the URL path must match TELEGRAM_WEBHOOK_SECRET.
 *   2. Telegram's X-Telegram-Bot-Api-Secret-Token header (set when we
 *      call setWebhook) must also match.
 *
 * Then we decode the callback_data the cron put on the button:
 *   approve:article:<slug>  -> merge preview branch into main + commit
 *                              calendar status published; delete branch.
 *   reject:article:<slug>   -> delete preview branch + commit calendar
 *                              status rejected on main.
 *   posted:social:<slug>    -> commit social-calendar delivered->posted.
 *   skip:social:<slug>      -> commit social-calendar delivered->skipped.
 *
 * After acting, the original Telegram message is edited so the buttons
 * disappear and a status line ("✅ Published in <sha>", "❌ Rejected",
 * etc.) takes their place. That makes the chat its own audit log.
 *
 * Always returns 200 quickly so Telegram doesn't retry; errors surface
 * only in the function log and via an edited message.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getFileContent,
  commitFilesToBranch,
  mergeBranchIntoMain,
  deleteBranch,
  previewBranchName,
} from "../../../../../agents/lib/github-storage";
import { applyEntryUpdate, parseCalendar } from "../../../../../agents/lib/calendar";
import {
  answerCallbackQuery,
  editMessageText,
  editMessageCaption,
  decodeCallback,
  escapeMd,
  type DecodedCallback,
} from "../../../../../agents/lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // merges + status-flip commits typically < 10s

const CALENDAR_PATH = "editorial/calendar.yaml";
const SOCIAL_CALENDAR_PATH = "editorial/social-calendar.yaml";

type TelegramUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    from: { id: number; username?: string };
    message?: {
      message_id: number;
      chat: { id: number };
      // sendPhoto messages live their text in caption, not text:
      text?: string;
      caption?: string;
    };
  };
};

/** Read an article entry's current status from calendar.yaml (or null). */
function readArticleStatus(calendarYaml: string, slug: string): string | null {
  try {
    return parseCalendar(calendarYaml).find((e) => e.slug === slug)?.status ?? null;
  } catch {
    return null;
  }
}

/** Repo-canonical site URL for posted-article confirmations. */
function articleUrl(slug: string, parentType: string, parentSlug: string): string {
  if (parentType === "guide") return `https://cliniclick.ae/learn/${slug}`;
  return `https://cliniclick.ae/${parentType}s/${parentSlug}/${slug}`;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ secret: string }> }
): Promise<NextResponse> {
  // ----- Layer 1: secret in URL path -----
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) {
    console.error("[telegram-webhook] TELEGRAM_WEBHOOK_SECRET not set");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  const { secret } = await ctx.params;
  if (secret !== expected) {
    return NextResponse.json({ ok: false, reason: "bad path secret" }, { status: 401 });
  }

  // ----- Layer 2: Telegram's secret-token header -----
  const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
  if (headerSecret !== expected) {
    return NextResponse.json({ ok: false, reason: "bad header secret" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad json" }, { status: 400 });
  }

  const cb = update.callback_query;
  if (!cb || !cb.data || !cb.message) {
    // Some other update type (we only subscribed to callback_query, but
    // be defensive). Return 200 so Telegram stops retrying.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const decoded = decodeCallback(cb.data);
  if (!decoded) {
    await answerCallbackQuery({
      callbackQueryId: cb.id,
      text: "Unknown callback. Ignored.",
    });
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Acknowledge the tap immediately so the user's button spinner clears.
  await answerCallbackQuery({
    callbackQueryId: cb.id,
    text:
      decoded.action === "approve" || decoded.action === "posted"
        ? "Working..."
        : "Processing reject...",
  });

  // Dispatch + then edit the message to reflect the outcome.
  const originalText = cb.message.text ?? cb.message.caption ?? "";
  const messageId = cb.message.message_id;
  const isPhotoMessage = !cb.message.text && !!cb.message.caption;

  try {
    const result = await handle(decoded);
    const stamp = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const newText =
      `${originalText}\n\n` +
      `━━━━━\n` +
      `${result.statusLine}  ·  ${escapeMd(stamp)}` +
      (result.commitSha
        ? `\n*Commit\\:* \`${escapeMd(result.commitSha.slice(0, 7))}\``
        : ``) +
      (result.liveUrl ? `\n*Live\\:* ${escapeMd(result.liveUrl)}` : ``);

    if (isPhotoMessage) {
      await editMessageCaption({ messageId, caption: newText });
    } else {
      await editMessageText({ messageId, text: newText });
    }
    return NextResponse.json({ ok: true, action: decoded.action, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[telegram-webhook] ${decoded.action}:${decoded.type}:${decoded.slug} FAILED: ${msg}`);
    const failText =
      `${originalText}\n\n` +
      `━━━━━\n` +
      `*⚠️ Action FAILED*\n${escapeMd(msg.slice(0, 400))}`;
    try {
      if (isPhotoMessage) {
        await editMessageCaption({ messageId, caption: failText });
      } else {
        await editMessageText({ messageId, text: failText });
      }
    } catch {
      /* noop */
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

type HandlerResult = {
  statusLine: string;
  commitSha?: string;
  liveUrl?: string;
};

async function handle(d: DecodedCallback): Promise<HandlerResult> {
  if (d.type === "article" && d.action === "approve") {
    return await approveArticle(d.slug);
  }
  if (d.type === "article" && d.action === "reject") {
    return await rejectArticle(d.slug);
  }
  if (d.type === "social" && d.action === "posted") {
    return await markSocialPosted(d.slug);
  }
  if (d.type === "social" && d.action === "skip") {
    return await markSocialSkipped(d.slug);
  }
  throw new Error(`Unhandled callback combo: ${d.action}:${d.type}`);
}

// ---------------------------------------------------------------------------
// Article handlers
// ---------------------------------------------------------------------------

async function approveArticle(slug: string): Promise<HandlerResult> {
  const branch = previewBranchName(slug);

  // Idempotency: a retried tap (or a second tap after the first published)
  // must not merge + re-flip again. If the entry is already published,
  // report success without touching the repo.
  const { content: calStatusCheck } = await getFileContent({ path: CALENDAR_PATH, ref: "main" });
  const alreadyStatus = readArticleStatus(calStatusCheck, slug);
  if (alreadyStatus === "published") {
    return { statusLine: `*✅ PUBLISHED* \\(already\\)` };
  }

  // 1. Merge editorial/<slug> into main. Creates a real merge commit on
  //    main with the article files + the calendar.yaml flipped to
  //    awaiting-approval (the cron set that state on the branch).
  const merge = await mergeBranchIntoMain({
    fromBranch: branch,
    commitMessage: `Publish: ${slug}\n\nMerged via Telegram approval.`,
  });
  if (!merge) {
    // Branch was already merged or has no diff vs main - either way,
    // proceed to the status flip + cleanup.
    console.warn(`[approve] merge returned null for ${branch} (already up to date?)`);
  }

  // 2. Flip the calendar entry status to published with today's date.
  //    This is a SECOND commit on main, accepted as the necessary cost
  //    of having the calendar source-of-truth in the same repo.
  const { content: calBefore } = await getFileContent({
    path: CALENDAR_PATH,
    ref: "main",
  });
  const today = new Date().toISOString().slice(0, 10);
  const calAfter = applyEntryUpdate({
    yaml: calBefore,
    slug,
    updates: { status: "published", publishedDate: today },
  });
  const statusCommit = await commitFilesToBranch({
    branch: "main",
    files: [{ path: CALENDAR_PATH, content: calAfter }],
    message: `Calendar: ${slug} awaiting-approval -> published (${today})`,
  });

  // 3. Clean up the preview branch. Best-effort; failure doesn't block
  //    the response (the article is live, that's what counts).
  try {
    await deleteBranch(branch);
  } catch (err) {
    console.warn(`[approve] failed to delete ${branch}: ${err instanceof Error ? err.message : err}`);
  }

  // 4. Try to resolve the live URL from the published calendar entry.
  let liveUrl: string | undefined;
  try {
    const after = applyEntryUpdate({ yaml: calAfter, slug, updates: {} }); // noop, just to validate
    void after;
    // Re-parse the calendar to find parentType/parentSlug.
    const parsed = JSON.parse(
      JSON.stringify(
        (await import("../../../../../agents/lib/calendar")).parseCalendar(calAfter)
      )
    ) as Array<{ slug: string; parentType: string; parentSlug: string }>;
    const entry = parsed.find((e) => e.slug === slug);
    if (entry) {
      liveUrl = articleUrl(entry.slug, entry.parentType, entry.parentSlug);
    }
  } catch {
    /* noop */
  }

  return {
    statusLine: `*✅ PUBLISHED*`,
    commitSha: statusCommit.sha,
    liveUrl,
  };
}

async function rejectArticle(slug: string): Promise<HandlerResult> {
  const branch = previewBranchName(slug);

  // Idempotency: a retried tap must not re-flip an already-rejected entry.
  const { content: calStatusCheck } = await getFileContent({ path: CALENDAR_PATH, ref: "main" });
  if (readArticleStatus(calStatusCheck, slug) === "rejected") {
    return { statusLine: `*❌ REJECTED* \\(already\\)` };
  }

  // 1. Delete the preview branch (cleanup; the article never reaches main).
  try {
    await deleteBranch(branch);
  } catch (err) {
    console.warn(`[reject] failed to delete ${branch}: ${err instanceof Error ? err.message : err}`);
  }

  // 2. Flip the calendar entry on main from queued (it was rolled back
  //    when we created the preview branch) to rejected. The next pipeline
  //    run can either pick a different slug or you re-queue manually.
  const { content: calBefore } = await getFileContent({
    path: CALENDAR_PATH,
    ref: "main",
  });
  const calAfter = applyEntryUpdate({
    yaml: calBefore,
    slug,
    updates: {
      status: "rejected",
      rejectionNotes: `Rejected via Telegram on ${new Date().toISOString().slice(0, 10)}`,
    },
  });
  const commit = await commitFilesToBranch({
    branch: "main",
    files: [{ path: CALENDAR_PATH, content: calAfter }],
    message: `Calendar: ${slug} -> rejected (via Telegram)`,
  });

  return { statusLine: `*❌ REJECTED*`, commitSha: commit.sha };
}

// ---------------------------------------------------------------------------
// Social handlers
// ---------------------------------------------------------------------------

/**
 * Flip a single social-calendar.yaml entry's status via a targeted line
 * edit (not yaml-parse-and-dump) so the file's grid-position notes +
 * comments are preserved exactly. Mirrors the technique in
 * agents/social-send-day.ts:markDelivered().
 */
function flipSocialStatus(yamlText: string, slug: string, to: string): string {
  const lines = yamlText.split(/\r?\n/);
  let inEntry = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`slug: ${slug}`)) inEntry = true;
    if (inEntry && /^\s+status:\s/.test(lines[i])) {
      lines[i] = lines[i].replace(/status:\s*\w+/, `status: ${to}`);
      return lines.join("\n");
    }
    if (inEntry && /^\s+- topic:/.test(lines[i])) break;
  }
  throw new Error(`Social entry not found or had no status line: ${slug}`);
}

/** Read a single social entry's current status (or null if not found). */
function readSocialStatus(yamlText: string, slug: string): string | null {
  const lines = yamlText.split(/\r?\n/);
  let inEntry = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`slug: ${slug}`)) inEntry = true;
    if (inEntry) {
      const m = lines[i].match(/^\s+status:\s*(\w+)/);
      if (m) return m[1];
      if (/^\s+- topic:/.test(lines[i])) break;
    }
  }
  return null;
}

async function markSocialPosted(slug: string): Promise<HandlerResult> {
  const { content } = await getFileContent({
    path: SOCIAL_CALENDAR_PATH,
    ref: "main",
  });
  // Idempotency: Telegram retries a callback if the handler is slow to
  // answer, so the same tap can arrive several times. Only act when the
  // entry is still "delivered" - a repeat tap on an already-resolved post
  // is a no-op instead of a duplicate commit.
  const current = readSocialStatus(content, slug);
  if (current !== "delivered") {
    return { statusLine: `*✅ POSTED ON IG* \\(already ${escapeMd(current ?? "unknown")}\\)` };
  }
  const updated = flipSocialStatus(content, slug, "posted");
  const commit = await commitFilesToBranch({
    branch: "main",
    files: [{ path: SOCIAL_CALENDAR_PATH, content: updated }],
    message: `Social: ${slug} delivered -> posted (via Telegram)`,
  });
  return { statusLine: `*✅ POSTED ON IG*`, commitSha: commit.sha };
}

async function markSocialSkipped(slug: string): Promise<HandlerResult> {
  const { content } = await getFileContent({
    path: SOCIAL_CALENDAR_PATH,
    ref: "main",
  });
  const current = readSocialStatus(content, slug);
  if (current !== "delivered") {
    return { statusLine: `*⏭️ SKIPPED* \\(already ${escapeMd(current ?? "unknown")}\\)` };
  }
  const updated = flipSocialStatus(content, slug, "skipped");
  const commit = await commitFilesToBranch({
    branch: "main",
    files: [{ path: SOCIAL_CALENDAR_PATH, content: updated }],
    message: `Social: ${slug} delivered -> skipped (via Telegram)`,
  });
  return { statusLine: `*⏭️ SKIPPED*`, commitSha: commit.sha };
}
