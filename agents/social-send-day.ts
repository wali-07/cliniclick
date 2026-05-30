/**
 * Deterministic daily sender. For a given date it finds that day's
 * scheduled post in editorial/social-calendar.yaml, gathers the FINISHED
 * asset(s), and delivers the ready-to-post package to Telegram - the
 * actual images + final caption + 5 hashtags. NEVER a brief
 * (feedback_finished_assets_no_briefs). No Claude model in the loop, so
 * running this on a timer costs $0. Nothing posts to Instagram - Abdullah
 * approves + posts.
 *
 * Asset resolution per scheduled slug:
 *   - carousel: public/social-renders/<slug>/slide-*.png  -> sendMediaGroup
 *   - single  : public/social-renders/<slug>.(webp|jpg)   -> sendPhoto
 *   caption + 5 hashtags come from editorial/social-briefs/<slug>.json.
 * If the finished asset is missing, it sends a one-line "not yet
 * produced - holding" notice (no brief), so there is never dead air.
 *
 * On success it flips that calendar entry draft -> delivered (targeted
 * line edit; file comments preserved) so it is not re-sent and the admin
 * dashboard reflects reality.
 *
 * Usage: npx tsx agents/social-send-day.ts [--date=YYYY-MM-DD] [--dry]
 */

import "dotenv/config";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import yaml from "js-yaml";

type Post = {
  topic: string;
  slug: string;
  scheduledFor: string;
  status: "draft" | "delivered" | "posted" | "skipped";
};
type Spec = {
  caption: string;
  hashtags: string[];
  slides?: unknown[];
  title?: string;
  source?: string;
  titleY?: number;
};

function arg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

const ROOT = process.cwd();
const CAL = resolve(ROOT, "editorial/social-calendar.yaml");

