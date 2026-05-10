/**
 * Mark an article as rejected with feedback so the next pipeline run picks
 * it up and redrafts with the feedback in the brief.
 *
 * Usage:
 *   npm run reject-article -- --slug=<slug> --reason="What needs fixing"
 */

import "dotenv/config";
import { loadCalendar, updateEntry } from "./lib/calendar.js";
import { sendMessage, escapeMd, isTelegramConfigured } from "./lib/telegram.js";

function parseArgs(): { slug: string; reason: string } {
  const args = process.argv.slice(2);
  const slug = args
    .find((a) => a.startsWith("--slug="))
    ?.slice("--slug=".length);
  const reason = args
    .find((a) => a.startsWith("--reason="))
    ?.slice("--reason=".length)
    .replace(/^["']|["']$/g, "");
  if (!slug || !reason) {
    console.error('Usage: npm run reject-article -- --slug=<slug> --reason="..."');
    process.exit(1);
  }
  return { slug, reason };
}

async function main() {
  const { slug, reason } = parseArgs();
  const entry = loadCalendar().find((e) => e.slug === slug);
  if (!entry) {
    console.error(`Calendar entry not found: ${slug}`);
    process.exit(1);
  }

  updateEntry(slug, { status: "rejected", rejectionNotes: reason });
  console.log(`Rejected ${slug}. Will redraft on next pipeline run.`);
  console.log(`Reason: ${reason}`);

  if (isTelegramConfigured()) {
    try {
      await sendMessage(
        `*Rejected:* ${escapeMd(entry.title)}\n\nReason: ${escapeMd(reason)}\n\nWill redraft on next pipeline run\\.`
      );
    } catch {
      // non-fatal
    }
  }
}

main();
