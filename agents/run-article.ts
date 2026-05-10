/**
 * CliniClick editorial pipeline worker - draft and review one article.
 *
 * Usage:
 *   npm run draft                    # next due queued entry
 *   npm run draft -- --slug=X        # specific calendar entry
 *   npm run draft -- --dry           # don't call API, show what would happen
 *   npm run draft -- --max-cycles=N  # cap revision rounds (default 3)
 *
 * Pipeline order: Drafter -> Editor -> Brand -> Legal -> Compliance -> SEO QA
 *
 * On success: writes article TS file, registers it in the central index,
 * marks calendar entry as "awaiting-approval".
 * On failure: leaves calendar untouched, logs the error.
 *
 * No Telegram / PR integration yet - that comes after manual end-to-end test.
 */

import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pickEntry, updateEntry, type CalendarEntry } from "./lib/calendar.js";
import { callAgent, type AgentName } from "./lib/anthropic.js";
import { writeArticle, stripCodeFence } from "./lib/article-writer.js";
import { sendMessage, escapeMd, isTelegramConfigured } from "./lib/telegram.js";
import { runLinkHealth, formatReport } from "./lib/link-health.js";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): { slug?: string; dry: boolean; maxCycles: number } {
  const args = process.argv.slice(2);
  const out: { slug?: string; dry: boolean; maxCycles: number } = {
    dry: false,
    maxCycles: 3,
  };
  for (const arg of args) {
    if (arg === "--dry") out.dry = true;
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

function buildReviewerMessage(draftTs: string, priorIssues?: string): string {
  if (priorIssues) {
    return `Review this revised draft. The previous version had these issues that were supposedly addressed:\n\n${priorIssues}\n\n---\n\nCURRENT DRAFT:\n\n\`\`\`ts\n${draftTs}\n\`\`\``;
  }
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

async function runPipeline(entry: CalendarEntry, opts: { dry: boolean; maxCycles: number }) {
  log(`\n=== Drafting: ${entry.title} (${entry.slug}) ===`);
  log(`Parent: ${entry.parentType}/${entry.parentSlug} · Kind: ${entry.kind}`);

  if (opts.dry) {
    log("\n[DRY RUN] Would call Drafter with this brief:");
    log(buildDrafterMessage(entry));
    log("\n[DRY RUN] Would then run reviewers: " + REVIEWERS.join(" -> "));
    log("\n[DRY RUN] Exiting without API calls.");
    return;
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

  // ---- Link Health (auto-fix broken URLs before reviewers see them) ----
  log(`\n[Link Health] Validating sources + internal links...`);
  const linkResult = await runLinkHealth(draftTs);
  log(formatReport(linkResult.report));
  if (linkResult.blocking) {
    throw new Error(
      `Link Health: ${linkResult.report.externalUnfixable.length} external source(s) are unreachable and have no Wayback snapshot. Article cannot ship without verifiable evidence. See report above.`
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
      // Save the latest draft + reviewer feedback so we can inspect rather
      // than losing all the API work. Status flips to "in-review" (not
      // awaiting-approval) so it is clear this needs human triage.
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

  // ---- Write ----
  log(`\n[Write] Persisting article + updating index...`);
  const { filePath, importPath, binding } = writeArticle({ entry, tsContent: draftTs });
  log(`  file:    ${filePath}`);
  log(`  import:  ${importPath}`);
  log(`  binding: ${binding}`);

  // ---- Calendar ----
  log(`\n[Calendar] Marking ${entry.slug} as awaiting-approval`);
  updateEntry(entry.slug, { status: "awaiting-approval" });

  // ---- Telegram notification ----
  if (isTelegramConfigured()) {
    log(`\n[Telegram] Sending notification...`);
    try {
      await sendMessage(buildTelegramMessage(entry, { cycle, draftLength: draftTs.length }));
      log(`  sent.`);
    } catch (err) {
      log(`  failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    log(`\n[Telegram] not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing) - skipping notification.`);
  }

  log(`\n=== Done. Review the article on the dev server before approving. ===`);
  log(`Approve with:  npm run publish-article -- --slug=${entry.slug}`);
}

/**
 * Build the Telegram message body. MarkdownV2 - special characters in dynamic
 * values must be escaped via escapeMd; pre-formatted markdown (bold, links)
 * wraps the escaped values, never the other way around.
 */
function buildTelegramMessage(
  entry: CalendarEntry,
  meta: { cycle: number; draftLength: number }
): string {
  const previewPath =
    entry.parentType === "guide"
      ? `/learn/${entry.slug}`
      : `/${entry.parentType}s/${entry.parentSlug}/${entry.slug}`;
  const localPreview = `http://localhost:3001${previewPath}`;
  const wordEstimate = Math.round(meta.draftLength / 6);

  // MarkdownV2 escapes:
  //   - Inside the surrounding text, escape every reserved char in dynamic
  //     values via escapeMd.
  //   - Inside `inline code` (between backticks), characters do NOT need to
  //     be escaped EXCEPT backticks and backslashes - so "--slug=foo" is
  //     literal inside backticks; do not double-escape.
  return [
    `*New draft ready: ${escapeMd(entry.title)}*`,
    ``,
    `Kind: ${escapeMd(entry.kind)}  Parent: ${escapeMd(`${entry.parentType}/${entry.parentSlug}`)}`,
    `Converged in ${meta.cycle} cycle${meta.cycle === 1 ? "" : "s"}, \\~${wordEstimate} words`,
    ``,
    `Preview \\(local\\): ${escapeMd(localPreview)}`,
    ``,
    `*Approve:*`,
    `\`npm run publish-article -- --slug=${entry.slug}\``,
    ``,
    `*Reject \\(redraft on next run\\):*`,
    `\`npm run reject-article -- --slug=${entry.slug} --reason="..."\``,
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
    await runPipeline(entry, { dry: opts.dry, maxCycles: opts.maxCycles });
    process.exit(0);
  } catch (err) {
    log(`\nERROR: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
