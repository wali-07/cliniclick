/**
 * CliniClick editorial pipeline worker - draft and review one article.
 *
 * Usage:
 *   npm run draft                     # next due queued entry (LOCAL by default)
 *   npm run draft -- --slug=X         # specific calendar entry
 *   npm run draft -- --dry            # don't call API, show what would happen
 *   npm run draft -- --max-cycles=N   # cap revision rounds (default 3)
 *   npm run draft -- --push           # opt-in to branch+push+PR (see SAFETY below)
 *   npm run draft -- --local          # explicit local (also the DEFAULT now)
 *
 * Pipeline order: Drafter -> Link Health -> (Editor, Brand, Legal,
 * Compliance, SEO QA in sequence) -> Visuals -> write to disk.
 * In --push mode (when EDITORIAL_PUSH_ENABLED=true is also set): then
 * branch + commit + push + open PR.
 *
 * === SAFETY: GitHub auto-push gated, default OFF ===
 *
 * GitHub suspended @wali-07 twice (2026-05-09..16, again ..21) under
 * abuse-detection signals consistent with high-velocity automation:
 * many short-lived branches + bot-authored PRs + same-minute open+merge.
 * The article pipeline is the single biggest compounding source of
 * those events, so the default behaviour is now LOCAL-only:
 *
 *   - Article + index + calendar update land in the working tree.
 *   - No branch, no commit, no push, no PR.
 *   - Telegram still notifies (the worker sends from within the run).
 *   - Abdullah reviews + bundles into one batched commit + push when he
 *     decides the velocity is sustainable.
 *
 * To re-enable auto-push you must do BOTH:
 *   1. Pass --push on the command line
 *   2. Set EDITORIAL_PUSH_ENABLED=true in the environment
 *
 * Passing only one of those bails with a clear message. This is
 * deliberate: a forgotten flag or a stale env var alone cannot trigger
 * a push. When you DO eventually re-enable, do it sparingly - one push
 * per ~5 articles is sustainable, one per article was not.
 *
 * On reviewer-loop failure (any mode): writes the latest draft, captures
 * reviewer feedback to a sibling .md file, marks calendar in-review for
 * manual triage. No branch / PR is created.
 */

