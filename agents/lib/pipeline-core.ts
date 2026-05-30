/**
 * The editorial pipeline's orchestration, extracted into a pure-async
 * function that takes pre-fetched file contents and returns the bundle
 * of files to commit. NO direct filesystem I/O - the caller decides
 * whether to write to disk (local CLI) or commit to a preview branch
 * via the Trees API (serverless cron).
 *
 * Pipeline order (unchanged from the legacy run-article.ts):
 *   Drafter -> Link Health (with one Drafter retry on unfixable sources)
 *     -> reviewer loop (Editor / Brand / Legal / Compliance / SEO QA)
 *       with up to maxCycles Drafter revisions
 *     -> Visuals Agent -> Recraft -> Image-Brand + Image-Safety
 *     -> compose final article TS, new barrel index, updated calendar
 */
import { callAgent, reviewerPasses, type AgentName } from "./anthropic.js";
import { loadPrompt } from "./prompts.js";
import { runLinkHealth, formatReport } from "./link-health.js";
import { runVisualsStageBuffer } from "./visuals.js";
import {
  stripCodeFence,
  setHeroImage,
  enforceCalendarFields,
  extractExportName,
  camelize,
  applyIndexRegistration,
} from "./article-writer.js";
import { applyEntryUpdate } from "./calendar.js";
import type { CalendarEntry } from "./calendar.js";

const REVIEWERS: AgentName[] = [
  "editor",
  "brand",
  "legal",
  "compliance",
  "seo-qa",
];

/** Verdict per reviewer for the final cycle. */
export type ReviewerVerdicts = Partial<Record<AgentName, "PASS" | "ISSUES">>;

/** What pipeline-core hands back to the caller for persistence. */
export type DraftBundle = {
  /** Final article TS content (with heroImage spliced in if Visuals converged). */
  articleTs: string;
  /** Repo-relative target path for the article file. */
  articleFileRel: string;
  /** Camel-case binding name registered in the barrel index. */
  binding: string;
  /** Repo import path used in the barrel index. */
  importPath: string;
  /** Updated `src/content/articles/index.ts` source (post-registration). */
  indexTs: string;
  /** Updated calendar YAML (entry flipped to awaiting-approval). */
  calendarYaml: string;
  /** Optional hero WebP buffer (`/public/article-images/<slug>.webp`). */
  heroBuffer?: Buffer;
  /** Hero metadata (alt, dimensions, prompt). Mirrors what's spliced into articleTs. */
  hero?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    caption?: string;
  };
  /** Per-reviewer PASS/ISSUES verdict from the FINAL cycle (all PASS = converged). */
  verdicts: ReviewerVerdicts;
  /** Cycles the reviewer loop ran (1..maxCycles). */
  cyclesUsed: number;
  /** True if all 5 text reviewers PASSed in the final cycle. */
  converged: boolean;
};

export type RunDraftOpts = {
  /** Calendar entry to draft (from parseCalendar(...).find(...)). */
  entry: CalendarEntry;
  /** Current barrel index TS source - we modify and return updated. */
  currentIndexTs: string;
  /** Current calendar YAML source - we modify and return updated. */
  currentCalendarYaml: string;
  /** Max Drafter revision cycles (default 3, same as legacy pipeline). */
  maxCycles?: number;
  /** Skip the Visuals stage (text-only draft). */
  skipImages?: boolean;
  /** Pipeline progress logger - cron passes a no-op, CLI passes console.log. */
  log?: (msg: string) => void;
};

const noop = () => {};

// Helpers replicated from run-article.ts so this module is self-contained.

