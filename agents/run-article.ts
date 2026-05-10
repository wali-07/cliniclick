/**
 * CliniClick editorial pipeline worker - draft and review one article.
 *
 * Usage:
 *   npm run draft                     # next due queued entry
 *   npm run draft -- --slug=X         # specific calendar entry
 *   npm run draft -- --dry            # don't call API, show what would happen
 *   npm run draft -- --max-cycles=N   # cap revision rounds (default 3)
 *   npm run draft -- --local          # write to disk only, do not push or open PR
 *
 * Pipeline order: Drafter -> Link Health -> (Editor, Brand, Legal,
 * Compliance, SEO QA in sequence) -> push branch -> open PR.
 *
 * On success: creates editorial/<slug> branch, writes article + index +
 * calendar update on that branch, pushes, opens PR against main, sends
 * Telegram message with PR + Vercel preview URL. Article reaches main
 * (and therefore production) ONLY when Abdullah merges the PR.
 *
 * On reviewer-loop failure: writes the latest draft locally, captures
 * reviewer feedback to a sibling .md file, marks calendar in-review for
 * manual triage. No branch / PR is created.
 */

import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pickEntry, updateEntry, type CalendarEntry } from "./lib/calendar.js";
import { callAgent, type AgentName } from "./lib/anthropic.js";
import {
  writeArticle,
  stripCodeFence,
  articleFilePath,
} from "./lib/article-writer.js";
import { sendMessage, escapeMd, isTelegramConfigured } from "./lib/telegram.js";
import { runLinkHealth, formatReport } from "./lib/link-health.js";
import {
  requireCleanTree,
  configureForActions,
  createBranchFromMain,
  commitAndPush,
  checkoutMain,
} from "./lib/git.js";
import { openPr, vercelPreviewUrl } from "./lib/github.js";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): {
  slug?: string;
  dry: boolean;
  local: boolean;
  maxCycles: number;
} {
  const args = process.argv.slice(2);
  const out = { dry: false, local: false, maxCycles: 3 } as {
    slug?: string;
    dry: boolean;
    local: boolean;
    maxCycles: number;
  };
  for (const arg of args) {
    if (arg === "--dry") out.dry = true;
    else if (arg === "--local") out.local = true;
    else if (arg.startsWith("--slug=")) out.slug = arg.slice("--slug=".length);
    else if (arg.startsWith("--max-cycles=")) {
      out.maxCycles = Number(arg.slice("--max-cycles=".length));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Prompt loading
// ---------------------------------------------------------------------------

const PROMPTS_DIR = resolve(process.cwd(), "agents/prompts");
const ARTICLES_INDEX_REL = "src/content/articles/index.ts";
const CALENDAR_REL = "editorial/calendar.yaml";

function loadPrompt(name: AgentName): string {
  return readFileSync(resolve(PROMPTS_DIR, `${name}.md`), "utf-8");
}

// ---------------------------------------------------------------------------
// Brief construction
// ---------------------------------------------------------------------------

function buildDrafterMessage(entry: CalendarEntry): string {
  const today = new Date().toISOString().slice(0, 10);
  return `Write the article from this brief.

SLUG: ${entry.slug}
PARENT TYPE: ${entry.parentType}
PARENT SLUG: ${entry.parentSlug}
KIND: ${entry.kind}
TITLE: ${entry.title}
TARGET KEYWORDS:
${entry.keywords.map((k) => `  - ${k}`).join("\n")}
LAST REVIEWED DATE (use as today): ${today}

BRIEF:
${entry.brief ?? "(no additional brief - infer from title and parent context)"}

Output a single TypeScript code block containing the complete \`defineArticle({...})\` call. The exported binding should be named \`${camelize(entry.slug)}\`. No commentary before or after the code block.`;
}

function buildReviewerMessage(draftTs: string): string {
  return `Review this draft.\n\n\`\`\`ts\n${draftTs}\n\`\`\``;
}

function buildRevisionMessage(
  originalDraftTs: string,
  reviewerFeedback: Record<AgentName, string>
): string {
  const feedbackBlocks = Object.entries(reviewerFeedback)
    .filter(([, v]) => !v.startsWith("PASS"))
    .map(([name, v]) => `### ${name.toUpperCase()} feedback\n\n${v}`)
    .join("\n\n");

  return `The reviewers flagged the following issues with your previous draft. Apply every fix and output the corrected article as a single TypeScript code block.

PREVIOUS DRAFT:

\`\`\`ts
${originalDraftTs}
\`\`\`

---

REVIEWER FEEDBACK:

${feedbackBlocks}

---

Output the revised article as a complete \`defineArticle({...})\` TypeScript code block. No commentary.`;
}

function camelize(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

const REVIEWERS: AgentName[] = [
  "editor",
  "brand",
  "legal",
  "compliance",
  "seo-qa",
];

async function runPipeline(
  entry: CalendarEntry,
  opts: { dry: boolean; local: boolean; maxCycles: number }
) {
  log(`\n=== Drafting: ${entry.title} (${entry.slug}) ===`);
  log(`Parent: ${entry.parentType}/${entry.parentSlug} · Kind: ${entry.kind}`);
  log(`Mode:   ${opts.local ? "LOCAL (no push, no PR)" : "PR (branch + pull request)"}`);

  if (opts.dry) {
    log("\n[DRY RUN] Would call Drafter with this brief:");
    log(buildDrafterMessage(entry));
    log("\n[DRY RUN] Would then run Link Health + reviewers: " + REVIEWERS.join(" -> "));
    log("\n[DRY RUN] Exiting without API calls.");
    return;
  }

  // For PR mode, set up git and switch to a fresh branch BEFORE we write
  // anything. That way the article + calendar updates land on the branch,
  // not on local main.
  const branchName = `editorial/${entry.slug}`;
  if (!opts.local) {
    requireCleanTree();
    configureForActions();
    log(`\n[Git] Creating branch ${branchName} from origin/main`);
    createBranchFromMain(branchName);
  }

  // ---- Drafter ----
  log("\n[Drafter] Generating first draft...");
  const drafterPrompt = loadPrompt("drafter");
  let draftRaw = await callAgent({
    agent: "drafter",
    systemPrompt: drafterPrompt,
    userMessage: buildDrafterMessage(entry),
    maxTokens: 12000,
  });
  let draftTs = stripCodeFence(draftRaw);
  log(`  draft length: ${draftTs.length} chars`);

  // ---- Link Health ----
  log(`\n[Link Health] Validating sources + internal links...`);
  const linkResult = await runLinkHealth(draftTs);
  log(formatReport(linkResult.report));
  if (linkResult.blocking) {
    if (!opts.local) checkoutMain();
    throw new Error(
      `Link Health: ${linkResult.report.externalUnfixable.length} external source(s) are unreachable and have no Wayback snapshot. Article cannot ship without verifiable evidence.`
    );
  }
  draftTs = linkResult.content;

  // ---- Review loop ----
  let cycle = 0;
  while (cycle < opts.maxCycles) {
    cycle++;
    log(`\n[Cycle ${cycle}/${opts.maxCycles}] Running reviewers...`);

    const feedback: Partial<Record<AgentName, string>> = {};
    let allPassed = true;
    for (const reviewer of REVIEWERS) {
      const prompt = loadPrompt(reviewer);
      const verdict = await callAgent({
        agent: reviewer,
        systemPrompt: prompt,
        userMessage: buildReviewerMessage(draftTs),
        maxTokens: 2000,
      });
      const passed = /^PASS\b/i.test(verdict.trim());
      feedback[reviewer] = verdict;
      log(`  [${reviewer}] ${passed ? "PASS" : "ISSUES"}`);
      if (!passed) allPassed = false;
    }

    if (allPassed) {
      log(`\n[Cycle ${cycle}] All reviewers passed.`);
      break;
    }

    if (cycle >= opts.maxCycles) {
      log(`\n[Cycle ${cycle}] Max revision cycles reached. Saving for manual review.`);
      // Save the latest draft + reviewer feedback locally (not on a branch).
      // This path is for triage, not publishing - no PR is opened.
      if (!opts.local) checkoutMain();
      const { filePath } = writeArticle({ entry, tsContent: draftTs });
      const feedbackPath = filePath.replace(/\.ts$/, ".reviewer-feedback.md");
      const feedbackBody = Object.entries(feedback)
        .map(([r, v]) => `## ${r}\n\n${v}`)
        .join("\n\n---\n\n");
      writeFileSync(feedbackPath, feedbackBody, "utf-8");
      updateEntry(entry.slug, {
        status: "in-review",
        notes: `Did not converge after ${opts.maxCycles} cycles. See ${feedbackPath} for reviewer issues that remain.`,
      });
      log(`  draft:    ${filePath}`);
      log(`  feedback: ${feedbackPath}`);
      log(`\nNon-passing reviewer feedback saved. Triage manually.`);
      return;
    }

    log(`\n[Cycle ${cycle}] Sending feedback to Drafter for revision...`);
    draftRaw = await callAgent({
      agent: "drafter",
      systemPrompt: drafterPrompt,
      userMessage: buildRevisionMessage(draftTs, feedback as Record<AgentName, string>),
      maxTokens: 12000,
    });
    draftTs = stripCodeFence(draftRaw);
  }

  // ---- Write to disk (still happens in PR mode - the files go on the
  //      branch we created earlier, which we then commit + push) ----
  log(`\n[Write] Persisting article + updating index...`);
  const { filePath, importPath, binding } = writeArticle({ entry, tsContent: draftTs });
  log(`  file:    ${filePath}`);
  log(`  import:  ${importPath}`);
  log(`  binding: ${binding}`);

  // ---- Calendar status update (also happens in PR mode - on the branch) ----
  log(`\n[Calendar] Marking ${entry.slug} as awaiting-approval`);
  updateEntry(entry.slug, { status: "awaiting-approval" });

  // ---- LOCAL mode: stop here. PR mode: commit, push, open PR. ----
  if (opts.local) {
    log(`\n=== Done (LOCAL mode). Article + calendar updated on disk. ===`);
    log(`Approve with: npm run publish-article -- --slug=${entry.slug}`);
    return;
  }

  log(`\n[Git] Committing + pushing branch ${branchName}`);
  const articleRel = articleFilePath(entry).replace(process.cwd() + "\\", "").replace(process.cwd() + "/", "");
  // Use forward slashes for git (works cross-platform).
  const articleRelFwd = articleRel.replace(/\\/g, "/");
  const commitMsg = `Editorial draft: ${entry.title}\n\nslug: ${entry.slug}\nparent: ${entry.parentType}/${entry.parentSlug}\nkind: ${entry.kind}\n\nGenerated by editorial pipeline. Awaiting approval before merge.`;
  commitAndPush({
    files: [articleRelFwd, ARTICLES_INDEX_REL, CALENDAR_REL],
    message: commitMsg,
    branchName,
  });

  log(`\n[GitHub] Opening pull request...`);
  const pr = await openPr({
    branch: branchName,
    title: `Editorial: ${entry.title}`,
    body: buildPrBody(entry),
  });
  log(`  PR #${pr.number}: ${pr.htmlUrl}`);

  // Switch local checkout back to main so the working tree is clean and
  // the user is not stranded on the editorial branch.
  checkoutMain();

  // ---- Telegram notification ----
  if (isTelegramConfigured()) {
    log(`\n[Telegram] Sending notification...`);
    try {
      await sendMessage(
        buildTelegramMessage({
          entry,
          cycle,
          draftLength: draftTs.length,
          prNumber: pr.number,
          prUrl: pr.htmlUrl,
          previewUrl: vercelPreviewUrl(branchName),
        })
      );
      log(`  sent.`);
    } catch (err) {
      log(`  failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  log(`\n=== Done. Review on the preview URL, then approve via PR merge. ===`);
  log(`PR:      ${pr.htmlUrl}`);
  log(`Preview: ${vercelPreviewUrl(branchName)}`);
  log(`Approve: npm run publish-article -- --slug=${entry.slug}`);
}

function buildPrBody(entry: CalendarEntry): string {
  return `Auto-generated by the editorial pipeline. **Do not merge until reviewed by Abdullah.**

| Field | Value |
|---|---|
| Slug | \`${entry.slug}\` |
| Parent | \`${entry.parentType}/${entry.parentSlug}\` |
| Kind | \`${entry.kind}\` |
| Target keywords | ${entry.keywords.map((k) => `\`${k}\``).join(", ")} |
| Calendar due date | ${entry.dueDate} |

## Brief

${entry.brief ?? "_(no additional brief)_"}

## How to approve / reject

- Approve: merge this PR (or run \`npm run publish-article -- --slug=${entry.slug}\` which merges via API)
- Reject: close this PR (or run \`npm run reject-article -- --slug=${entry.slug} --reason="..."\` which redrafts on next pipeline run)
`;
}

function buildTelegramMessage(args: {
  entry: CalendarEntry;
  cycle: number;
  draftLength: number;
  prNumber: number;
  prUrl: string;
  previewUrl: string;
}): string {
  const wordEstimate = Math.round(args.draftLength / 6);
  return [
    `*New draft ready: ${escapeMd(args.entry.title)}*`,
    ``,
    `Kind: ${escapeMd(args.entry.kind)}  Parent: ${escapeMd(`${args.entry.parentType}/${args.entry.parentSlug}`)}`,
    `Converged in ${args.cycle} cycle${args.cycle === 1 ? "" : "s"}, \\~${wordEstimate} words`,
    ``,
    `*PR \\#${args.prNumber}:* ${escapeMd(args.prUrl)}`,
    `*Preview:* ${escapeMd(args.previewUrl)}`,
    ``,
    `*Approve \\(merges PR\\):*`,
    `\`npm run publish-article -- --slug=${args.entry.slug}\``,
    ``,
    `*Reject \\(closes PR, redraft on next run\\):*`,
    `\`npm run reject-article -- --slug=${args.entry.slug} --reason="..."\``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();
  log(`run-article pipeline starting`);
  log(`  slug:        ${opts.slug ?? "(auto-pick next due)"}`);
  log(`  dry:         ${opts.dry}`);
  log(`  local:       ${opts.local}`);
  log(`  max-cycles:  ${opts.maxCycles}`);

  const entry = pickEntry({ slug: opts.slug });
  if (!entry) {
    log("\nNo entry to process. Either no queued entries are due today, or the requested slug doesn't exist.");
    process.exit(0);
  }

  if (entry.status !== "queued" && !opts.slug) {
    log(`\nEntry ${entry.slug} has status "${entry.status}" - skipping. Pass --slug=${entry.slug} to force.`);
    process.exit(0);
  }

  try {
    await runPipeline(entry, opts);
    process.exit(0);
  } catch (err) {
    log(`\nERROR: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
