/**
 * Reject an editorial PR -> closes the PR -> next pipeline run redrafts.
 *
 * Usage:
 *   npm run reject-article -- --slug=<slug> --reason="What needs fixing"
 *
 * Closes the PR via GitHub API (with the reason as a comment), then flips
 * the calendar entry status to "rejected" with the reason captured. The
 * next pipeline run picks the entry up again because status="rejected"
 * triggers a redraft (the worker's brief includes the rejection notes).
 */

import "dotenv/config";
import { execSync } from "node:child_process";
import { loadCalendar, updateEntry } from "./lib/calendar.js";
import { sendMessage, escapeMd, isTelegramConfigured } from "./lib/telegram.js";
import { findOpenPrForBranch, closePr } from "./lib/github.js";

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

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
}

async function main() {
  const { slug, reason } = parseArgs();
  const entry = loadCalendar().find((e) => e.slug === slug);
  if (!entry) {
    console.error(`Calendar entry not found: ${slug}`);
    process.exit(1);
  }

  const branch = `editorial/${slug}`;
  console.log(`Looking for open PR on branch ${branch}...`);
  const pr = await findOpenPrForBranch(branch);
  if (pr) {
    console.log(`  Found PR #${pr.number}: ${pr.htmlUrl}`);
    console.log(`Closing PR with reason...`);
    await closePr(pr.number, reason);
    console.log(`  closed.`);
  } else {
    console.log(`  No open PR found - flipping calendar only.`);
  }

  // Update calendar on main with the rejection so the next pipeline run
  // sees rejection feedback in the entry's notes.
  console.log(`Pulling main and flipping calendar status to rejected...`);
  run("git checkout main");
  run("git pull --ff-only");
  updateEntry(slug, { status: "rejected", rejectionNotes: reason });
  run('git add editorial/calendar.yaml');
  const msg = `Reject ${slug}: ${reason.slice(0, 60)}`;
  run(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
  run("git push");

  console.log(`Rejected ${slug}. Next pipeline run will redraft.`);
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

main().catch((err) => {
  console.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