import "dotenv/config";
import { writeFileSync } from "node:fs";
import { pickEntry, updateEntry, type CalendarEntry } from "./lib/calendar.js";
import {
  callAgent,
  reviewerPasses,
  type AgentName,
} from "./lib/anthropic.js";
import {
  writeArticle,
  stripCodeFence,
  articleFilePath,
  setHeroImage,
} from "./lib/article-writer.js";
import { runVisualsStage } from "./lib/visuals.js";
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
import { loadPrompt } from "./lib/prompts.js";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): {
  slug?: string;
  dry: boolean;
  push: boolean;
  maxCycles: number;
  skipImages: boolean;
} {
  const args = process.argv.slice(2);
  const out = { dry: false, push: false, maxCycles: 3, skipImages: false } as {
    slug?: string;
    dry: boolean;
    push: boolean;
    maxCycles: number;
    skipImages: boolean;
  };
  for (const arg of args) {
    if (arg === "--dry") out.dry = true;
    // --local is the DEFAULT now (push gated behind --push + env var); kept
    // as an explicit no-op for back-compat with scripts/docs/memory that
    // still pass it.
    else if (arg === "--local") {
      /* default */
    } else if (arg === "--push") out.push = true;
    else if (arg === "--skip-images") out.skipImages = true;
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

const ARTICLES_INDEX_REL = "src/content/articles/index.ts";
const CALENDAR_REL = "editorial/calendar.yaml";

// loadPrompt now imported from ./lib/prompts.js (bundled at build time
// from agents/prompts/*.md so the same code runs locally and serverless).

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

function buildSourceSwapMessage(
  draftTs: string,
  unfixable: { url: string; status?: number; error?: string }[]
): string {
  const list = unfixable
    .map((u) => `- ${u.url}  (status: ${u.status ?? u.error ?? "unknown"})`)
    .join("\n");
  return `The following source URL${unfixable.length === 1 ? "" : "s"} in your draft cannot be reached and have no archived version. Either the URL is wrong (e.g., the path was hallucinated) or the page has been removed.

UNREACHABLE SOURCE${unfixable.length === 1 ? "" : "S"}:
${list}

Re-output the COMPLETE article as a defineArticle({...}) TypeScript code block, with the broken source(s) replaced by alternative real URLs from the same publishers (or other tier-1 / tier-2 publishers from the source canon if no alternative exists at the original publisher).

Rules for the replacement URLs:
- Use only canonical, well-known URL paths. Do not invent URL paths you are not certain exist.
- Prefer NHS, AAD, Cleveland Clinic, Mayo Clinic, NHS, BAD, WHO, DHA / MOHAP for general guideline-level claims.
- Only cite a journal article if you are certain of the exact DOI or canonical URL.
- If you cannot find a verifiable replacement source for a particular claim, REMOVE that claim and its inline citation rather than ship a broken source.

Keep the rest of the article unchanged. Output the full article as one TypeScript code block, no commentary.

DRAFT TO REVISE:

\`\`\`ts
${draftTs}
\`\`\``;
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
  opts: {
    dry: boolean;
    push: boolean;
    maxCycles: number;
    skipImages: boolean;
  }
) {
  log(`\n=== Drafting: ${entry.title} (${entry.slug}) ===`);
  log(`Parent: ${entry.parentType}/${entry.parentSlug} · Kind: ${entry.kind}`);

  // GitHub-suspension safety: pushing requires BOTH --push and an explicit
  // env var. Bail clearly if --push was passed without the env var, so a
  // forgotten env or a stale flag cannot accidentally trigger a push.
  if (opts.push && process.env.EDITORIAL_PUSH_ENABLED !== "true") {
    log(
      `\n[SAFETY] --push was passed but EDITORIAL_PUSH_ENABLED is not set to "true".`
    );
    log(
      `         Refusing to push. See the SAFETY block at the top of run-article.ts.`
    );
    log(
      `         To proceed: set EDITORIAL_PUSH_ENABLED=true in the env AND pass --push.`
    );
    log(`         Or drop --push to run in default LOCAL mode.`);
    process.exit(2);
  }
  log(
    `Mode:   ${
      opts.push ? "PUSH (branch + commit + push + PR)" : "LOCAL (no git ops)"
    }`
  );

  if (opts.dry) {
    log("\n[DRY RUN] Would call Drafter with this brief:");
    log(buildDrafterMessage(entry));
    log("\n[DRY RUN] Would then run Link Health + reviewers: " + REVIEWERS.join(" -> "));
    log(
      "\n[DRY RUN] Then Visuals stage: " +
        (opts.skipImages
          ? "SKIPPED (--skip-images)"
          : "Visuals Agent -> Recraft -> Image-Brand + Image-Safety review")
    );
    log("\n[DRY RUN] Exiting without API calls.");
    return;
  }

  // For PUSH mode, set up git and switch to a fresh branch BEFORE we write
  // anything. That way the article + calendar updates land on the branch,
  // not on local main. LOCAL mode (default) skips all git operations.
  const branchName = `editorial/${entry.slug}`;
  if (opts.push) {
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

  // ---- Link Health (with one Drafter retry on unfixable sources) ----
  log(`\n[Link Health] Validating sources + internal links...`);
  let linkResult = await runLinkHealth(draftTs);
  log(formatReport(linkResult.report));
  if (linkResult.blocking) {
    log(
      `\n[Link Health] ${linkResult.report.externalUnfixable.length} unfixable source(s). Asking Drafter to swap them.`
    );
    draftRaw = await callAgent({
      agent: "drafter",
      systemPrompt: drafterPrompt,
      userMessage: buildSourceSwapMessage(draftTs, linkResult.report.externalUnfixable),
      maxTokens: 12000,
    });
    draftTs = stripCodeFence(draftRaw);
    log(`  retry draft length: ${draftTs.length} chars`);
    log(`\n[Link Health] Re-validating after swap...`);
    linkResult = await runLinkHealth(draftTs);
    log(formatReport(linkResult.report));
    if (linkResult.blocking) {
      if (opts.push) checkoutMain();
      throw new Error(
        `Link Health: still ${linkResult.report.externalUnfixable.length} unfixable source(s) after Drafter retry. Article cannot ship without verifiable evidence.`
      );
    }
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
      const passed = reviewerPasses(verdict);
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
      if (opts.push) checkoutMain();
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

  // ---- Visuals stage (after text review converges, before write) ----
  // Non-blocking: an approved article still ships if imagery can't converge.
  let heroImageRel: string | undefined;
  if (opts.skipImages) {
    log("\n[Visuals] Skipped (--skip-images).");
  } else {
    log("\n[Visuals] Generating hero illustration...");
    try {
      const hero = await runVisualsStage({
        articleContext: draftTs,
        slug: entry.slug,
        maxCycles: 3,
        log: (m) => log(m),
      });
      if (hero) {
        draftTs = setHeroImage(draftTs, hero);
        heroImageRel = `public/article-images/${entry.slug}.webp`;
        log(`[Visuals] Hero image attached: ${hero.src}`);
      } else {
        log("[Visuals] No hero image produced - article ships text-only.");
      }
    } catch (err) {
      log(
        `[Visuals] Non-fatal error - shipping text-only: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
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

  // ---- LOCAL mode: send Telegram + stop. PUSH mode: commit, push, open
  //      PR, then send Telegram with the PR/preview links. Telegram fires
  //      in BOTH modes because it is the review surface - the local-mode
  //      notification just points at the local file path instead of a PR.
  if (!opts.push) {
    if (isTelegramConfigured()) {
      log(`\n[Telegram] Sending local-mode notification...`);
      try {
        await sendMessage(
          buildTelegramMessageLocal({
            entry,
            cycle,
            draftLength: draftTs.length,
            filePath: articleFilePath(entry),
          })
        );
        log(`  sent.`);
      } catch (err) {
        log(
          `  failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
    log(`\n=== Done (LOCAL mode). Article + calendar updated on disk. ===`);
    log(`Review the working tree; Abdullah bundles into a manual commit.`);
    log(`Approve with: npm run publish-article -- --slug=${entry.slug}`);
    return;
  }

  log(`\n[Git] Committing + pushing branch ${branchName}`);
  const articleRel = articleFilePath(entry).replace(process.cwd() + "\\", "").replace(process.cwd() + "/", "");
  // Use forward slashes for git (works cross-platform).
  const articleRelFwd = articleRel.replace(/\\/g, "/");
  const commitMsg = `Editorial draft: ${entry.title}\n\nslug: ${entry.slug}\nparent: ${entry.parentType}/${entry.parentSlug}\nkind: ${entry.kind}\n\nGenerated by editorial pipeline. Awaiting approval before merge.`;
  commitAndPush({
    files: [
      articleRelFwd,
      ARTICLES_INDEX_REL,
      CALENDAR_REL,
      ...(heroImageRel ? [heroImageRel] : []),
    ],
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

function buildTelegramMessageLocal(args: {
  entry: CalendarEntry;
  cycle: number;
  draftLength: number;
  filePath: string;
}): string {
  const wordEstimate = Math.round(args.draftLength / 6);
  const relPath = args.filePath
    .replace(process.cwd() + "\\", "")
    .replace(process.cwd() + "/", "")
    .replace(/\\/g, "/");
  return [
    `*New draft ready \\(LOCAL\\): ${escapeMd(args.entry.title)}*`,
    ``,
    `Kind: ${escapeMd(args.entry.kind)}  Parent: ${escapeMd(`${args.entry.parentType}/${args.entry.parentSlug}`)}`,
    `Converged in ${args.cycle} cycle${args.cycle === 1 ? "" : "s"}, \\~${wordEstimate} words`,
    ``,
    `*File:* \`${escapeMd(relPath)}\``,
    ``,
    `Local mode \\- no PR or preview URL\\. Review the file in the working tree\\.`,
    ``,
    `*Approve when batched commit lands:*`,
    `\`npm run publish-article -- --slug=${args.entry.slug}\``,
  ].join("\n");
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
  log(`  push:        ${opts.push}`);
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
