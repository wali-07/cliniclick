/**
 * Backfill hero illustrations onto already-published articles.
 *
 * Usage:
 *   npm run backfill-images -- --dry            # list articles + batches, no API
 *   npm run backfill-images -- --batch=1        # process batch 1 (4 articles)
 *   npm run backfill-images -- --slug=what-is-acne
 *   npm run backfill-images -- --all            # every article missing a hero
 *   npm run backfill-images -- --batch=1 --force # regenerate even if present
 *
 * Decisions baked in:
 *  - Batches of 4 (Abdullah's call) -> 3 reviewable PRs for the 12 articles.
 *  - LOCAL ONLY. This never commits, pushes, or opens a PR. It edits the
 *    article .ts files in place; shipping goes through the standing
 *    manual-bridge + per-agent-report + explicit-confirmation process.
 *  - Idempotent: skips articles that already carry a // @generated-hero
 *    block unless --force (regeneration costs Recraft credits).
 */

import "dotenv/config";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  rmSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { runVisualsStage } from "./lib/visuals.js";
import { setHeroImage, clearHeroImage } from "./lib/article-writer.js";
import { recraftConfigured, PUBLIC_IMAGE_DIR } from "./lib/recraft.js";

const ARTICLES_DIR = resolve(process.cwd(), "src/content/articles");
const BATCH_SIZE = 4;

type ArticleFile = { path: string; slug: string; hasHero: boolean };

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith(".ts") && name !== "index.ts") out.push(full);
  }
  return out;
}

function discover(): ArticleFile[] {
  return walk(ARTICLES_DIR)
    .map((path) => {
      const content = readFileSync(path, "utf-8");
      const slug = content.match(/slug:\s*"([a-z0-9-]+)"/)?.[1];
      if (!slug) return null;
      return {
        path,
        slug,
        hasHero: content.includes("// @generated-hero"),
      };
    })
    .filter((x): x is ArticleFile => x !== null)
    // Deterministic order so --batch=N is stable across runs.
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    dry: false,
    all: false,
    force: false,
    reset: false,
    slug: undefined as string | undefined,
    batch: undefined as number | undefined,
  };
  for (const a of args) {
    if (a === "--dry") out.dry = true;
    else if (a === "--all") out.all = true;
    else if (a === "--force") out.force = true;
    else if (a === "--reset") out.reset = true;
    else if (a.startsWith("--slug=")) out.slug = a.slice(7);
    else if (a.startsWith("--batch=")) out.batch = Number(a.slice(8));
  }
  return out;
}

function log(...a: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...a);
}

async function main() {
  const opts = parseArgs();
  const all = discover();

  log(`Discovered ${all.length} article files. Batches of ${BATCH_SIZE}:`);
  for (let i = 0; i < all.length; i += BATCH_SIZE) {
    const b = i / BATCH_SIZE + 1;
    const slugs = all.slice(i, i + BATCH_SIZE).map((a) => a.slug);
    log(`  batch ${b}: ${slugs.join(", ")}`);
  }

  let targets: ArticleFile[];
  if (opts.slug) {
    targets = all.filter((a) => a.slug === opts.slug);
    if (targets.length === 0) {
      log(`\nNo article with slug "${opts.slug}".`);
      process.exit(1);
    }
  } else if (opts.batch) {
    const start = (opts.batch - 1) * BATCH_SIZE;
    targets = all.slice(start, start + BATCH_SIZE);
  } else if (opts.all) {
    targets = all;
  } else {
    log(
      "\nNothing to do. Pass --batch=N, --slug=X, or --all (and --dry to preview)."
    );
    process.exit(0);
  }

  // --reset implies --force (regenerate even where a hero already exists).
  if (!opts.force && !opts.reset) {
    targets = targets.filter((t) => !t.hasHero);
  }

  log(
    `\nTargets (${targets.length}): ${
      targets.map((t) => t.slug).join(", ") || "(none - all already have heroes)"
    }`
  );

  if (opts.dry) {
    log("\n[DRY] Would run Visuals -> Recraft -> Image-Brand + Image-Safety");
    log("[DRY] Would write WebP to /public/article-images and patch the .ts");
    log("[DRY] No commit / push (backfill is LOCAL-ONLY by design).");
    return;
  }

  if (!recraftConfigured()) {
    log(
      "\nRECRAFT_API_KEY not set. Add it to .env before running a real backfill."
    );
    process.exit(1);
  }

  const results: { slug: string; ok: boolean; note: string }[] = [];
  for (const t of targets) {
    log(`\n=== ${t.slug} ===`);
    let tsContent = readFileSync(t.path, "utf-8");
    if (opts.reset && t.hasHero) {
      // Clean slate: drop the prior (rejected) hero + its webp so a failed
      // re-run falls back to text-only rather than keeping a stale image.
      tsContent = clearHeroImage(tsContent);
      writeFileSync(t.path, tsContent, "utf-8");
      rmSync(resolve(PUBLIC_IMAGE_DIR, `${t.slug}.webp`), { force: true });
      log("  reset: cleared prior hero + webp");
    }
    try {
      const hero = await runVisualsStage({
        articleContext: tsContent,
        slug: t.slug,
        maxCycles: 3,
        log: (m) => log(m),
      });
      if (!hero) {
        results.push({ slug: t.slug, ok: false, note: "no image converged" });
        continue;
      }
      writeFileSync(t.path, setHeroImage(tsContent, hero), "utf-8");
      results.push({ slug: t.slug, ok: true, note: hero.src });
      log(`  patched ${t.path}`);
    } catch (err) {
      results.push({
        slug: t.slug,
        ok: false,
        note: err instanceof Error ? err.message : String(err),
      });
      log(`  ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  log(`\n=== Backfill summary ===`);
  for (const r of results) {
    log(`  ${r.ok ? "OK  " : "FAIL"} ${r.slug}  ${r.note}`);
  }
  log(
    `\n${results.filter((r) => r.ok).length}/${results.length} succeeded. ` +
      `Files edited locally only - review, then ship via the manual-bridge PR process.`
  );
}

main().catch((e) => {
  log(`\nFATAL: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
