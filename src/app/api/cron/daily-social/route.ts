/**
 * Vercel cron handler - daily Instagram-asset sender (fully automatic).
 *
 * Fires daily at 04:00 UTC (= 08:00 UAE) per vercel.json cron config.
 * Same-day model: the run prepares the draft scheduled for TODAY so it's
 * in Abdullah's Telegram by morning - he posts to IG and taps Mark posted
 * the same day. Pass ?date=YYYY-MM-DD on the URL to override "today" for
 * manual re-runs / catch-up.
 *
 *   1. Verify caller via Vercel's CRON_SECRET.
 *   2. Compute today's date in UAE timezone (or use ?date= override).
 *   3. Fetch editorial/social-calendar.yaml from origin/main.
 *   4. Find today's draft entry. If none, exit cleanly.
 *   5. Decide format from slug suffix: ends with "-carousel" -> carousel,
 *      else -> single.
 *   6. If brief + assets already exist on main (pre-rendered locally),
 *      use them. Otherwise run the FULL serverless pipeline:
 *        Social Briefer -> brief JSON
 *        Visuals Agent -> Recraft -> Image-Brand + Image-Safety -> cover
 *        Carousel: also render info slides typographically via sharp
 *   7. Commit all artifacts to main in ONE commit (brief + cover webp +
 *      cover jpg + base webp + slides + calendar flip draft->delivered).
 *   8. Send to Telegram (sendPhoto or sendMediaGroup) + a follow-up
 *      message with [Mark posted][Skip] buttons.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import {
  getFileContent,
  commitFilesToBranch,
  type FileChange,
} from "../../../../../agents/lib/github-storage";
import {
  sendMessageWithButtons,
  escapeMd,
  encodeCallback,
} from "../../../../../agents/lib/telegram";
import {
  generateSocialAsset,
  type SocialBrief,
  type SocialFormat,
} from "../../../../../agents/lib/social-pipeline-core";

export const dynamic = "force-dynamic";
// Worst case: brief (10s) + Visuals (10s) + Recraft x3 cycles (60-180s) +
// vision gates x3 (~60-120s) + commits (10s) = ~5-6 min. Pro + Fluid
// Compute supports up to 800s; we cap at 600 to leave breathing room.
export const maxDuration = 600;

const SOCIAL_CALENDAR_PATH = "editorial/social-calendar.yaml";
const BRIEFS_DIR = "editorial/social-briefs";
const RENDERS_DIR = "public/social-renders";

type SocialPost = {
  topic: string;
  slug: string;
  article?: string;
  scheduledFor: string;
  status: "draft" | "delivered" | "posted" | "skipped";
};

function uaeDate(daysAhead: number = 0): string {
  const now = new Date();
  const uaeMs = now.getTime() + (4 + daysAhead * 24) * 60 * 60 * 1000;
  return new Date(uaeMs).toISOString().slice(0, 10);
}

/** Resolve the "today" the run targets - either the natural UAE date or
 *  an explicit ?date=YYYY-MM-DD override for manual catch-up runs. */
function resolveTargetDate(req: NextRequest): string {
  const override = req.nextUrl.searchParams.get("date");
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return override;
  return uaeDate(0);
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  if (req.headers.get("authorization") === `Bearer ${expected}`) return true;
  return req.nextUrl.searchParams.get("secret") === expected;
}

/** Lightweight YAML parse - we only need a few fields per entry and the
 *  social-calendar has heavy comments that a full YAML parser would
 *  preserve poorly anyway. Anchors on "- topic:" and reads following
 *  scalar fields until the next entry begins. */
function parseSocialCalendar(yamlText: string): SocialPost[] {
  const posts: SocialPost[] = [];
  let current: Partial<SocialPost> = {};
  for (const line of yamlText.split(/\r?\n/)) {
    const topic = line.match(/^\s+-\s+topic:\s*"?([^"]+?)"?\s*$/);
    if (topic) {
      if (current.slug && current.scheduledFor && current.status) {
        posts.push(current as SocialPost);
      }
      current = { topic: topic[1] };
      continue;
    }
    const slug = line.match(/^\s+slug:\s*(\S+)/);
    if (slug) current.slug = slug[1];
    const article = line.match(/^\s+article:\s*(\S+)/);
    if (article) current.article = article[1];
    const sched = line.match(/^\s+scheduledFor:\s*"?(\d{4}-\d{2}-\d{2})"?/);
    if (sched) current.scheduledFor = sched[1];
    const status = line.match(/^\s+status:\s*(\w+)/);
    if (status) current.status = status[1] as SocialPost["status"];
  }
  if (current.slug && current.scheduledFor && current.status) {
    posts.push(current as SocialPost);
  }
  return posts;
}

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

