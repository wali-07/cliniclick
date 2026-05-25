/**
 * Crawl-stage helper: read editorial/social-calendar.yaml and Telegram
 * Abdullah the plan for the current week (Mon-Sun from --from, default
 * today). Plain text (no parse_mode) so there is no MarkdownV2 escaping and
 * it is unicode-safe via the JSON Bot API. Telegram stays the single
 * approval surface (project_social_media). Nothing publishes.
 *
 * Usage: npx tsx agents/social-plan-telegram.ts [--from=YYYY-MM-DD]
 */

import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

type Post = {
  topic: string;
  slug: string;
  article?: string;
  scheduledFor: string;
  status: "draft" | "delivered" | "posted" | "skipped";
  notes?: string;
};

function arg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.error("[social-plan] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing");
    process.exit(1);
  }

  const from = arg("from") || new Date().toISOString().slice(0, 10);
  const days = Math.max(1, parseInt(arg("days") || "7", 10) || 7);
  const to = addDays(from, days - 1);
  const dow = (iso: string) =>
    DOW[new Date(`${iso}T00:00:00Z`).getUTCDay()];

  const raw = readFileSync(
    resolve(process.cwd(), "editorial/social-calendar.yaml"),
    "utf-8"
  );
  const { posts } = yaml.load(raw) as { posts: Post[] };

  const window = posts
    .filter((p) => p.scheduledFor >= from && p.scheduledFor <= to)
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  const lines: string[] = [];
  lines.push(
    days === 1
      ? `CliniClick - what to post on ${from} (${dow(from)})`
      : `CliniClick - Instagram plan ${from} (${dow(from)}) to ${to} (${dow(to)})`
  );
  lines.push("");
  lines.push("Strategy: 4-5 feed posts/week + Stories daily. Mix of Reels,");
  lines.push("carousels and single object-pun images. Sun = Stories only.");
  lines.push("");
  if (window.length === 0) {
    lines.push("(No feed post scheduled - Stories only.)");
  }
  for (const p of window) {
    const tag =
      p.status === "delivered"
        ? "[READY - in your Telegram, just post it]"
        : p.status === "posted"
          ? "[already posted]"
          : "[NEW - full brief below]";
    lines.push(`${dow(p.scheduledFor)} ${p.scheduledFor}  ${tag}`);
    lines.push(`  ${p.topic}`);
    if (p.notes) lines.push(`  ${p.notes}`);
    if (p.article) lines.push(`  -> ${p.article}`);
    const briefPath = resolve(
      process.cwd(),
      `editorial/social-briefs/${p.slug}.txt`
    );
    if (existsSync(briefPath)) {
      lines.push("");
      lines.push(readFileSync(briefPath, "utf-8").trimEnd());
    }
    lines.push("");
  }
  lines.push("Nothing posts without your go - this is the plan for approval.");

  const text = lines.join("\n");

  // Telegram caps a message at 4096 chars; chunk on line boundaries.
  const chunks: string[] = [];
  let buf = "";
  for (const line of text.split("\n")) {
    if (buf.length + line.length + 1 > 3800) {
      chunks.push(buf);
      buf = "";
    }
    buf += (buf ? "\n" : "") + line;
  }
  if (buf) chunks.push(buf);

  const ids: number[] = [];
  for (const chunk of chunks) {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      console.error(
        `[social-plan] Telegram failed ${res.status}: ${await res.text()}`
      );
      process.exit(1);
    }
    const data = (await res.json()) as { result: { message_id: number } };
    ids.push(data.result.message_id);
  }
  console.log(
    `[social-plan] sent ${window.length} day(s) in ${chunks.length} message(s), message_ids=${ids.join(",")}`
  );
}

main().catch((e) => {
  console.error(`[social-plan] FATAL: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
