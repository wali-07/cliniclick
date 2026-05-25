/**
 * Free Telegram feedback watcher ($0 - Telegram Bot API getUpdates has no
 * cost; no Claude model in the loop). Polls Abdullah's replies in the bot
 * chat and acts on the most recent DELIVERED post:
 *
 *   - approval ("ok", "good", "perfect", "post it", thumbs-up, ...) ->
 *     friendly ack; that is his post for the day. No status change (we
 *     cannot verify it actually went live on Instagram - he posts it).
 *   - "skip" / "skip today"  -> mark that calendar entry skipped + ack.
 *   - anything else (a change request) -> append to
 *     editorial/social-feedback-inbox.md + instant ack ("Got it -
 *     reworking, I will resend"). Claude applies substantive copy/design
 *     edits in-session same-day, re-gated, then resends. (Unattended AI
 *     rewrite would need a paid routine - deliberately not done.)
 *
 * Offset is persisted so each reply is processed exactly once. First ever
 * run only records the latest update_id (no backlog action), so old
 * messages are never retro-processed.
 *
 * Usage: npx tsx agents/social-feedback.ts
 */

import "dotenv/config";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const CAL = resolve(ROOT, "editorial/social-calendar.yaml");
const OFFSET = resolve(ROOT, "social-crawl/feedback-offset.json");
const INBOX = resolve(ROOT, "editorial/social-feedback-inbox.md");

type Post = { topic: string; slug: string; scheduledFor: string; status: string };

const APPROVE = new Set([
  "ok", "okay", "good", "great", "perfect", "post", "post it", "posted",
  "approved", "approve", "yes", "y", "love it", "looks good", "nice",
  "👍", "✅", "🔥", "done",
]);
const SKIP = new Set(["skip", "skip today", "skip it", "pass"]);

function tgToken(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN missing");
  return t;
}

async function tg(method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${tgToken()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ result: any }>;
}

function readOffset(): number | null {
  if (!existsSync(OFFSET)) return null;
  try {
    return (JSON.parse(readFileSync(OFFSET, "utf-8")) as { offset: number }).offset;
  } catch {
    return null;
  }
}

function writeOffset(o: number) {
  writeFileSync(OFFSET, JSON.stringify({ offset: o }));
}

/** Most recent delivered post (what he is reacting to today). */
function latestDelivered(): Post | null {
  const { posts } = yaml.load(readFileSync(CAL, "utf-8")) as { posts: Post[] };
  const d = posts
    .filter((p) => p.status === "delivered")
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));
  return d[0] ?? null;
}

function setStatus(slug: string, status: string) {
  const lines = readFileSync(CAL, "utf-8").split(/\r?\n/);
  let inEntry = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`slug: ${slug}`)) inEntry = true;
    if (inEntry && /^\s+status:\s/.test(lines[i])) {
      lines[i] = lines[i].replace(/status:\s*\w+/, `status: ${status}`);
      break;
    }
    if (inEntry && /^\s+- topic:/.test(lines[i])) break;
  }
  writeFileSync(CAL, lines.join("\n"));
}

async function main() {
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!chatId) {
    console.error("[feedback] TELEGRAM_CHAT_ID missing");
    process.exit(1);
  }

  const stored = readOffset();
  const params: Record<string, unknown> = { timeout: 0, allowed_updates: ["message"] };
  if (stored !== null) params.offset = stored + 1;
  const { result: updates } = await tg("getUpdates", params);

  if (!Array.isArray(updates) || updates.length === 0) {
    console.log("[feedback] no new replies.");
    return;
  }

  // First ever run: just record the latest id, never retro-act on backlog.
  if (stored === null) {
    const maxId = Math.max(...updates.map((u: any) => u.update_id));
    writeOffset(maxId);
    console.log(`[feedback] initialised offset at ${maxId} (no backlog action).`);
    return;
  }

  let lastId = stored;
  for (const u of updates) {
    lastId = Math.max(lastId, u.update_id);
    const msg = u.message;
    if (!msg?.text || String(msg.chat?.id) !== String(chatId)) continue;

    const text = String(msg.text).trim();
    const norm = text.toLowerCase().replace(/[.! ]+$/, "");
    const target = latestDelivered();

    if (APPROVE.has(norm)) {
      await tg("sendMessage", {
        chat_id: chatId,
        text: `Locked in - that's your post for today${
          target ? ` (${target.topic})` : ""
        }. Go ahead and post it whenever you like.`,
      });
      console.log(`[feedback] approval on "${target?.slug}".`);
    } else if (SKIP.has(norm)) {
      if (target) setStatus(target.slug, "skipped");
      await tg("sendMessage", {
        chat_id: chatId,
        text: `Skipped${target ? ` "${target.topic}"` : ""} - it won't go out. I'll line up the next one.`,
      });
      console.log(`[feedback] skipped "${target?.slug}".`);
    } else {
      // Change request - capture + instant ack; Claude applies it in-session.
      const stamp = new Date().toISOString();
      appendFileSync(
        INBOX,
        `\n## ${stamp} - ${target ? target.slug : "unknown"}\n${text}\n`
      );
      await tg("sendMessage", {
        chat_id: chatId,
        text: "Got it - reworking this and I'll resend the updated version. (Approve with 'ok' once you're happy.)",
      });
      console.log(`[feedback] change request captured for "${target?.slug}".`);
    }
  }
  writeOffset(lastId);
}

main().catch((e) => {
  console.error(`[feedback] FATAL: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