/** Format detector. Matches the calendar's slug naming convention:
 *  `<topic>-single` (e.g. "retinol-single") or `<topic>-carousel`
 *  (e.g. "medical-grade-carousel"). Anything else defaults to single. */
function inferFormat(slug: string): SocialFormat {
  return slug.endsWith("-carousel") ? "carousel" : "single";
}

async function tryGetBinary(path: string): Promise<Buffer | null> {
  try {
    const TOKEN = process.env.GITHUB_TOKEN_FOR_PR_BOT;
    if (!TOKEN) throw new Error("GITHUB_TOKEN_FOR_PR_BOT not set");
    const url = `https://api.github.com/repos/wali-07/cliniclick/contents/${encodeURI(path)}?ref=main`;
    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${TOKEN}`,
        accept: "application/vnd.github+json",
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`fetch ${path}: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { content: string; encoding: string };
    if (json.encoding !== "base64") throw new Error(`unexpected encoding ${json.encoding}`);
    return Buffer.from(json.content, "base64");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("404")) return null;
    throw err;
  }
}

async function tryGetText(path: string): Promise<string | null> {
  try {
    const r = await getFileContent({ path, ref: "main" });
    return r.content;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("404")) return null;
    throw err;
  }
}

async function alertFailure(slug: string, reason: string): Promise<void> {
  await sendMessageWithButtons({
    text: [
      `*⚠️ IG asset generation FAILED*`,
      ``,
      `Slug\\: \`${escapeMd(slug)}\``,
      `Reason\\: ${escapeMd(reason.slice(0, 400))}`,
      ``,
      `Re\\-run when ready\\: hit the cron URL manually with \`?secret=&lt;CRON\\_SECRET&gt;\`\\.`,
    ].join("\n"),
    buttons: [],
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const targetDate = resolveTargetDate(req);
  const log = (m: string) => console.log(m);

  // Set once we have claimed an entry on main, so the catch block can roll
  // the claim back to "draft" if the run fails before the post is sent.
  let claimedSlug: string | null = null;

  try {
    // ----- Find today's draft -----
    const calRes = await getFileContent({ path: SOCIAL_CALENDAR_PATH, ref: "main" });
    const posts = parseSocialCalendar(calRes.content);
    const due = posts.find((p) => p.scheduledFor === targetDate && p.status === "draft");
    if (!due) {
      // Distinguish a one-off gap day (drafts still queued for later dates)
      // from an exhausted calendar (nothing scheduled today OR after). A dry
      // calendar silently stops IG forever - which is exactly what happened
      // after 2026-06-09 - so when it's truly empty we ping Telegram instead
      // of exiting quietly. A gap day stays silent to avoid daily noise.
      const futureDrafts = posts.filter((p) => p.status === "draft" && p.scheduledFor >= targetDate);
      if (futureDrafts.length === 0) {
        log(`[daily-social] ${targetDate}: calendar exhausted (no draft today or later). Alerting.`);
        try {
          await sendMessageWithButtons({
            text: [
              `*📭 IG calendar is empty*`,
              ``,
              `No Instagram post was scheduled for ${escapeMd(targetDate)}, and there are no upcoming drafts left in \`editorial/social\\-calendar\\.yaml\`\\.`,
              ``,
              `Add new entries to resume daily posts \\(the cron will keep pinging until you do\\)\\.`,
            ].join("\n"),
            buttons: [],
          });
        } catch {
          /* best-effort; a failed ping must not 500 the cron */
        }
        return NextResponse.json({ ok: true, date: targetDate, sent: null, calendarEmpty: true });
      }
      log(`[daily-social] ${targetDate}: no draft due (gap day; ${futureDrafts.length} upcoming). Exiting.`);
      return NextResponse.json({ ok: true, date: targetDate, sent: null });
    }
    const format = inferFormat(due.slug);
    log(`[daily-social] preparing ${due.slug} (${format}) for ${targetDate}`);

    // ----- Claim the entry on main BEFORE generating -----
    // Without this, two cron invocations (we have seen the daily-social cron
    // fire twice ~6s apart) both read the entry while it is still "draft",
    // both run the generator - which picks a random background colour, so the
    // two posts look almost-but-not-quite identical - and both send to
    // Telegram. Flipping the status to "delivered" up front removes the entry
    // from the "draft" set so a second run finds nothing due and exits.
    //
    // commitFilesToBranch advances main with force:false (compare-and-swap),
    // so if the two runs are truly simultaneous, only the first claim commit
    // lands; the loser is rejected as a non-fast-forward and falls into the
    // catch (where claimedSlug is still null, so nothing is rolled back).
    await commitFilesToBranch({
      branch: "main",
      files: [{ path: SOCIAL_CALENDAR_PATH, content: flipSocialStatus(calRes.content, due.slug, "delivered") }],
      message: `Social: ${due.slug} draft -> delivered (claimed by daily-social cron)`,
    });
    claimedSlug = due.slug;
    log(`[daily-social] claimed ${due.slug} on main (draft -> delivered).`);

    // ----- Use pre-rendered assets if present, otherwise auto-generate -----
    let brief: SocialBrief;
    let coverWebp: Buffer;
    let coverJpg: Buffer | null;
    let baseWebp: Buffer | null;
    let slides: Buffer[] = [];
    let bgColor: string | undefined;
    let didGenerate = false;

    const existingBrief = await tryGetText(`${BRIEFS_DIR}/${due.slug}.json`);
    const existingCover = await tryGetBinary(`${RENDERS_DIR}/${due.slug}.webp`);

    if (existingBrief && existingCover) {
      log(`[daily-social] using pre-rendered brief + cover.`);
      brief = JSON.parse(existingBrief) as SocialBrief;
      if (!brief.hashtags || brief.hashtags.length !== 5) {
        throw new Error(`Pre-rendered brief has ${brief.hashtags?.length ?? 0} hashtags, need 5`);
      }
      coverWebp = existingCover;
      coverJpg = await tryGetBinary(`${RENDERS_DIR}/${due.slug}.jpg`);
      baseWebp = await tryGetBinary(`${RENDERS_DIR}/${due.slug}.base.webp`);
      if (format === "carousel") {
        // Fetch slide PNGs sequentially: slide-01.png, slide-02.png, ...
        for (let i = 1; i <= 10; i++) {
          const path = `${RENDERS_DIR}/${due.slug}/slide-${String(i).padStart(2, "0")}.png`;
          const slide = await tryGetBinary(path);
          if (!slide) break;
          slides.push(slide);
        }
      }
    } else {
      log(`[daily-social] generating ${format} from scratch (no pre-rendered).`);
      didGenerate = true;
      const pastTopics = posts
        .filter((p) => p.status === "posted" || p.status === "delivered")
        .map((p) => p.topic);
      const bundle = await generateSocialAsset({
        slug: due.slug,
        topic: due.topic,
        format,
        articleContext: due.article,
        pastTopics,
        log,
      });
      brief = bundle.brief;
      coverWebp = bundle.composedCoverWebp;
      coverJpg = bundle.composedCoverJpg;
      baseWebp = bundle.baseCoverWebp;
      slides = bundle.slides;
      bgColor = bundle.bgColor;
    }

    // ----- Commit the generated artifacts -----
    // The calendar was already flipped to "delivered" in the claim commit
    // above, so here we only persist freshly generated image/brief assets.
    // Pre-rendered runs (!didGenerate) have nothing new to commit.
    let commit: { sha: string } | null = null;
    if (didGenerate) {
      const files: FileChange[] = [
        {
          path: `${BRIEFS_DIR}/${due.slug}.json`,
          content: JSON.stringify(brief, null, 2) + "\n",
        },
        { path: `${RENDERS_DIR}/${due.slug}.webp`, content: coverWebp },
      ];
      if (coverJpg) files.push({ path: `${RENDERS_DIR}/${due.slug}.jpg`, content: coverJpg });
      if (baseWebp) files.push({ path: `${RENDERS_DIR}/${due.slug}.base.webp`, content: baseWebp });
      slides.forEach((buf, i) => {
        files.push({
          path: `${RENDERS_DIR}/${due.slug}/slide-${String(i + 1).padStart(2, "0")}.png`,
          content: buf,
        });
      });
      commit = await commitFilesToBranch({
        branch: "main",
        files,
        message: `Social: ${due.slug} generated assets (via daily-social cron)${bgColor ? ` [bgColor: ${bgColor}]` : ""}`,
      });
      log(`[daily-social] committed ${commit.sha}`);
    }

    // ----- Send to Telegram -----
    // IG-ready captions are ~150-200 words = often >1024 chars, which is
    // Telegram's hard limit on PHOTO captions. We split: photo(s) go out
    // with a tiny header caption, full caption + hashtags ride on the
    // follow-up sendMessage (4096-char limit, easy fit). UX: the user
    // copies the caption from the text message, which is also easier than
    // copying from a photo caption.
    const shortHeader = `📸 ${due.topic} — for ${targetDate}`;
    if (format === "carousel" && slides.length > 0) {
      const all = [coverWebp, ...slides];
      await sendMediaGroupTelegram({ slides: all, caption: shortHeader });
    } else {
      await sendPhotoTelegram({
        photo: coverJpg ?? coverWebp,
        filename: `${due.slug}.${coverJpg ? "jpg" : "webp"}`,
        caption: shortHeader,
      });
    }

    // The post has reached Telegram, so "delivered" is now truthful. Clear
    // the rollback marker: a failure on the follow-up caption below must not
    // revert the entry to "draft", or the next run would re-send the image.
    claimedSlug = null;

    // Follow-up message with the FULL caption + 5 hashtags + buttons. The
    // user copies this entire block into IG when posting.
    const followText = [
      `*${escapeMd(brief.title)}* \\— for ${escapeMd(targetDate)}`,
      ``,
      escapeMd(brief.caption),
      ``,
      escapeMd(brief.hashtags.join(" ")),
      ``,
      `━━━━━`,
      `${format === "carousel" ? `${slides.length + 1}\\-slide carousel` : `Single`}\\. ${didGenerate ? `Auto\\-generated\\.` : `Pre\\-rendered\\.`}`,
      `Post to Instagram, then tap *Mark posted*\\.`,
    ].join("\n");
    const msgId = await sendMessageWithButtons({
      text: followText,
      buttons: [
        [
          {
            text: "✅ Mark posted",
            callback_data: encodeCallback({ action: "posted", type: "social", slug: due.slug }),
          },
          {
            text: "⏭️ Skip",
            callback_data: encodeCallback({ action: "skip", type: "social", slug: due.slug }),
          },
        ],
      ],
    });

    return NextResponse.json({
      ok: true,
      date: targetDate,
      sent: due.slug,
      format,
      generated: didGenerate,
      slides: slides.length,
      bgColor,
      commitSha: commit?.sha ?? null,
      telegramMsgId: msgId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`[daily-social] FATAL: ${msg}`);

    // If we claimed an entry on main but never sent the post, roll the claim
    // back to "draft" so a future run retries it instead of silently
    // dropping the day's post. (When the claim commit itself lost a
    // concurrency race, claimedSlug is still null and we skip the rollback.)
    if (claimedSlug) {
      try {
        const { content } = await getFileContent({ path: SOCIAL_CALENDAR_PATH, ref: "main" });
        await commitFilesToBranch({
          branch: "main",
          files: [{ path: SOCIAL_CALENDAR_PATH, content: flipSocialStatus(content, claimedSlug, "draft") }],
          message: `Social: ${claimedSlug} delivered -> draft (daily-social failed, rolled back)`,
        });
        log(`[daily-social] rolled ${claimedSlug} back to draft.`);
      } catch (rollbackErr) {
        const rmsg = rollbackErr instanceof Error ? rollbackErr.message : String(rollbackErr);
        log(`[daily-social] rollback FAILED for ${claimedSlug}: ${rmsg}`);
      }
    }

    try {
      await alertFailure("(unknown)", msg);
    } catch {
      /* noop */
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Telegram multipart sends
// ---------------------------------------------------------------------------

async function sendPhotoTelegram(args: {
  photo: Buffer;
  filename: string;
  caption: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) throw new Error("Telegram not configured");
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", args.caption);
  form.append("photo", new Blob([new Uint8Array(args.photo)]), args.filename);
  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`sendPhoto ${res.status}: ${await res.text()}`);
}

async function sendMediaGroupTelegram(args: {
  slides: Buffer[];
  caption: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) throw new Error("Telegram not configured");
  const slides = args.slides.slice(0, 10); // Telegram caps media groups at 10
  const form = new FormData();
  form.append("chat_id", chatId);
  const media = slides.map((_, i) => ({
    type: "photo",
    media: `attach://s${i}`,
    ...(i === 0 ? { caption: args.caption } : {}),
  }));
  form.append("media", JSON.stringify(media));
  slides.forEach((buf, i) => {
    form.append(`s${i}`, new Blob([new Uint8Array(buf)]), `s${i}.png`);
  });
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`sendMediaGroup ${res.status}: ${await res.text()}`);
  }
}