function buildDrafterMessage(entry: CalendarEntry, today: string): string {
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
- Prefer NHS, AAD, Cleveland Clinic, Mayo Clinic, BAD, WHO, DHA / MOHAP for general guideline-level claims.
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

/** Compute the repo-relative target file path for an entry. Mirrors
 *  agents/lib/article-writer.ts articleFilePath() but pure (no fs). */
function articleFileRelative(entry: CalendarEntry): string {
  if (entry.parentType === "guide") {
    return `src/content/articles/guides/${entry.slug}.ts`;
  }
  return `src/content/articles/${entry.parentType}s/${entry.parentSlug}/${entry.slug}.ts`;
}

/** Compute the import path used inside the barrel index. */
function articleImportPath(entry: CalendarEntry): string {
  if (entry.parentType === "guide") {
    return `./guides/${entry.slug}`;
  }
  return `./${entry.parentType}s/${entry.parentSlug}/${entry.slug}`;
}

/**
 * Run the full draft pipeline in-memory. Returns a DraftBundle the caller
 * persists however it likes (local fs or GitHub Trees API commit).
 *
 * Convergence semantics match legacy run-article.ts:
 * - If all 5 reviewers PASS before maxCycles, we ship.
 * - If they don't converge in maxCycles, we still return the latest draft
 *   plus verdicts so the caller can flag for manual review (the calendar
 *   status stays awaiting-approval; the caller decides whether to commit
 *   anyway or bail).
 * - Visuals stage failures (Recraft mangled, gates blocked) are
 *   non-fatal: the article ships text-only.
 */
export async function runDraftPipeline(opts: RunDraftOpts): Promise<DraftBundle> {
  const log = opts.log ?? noop;
  const maxCycles = opts.maxCycles ?? 3;
  const today = new Date().toISOString().slice(0, 10);

  log(`\n=== Drafting: ${opts.entry.title} (${opts.entry.slug}) ===`);
  log(`Parent: ${opts.entry.parentType}/${opts.entry.parentSlug} · Kind: ${opts.entry.kind}`);

  // ---- Drafter ----
  log("\n[Drafter] Generating first draft...");
  const drafterPrompt = loadPrompt("drafter");
  let draftRaw = await callAgent({
    agent: "drafter",
    systemPrompt: drafterPrompt,
    userMessage: buildDrafterMessage(opts.entry, today),
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
      throw new Error(
        `Link Health: still ${linkResult.report.externalUnfixable.length} unfixable source(s) after Drafter retry. Article cannot ship without verifiable evidence.`
      );
    }
  }
  draftTs = linkResult.content;

  // ---- Review loop ----
  let cycle = 0;
  const finalVerdicts: ReviewerVerdicts = {};
  let converged = false;
  while (cycle < maxCycles) {
    cycle++;
    log(`\n[Cycle ${cycle}/${maxCycles}] Running reviewers...`);

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
      finalVerdicts[reviewer] = passed ? "PASS" : "ISSUES";
      log(`  [${reviewer}] ${passed ? "PASS" : "ISSUES"}`);
      if (!passed) allPassed = false;
    }

    if (allPassed) {
      log(`\n[Cycle ${cycle}] All reviewers passed.`);
      converged = true;
      break;
    }

    if (cycle >= maxCycles) {
      log(`\n[Cycle ${cycle}] Max revision cycles reached.`);
      break;
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

  // ---- Visuals stage (non-blocking) ----
  let heroBuffer: Buffer | undefined;
  let heroMeta: DraftBundle["hero"];
  if (!opts.skipImages) {
    log("\n[Visuals] Generating hero illustration...");
    try {
      const hero = await runVisualsStageBuffer({
        articleContext: draftTs,
        slug: opts.entry.slug,
        maxCycles: 3,
        log,
      });
      if (hero) {
        draftTs = setHeroImage(draftTs, {
          src: hero.src,
          alt: hero.alt,
          width: hero.width,
          height: hero.height,
          prompt: hero.prompt,
          generatedBy: hero.generatedBy,
          ...(hero.caption ? { caption: hero.caption } : {}),
        });
        heroBuffer = hero.buffer;
        heroMeta = {
          src: hero.src,
          alt: hero.alt,
          width: hero.width,
          height: hero.height,
          ...(hero.caption ? { caption: hero.caption } : {}),
        };
        log(`[Visuals] Hero buffer attached (${heroBuffer.length} bytes).`);
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
  } else {
    log("\n[Visuals] Skipped (skipImages).");
  }

  // ---- Compose persistence bundle ----
  // Force the article's slug/parentType/parentSlug fields to match the
  // calendar entry, regardless of what the Drafter wrote (safety belt
  // against grammatical "improvements" that would break URL resolution).
  const finalArticleTs = enforceCalendarFields({
    tsContent: draftTs,
    entry: opts.entry,
  });
  const binding =
    extractExportName(finalArticleTs) ?? camelize(opts.entry.slug);
  const importPath = articleImportPath(opts.entry);

  // Compute updated barrel index + calendar by string transformation.
  const newIndexTs = applyIndexRegistration({
    source: opts.currentIndexTs,
    binding,
    importPath,
  });
  const newCalendarYaml = applyEntryUpdate({
    yaml: opts.currentCalendarYaml,
    slug: opts.entry.slug,
    updates: { status: "awaiting-approval" },
  });

  return {
    articleTs: finalArticleTs + "\n",
    articleFileRel: articleFileRelative(opts.entry),
    binding,
    importPath,
    indexTs: newIndexTs,
    calendarYaml: newCalendarYaml,
    heroBuffer,
    hero: heroMeta,
    verdicts: finalVerdicts,
    cyclesUsed: cycle,
    converged,
  };
}
