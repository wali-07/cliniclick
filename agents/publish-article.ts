/**
 * Mark an article as published in editorial/calendar.yaml.
 *
 * Usage:
 *   npm run publish-article -- --slug=<slug>
 *
 * This is the human approval step in v1: you review the draft on the dev
 * server, decide it ships, then run this command to flip the calendar entry
 * from "awaiting-approval" to "published". When the Telegram bot ships in
 * v2, that one-tap Approve button will call the same logic.
 */

import "dotenv/config";
import { loadCalendar, updateEntry } from "./lib/calendar.js";
import { sendMessage, escapeMd, isTelegramConfigured } from "./lib/telegram.js";

function parseArgs(): { slug: string } {
  const args = process.argv.slice(2);
  const slug = args
    .find((a) => a.startsWith("--slug="))
    ?.slice("--slug=".length);
  if (!slug) {
    console.error("Usage: npm run publish-article -- --slug=<slug>");
    process.exit(1);
  }
  return { slug };
}

async function main() {
  const { slug } = parseArgs();
  const entry = loadCalendar().find((e) => e.slug === slug);
  if (!entry) {
    console.error(`Calendar entry not found: ${slug}`);
    process.exit(1);
  }
  if (entry.status === "published") {
    console.log(`Already published on ${entry.publishedDate ?? "?"}.`);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  updateEntry(slug, { status: "published", publishedDate: today });
  console.log(`Published ${slug} (${entry.title}) on ${today}.`);

  if (isTelegramConfigured()) {
    try {
      await sendMessage(
        `*Published:* ${escapeMd(entry.title)}\n\nLive on dev\\. Commit \\& push to ship to production\\.`
      );
    } catch {
      // non-fatal
    }
  }
}

main();