async function tg(method: string, form: FormData): Promise<number> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`${method} ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    result: { message_id: number } | { message_id: number }[];
  };
  const r = data.result;
  return Array.isArray(r) ? r[0].message_id : r.message_id;
}

function caption(slug: string, topic: string): string {
  const specPath = resolve(ROOT, `editorial/social-briefs/${slug}.json`);
  if (existsSync(specPath)) {
    const s = JSON.parse(readFileSync(specPath, "utf-8")) as Spec;
    if (s.hashtags?.length !== 5) {
      throw new Error(`${slug}: HARD RULE 5 hashtags, got ${s.hashtags?.length}`);
    }
    return `${s.caption}\n\n${s.hashtags.join(" ")}`;
  }
  // Single posts produced before the spec system: caption is composed at
  // produce-time and stored alongside; if absent, send the image with a
  // minimal topic line rather than fabricating non-curated hashtags.
  return topic;
}

/**
 * Make the daily job self-contained: if the finished asset for <slug> is
 * not on disk yet, deterministically render it from its spec (carousel ->
 * social-carousel.ts ; single -> social-post.ts reusing an approved
 * object-pun source). Pure rendering, no Claude, $0. Day-by-day: only
 * today's spec needs to exist - we never pre-produce the week.
 */
function ensureRendered(slug: string) {
  const specPath = resolve(ROOT, `editorial/social-briefs/${slug}.json`);
  if (!existsSync(specPath)) return; // no spec -> handled as "not produced"
  const spec = JSON.parse(readFileSync(specPath, "utf-8")) as Spec;
  const dir = resolve(ROOT, "public/social-renders", slug);
  const single = resolve(ROOT, "public/social-renders", `${slug}.webp`);
  const run = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, stdio: "pipe" });

  if (Array.isArray(spec.slides)) {
    const has =
      existsSync(dir) &&
      readdirSync(dir).some((f) => /^slide-\d+\.png$/.test(f));
    if (!has) run(`npx tsx agents/social-carousel.ts --slug=${slug}`);
  } else if (spec.source && spec.title) {
    if (!existsSync(single)) {
      const yArg =
        typeof spec.titleY === "number" ? ` --titleY=${spec.titleY}` : "";
      run(
        `npx tsx agents/social-post.ts --slug=${slug} ` +
          `--title=${JSON.stringify(spec.title)} --source=${spec.source}` +
          yArg
      );
    }
  }
}

/** Flip one entry's status via targeted line edit so file comments stay. */
function markDelivered(slug: string) {
  const lines = readFileSync(CAL, "utf-8").split(/\r?\n/);
  let inEntry = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`slug: ${slug}`)) inEntry = true;
    if (inEntry && /^\s+status:\s/.test(lines[i])) {
      lines[i] = lines[i].replace(/status:\s*\w+/, "status: delivered");
      break;
    }
    if (inEntry && /^\s+- topic:/.test(lines[i])) break; // next entry, bail
  }
  writeFileSync(CAL, lines.join("\n"));
}

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.error("[send-day] TELEGRAM creds missing");
    process.exit(1);
  }
  const dry = process.argv.includes("--dry");
  // Day-before model (Abdullah 2026-05-18): the scheduled run sends the
  // post for `--ahead` days from today (wrapper uses --ahead=1), so it is
  // reviewed + finalised the day before its posting day. An explicit
  // --date overrides.
  const ahead = parseInt(arg("ahead") || "0", 10) || 0;
  let date = arg("date");
  if (!date) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + ahead);
    date = d.toISOString().slice(0, 10);
  }

  const { posts } = yaml.load(readFileSync(CAL, "utf-8")) as { posts: Post[] };
  // Only act on NEW drafts. delivered/posted/skipped are never re-sent,
  // so daily re-runs are idempotent and already-in-Telegram items
  // (e.g. this week's singles) are never duplicated.
  const due = posts.filter(
    (p) => p.scheduledFor === date && p.status === "draft"
  );
  if (due.length === 0) {
    console.log(
      `[send-day] ${date}: no new draft due (Stories-only or already delivered).`
    );
    return;
  }

  for (const p of due) {
    try {
      ensureRendered(p.slug);
    } catch (e) {
      console.log(
        `[send-day] ${p.slug} (${date}): render failed, skipped - ${
          e instanceof Error ? e.message : String(e)
        }`
      );
      continue;
    }
    const dir = resolve(ROOT, "public/social-renders", p.slug);
    const slides = existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => /^slide-\d+\.png$/.test(f))
          .sort()
          .map((f) => resolve(dir, f))
      : [];
    const single = ["webp", "jpg"]
      .map((e) => resolve(ROOT, "public/social-renders", `${p.slug}.${e}`))
      .find((f) => existsSync(f));

    if (slides.length === 0 && !single) {
      // Not produced yet. Do NOT nag Abdullah's Telegram - keeping the
      // runway pre-produced is the pod's job (feedback_two_week_runway).
      // Log locally so ops/Claude catches it next session.
      console.log(
        `[send-day] ${p.slug} (${date}): NOT PRODUCED - skipped, no message sent. Produce the finished asset.`
      );
      continue;
    }

    const cap = caption(p.slug, p.topic);

    if (slides.length > 0) {
      const f = new FormData();
      f.append("chat_id", chatId);
      const media = slides.slice(0, 10).map((file, i) => ({
        type: "photo",
        media: `attach://s${i}`,
        ...(i === 0 ? { caption: cap } : {}),
      }));
      f.append("media", JSON.stringify(media));
      slides.slice(0, 10).forEach((file, i) => {
        f.append(
          `s${i}`,
          new Blob([readFileSync(file)]),
          `s${i}.png`
        );
      });
      if (dry) {
        console.log(
          `[send-day] DRY ${p.slug}: would send ${slides.length}-slide carousel`
        );
      } else {
        const id = await tg("sendMediaGroup", f);
        markDelivered(p.slug);
        console.log(
          `[send-day] ${p.slug}: sent ${slides.length}-slide carousel, msg=${id}, marked delivered`
        );
      }
    } else if (single) {
      const f = new FormData();
      f.append("chat_id", chatId);
      f.append("photo", new Blob([readFileSync(single)]), `${p.slug}.jpg`);
      f.append("caption", cap);
      if (dry) {
        console.log(`[send-day] DRY ${p.slug}: would send single`);
      } else {
        const id = await tg("sendPhoto", f);
        markDelivered(p.slug);
        console.log(
          `[send-day] ${p.slug}: sent single, msg=${id}, marked delivered`
        );
      }
    }
  }
}

main().catch((e) => {
  console.error(
    `[send-day] FATAL: ${e instanceof Error ? e.message : String(e)}`
  );
  process.exit(1);
});
