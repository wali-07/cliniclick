/**
 * Approve an editorial PR -> merges to main -> Vercel auto-deploys to prod.
 *
 * Usage:
 *   npm run publish-article -- --slug=<slug>
 *
 * The corresponding PR (head branch: editorial/<slug>) is merged via
 * GitHub API using GITHUB_TOKEN_FOR_PR_BOT. The merge takes the calendar
 * status to "published" because the editorial branch already updated
 * the calendar to "awaiting-approval"; the merged commit on main carries
 * a final status update via this script's commit on top of main.
 *
 * Wait, the cleaner version: the PR already includes the
 * status="awaiting-approval" change. After merging, this script also
 * pushes a follow-up commit on main flipping the status to "published"
 * with publishedDate = today. That way main always reflects accurate
 * publish state.
 */

import "dotenv/config";
import { execSync } from "node:child_process";
import { loadCalendar, updateEntry } from "./lib/calendar.js";
import { sendMessage, escapeMd, isTelegramConfigured } from "./lib/telegram.js";
import { findOpenPrForBranch, mergePr } from "./lib/github.js";

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

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
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

  const branch = `editorial/${slug}`;
  console.log(`Looking for open PR on branch ${branch}...`);
  const pr = await findOpenPrForBranch(branch);
  if (!pr) {
    console.error(
      `No open PR found for branch ${branch}. Either the article was rejected, the PR was merged manually, or the worker has not run yet.`
    );
    process.exit(1);
  }
  console.log(`  Found PR #${pr.number}: ${pr.htmlUrl}`);

  console.log(`Merging PR #${pr.number} (squash)...`);
  const merge = await mergePr(pr.number);
  console.log(`  merged at ${merge.sha}`);

  // After merge, pull main locally + flip calendar status to published +
  // commit + push that follow-up status change.
  const today = new Date().toISOString().slice(0, 10);
  console.log(`Pulling main and flipping calendar status to published...`);
  run("git checkout main");
  run("git pull --ff-only");
  updateEntry(slug, { status: "published", publishedDate: today });
  run('git add editorial/calendar.yaml');
  const msg = `Mark ${slug} as published on ${today}`;
  run(`git commit -m "${msg}"`);
  run("git push");
  console.log(`Published ${slug} (${entry.title}) on ${today}.`);

  if (isTelegramConfigured()) {
    try {
      await sendMessage(
        `*Published:* ${escapeMd(entry.title)}\n\nLive on production\\.`
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
