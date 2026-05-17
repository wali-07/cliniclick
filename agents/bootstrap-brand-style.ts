/**
 * Trial CliniClick's locked house-style wording for Recraft V4.
 *
 * V4 has no style_id, so "the brand style" is a fixed text spec that gets
 * prepended to every generation (BRAND_STYLE_SPEC in agents/lib/recraft.ts).
 * This script renders the SAME representative concept under several candidate
 * style wordings so Abdullah can eyeball which look IS CliniClick. The winner
 * gets pasted into BRAND_STYLE_SPEC and every hero then inherits it.
 *
 *   npm run bootstrap-brand-style -- --candidates
 *
 * Output: ./brand-style-candidates/<name>.png (+ specs.txt mapping each file
 * to the exact wording that produced it). Gitignored scratch.
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateImage, recraftConfigured, BRAND_HEX } from "./lib/recraft.js";

const OUT_DIR = resolve(process.cwd(), "brand-style-candidates");

/** Representative CliniClick concept so the winner generalises to articles. */
const BASE_CONCEPT =
  "Conceptual hero illustration for an evidence-based aesthetic-medicine guide article: an abstract layered skin cross-section with soft geometric shapes, calm and trustworthy, generous negative space.";

const PALETTE = `Brand palette only: brand purple ${BRAND_HEX.purple} accent, deep navy ${BRAND_HEX.navy} structure, clean off-white ${BRAND_HEX.offWhite} background, soft purple tints. No human face, no realistic skin, no text, no logos, not photorealistic, no before/after.`;

/** Candidate house-style wordings to compare. */
const CANDIDATES: { name: string; spec: string }[] = [
  {
    name: "flat-vector",
    spec: "Flat vector editorial illustration, crisp clean shapes, minimal, modern.",
  },
  {
    name: "soft-grain",
    spec: "Flat illustration with subtle paper grain, soft gradients, gentle and warm.",
  },
  {
    name: "line-accent",
    spec: "Editorial illustration: flat fills with fine line accents and light linework.",
  },
  {
    name: "geometric",
    spec: "Structured geometric illustration, calm, modern, balanced composition.",
  },
  {
    name: "organic-soft",
    spec: "Soft rounded organic shapes, friendly, approachable, light and airy.",
  },
  {
    name: "editorial-diagram",
    spec: "Simplified explanatory-diagram aesthetic, clear visual hierarchy, science-editorial feel.",
  },
];

function log(...a: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...a);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.includes("--candidates")) {
    log("Usage:\n  npm run bootstrap-brand-style -- --candidates");
    return;
  }
  if (!recraftConfigured()) {
    log("RECRAFT_API_KEY not set. Add it to .env first.");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  log(`Generating ${CANDIDATES.length} candidate frames into ${OUT_DIR}`);
  log(`(Cost ~ $${(CANDIDATES.length * 0.04).toFixed(2)} on recraftv4 raster.)`);

  const specLines: string[] = [];
  for (const c of CANDIDATES) {
    const prompt = `${c.spec} ${BASE_CONCEPT} ${PALETTE}`;
    try {
      const [img] = await generateImage({ prompt, n: 1, rawPrompt: true });
      writeFileSync(resolve(OUT_DIR, `${c.name}.png`), img.buffer);
      specLines.push(`${c.name}.png\n  ${c.spec}\n`);
      log(`  ${c.name}.png`);
    } catch (err) {
      log(`  ${c.name} FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }
  writeFileSync(
    resolve(OUT_DIR, "specs.txt"),
    `CliniClick brand-style candidates\n\n${specLines.join("\n")}`,
    "utf-8"
  );

  log(
    `\nDone. Open ${OUT_DIR}, pick the one that IS the CliniClick look.\n` +
      `Tell me the filename - I'll lock its spec into BRAND_STYLE_SPEC\n` +
      `(agents/lib/recraft.ts) so every hero inherits it, then run the backfill.`
  );
}

main().catch((e) => {
  log(`FATAL: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
