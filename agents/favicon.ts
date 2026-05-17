/**
 * CliniClick favicon / app-icon + Instagram profile mark.
 *
 * FINAL MARK (chosen 2026-05-17): a clean WHITE filled circle, a thin crisp
 * dark-navy #001435 outer border ring, and ONE bold centred elegant SERIF
 * capital "C" in CliniClick purple #A75CFF. Selfologi-style badge. The
 * winning render was refine-1 from `--refine`.
 *
 * Earlier hand-built SVG concepts and the sparkle/droplet/leaf "aesthetic
 * hint" exploration were dropped - this file keeps only the workflow that
 * produced and ships the chosen mark.
 *
 * Ship workflow (output goes to ./favicon-crawl/, which is gitignored):
 *   npm run favicon -- --refine                 # 3 takes, pick the best
 *   npm run favicon -- --tighten=favicon-crawl/refine-1.png   # trim white
 *   npm run favicon -- --emit-file=favicon-crawl/refine-1.tight.png
 *                                               # -> icon-16/32/48/180/512 + instagram.png
 */

import "dotenv/config";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { generateImage, recraftConfigured } from "./lib/recraft.js";

const OUT = resolve(process.cwd(), "favicon-crawl");

async function refine(): Promise<void> {
  if (!recraftConfigured()) {
    // eslint-disable-next-line no-console
    console.log("RECRAFT_API_KEY not set in .env");
    process.exit(1);
  }
  // Modelled on the Selfologi profile mark (white badge, thin ring, one bold
  // centred letter) but: letter C, CliniClick purple, navy border.
  const prompt =
    "A premium circular app-icon badge: a clean WHITE filled circle that fills the frame, with a thin crisp DARK NAVY #001435 outer border ring, and ONE single bold centred elegant SERIF capital letter 'C' in vibrant CliniClick purple #A75CFF, confident classic serif with tasteful thick-thin contrast, perfectly centred with generous even margin. Sophisticated high-end digital-wellness brand mark, minimal and timeless. Flat, crisp, premium. White background inside the circle. No text or words, only the single letter C, not childish, not cartoon, not 3D-plastic, no gradient.";
  // eslint-disable-next-line no-console
  console.log("[favicon] Selfologi-style C badge - 3 takes...");
  const imgs = await generateImage({
    prompt,
    rawPrompt: true,
    n: 3,
    size: "1024x1024",
    negativePrompt:
      "dark background, navy fill, black fill, letter S, words, paragraph text, multiple letters, childish, cartoon, clip-art, sketch, plastic 3D, gradient, glow, busy, cluttered, off-centre, low quality, watermark, jpeg artifacts",
  });
  for (let i = 0; i < imgs.length; i++) {
    const png = await sharp(imgs[i].buffer).resize(1024, 1024).png().toBuffer();
    writeFileSync(resolve(OUT, `refine-${i + 1}.png`), png);
  }
  // eslint-disable-next-line no-console
  console.log(`\nReview ${OUT}/refine-1..${imgs.length}.png`);
}

async function tighten(src: string): Promise<void> {
  // Trim the surrounding white so the badge fills the frame edge-to-edge,
  // re-pad a hair so the ring isn't clipped, square to 1024.
  const path = resolve(process.cwd(), src);
  const trimmed = await sharp(readFileSync(path))
    .flatten({ background: "#FFFFFF" })
    .trim({ background: "#FFFFFF", threshold: 12 })
    .toBuffer();
  const meta = await sharp(trimmed).metadata();
  const side = Math.max(meta.width ?? 1024, meta.height ?? 1024);
  const pad = Math.round(side * 0.05);
  const out = path.replace(/\.png$/, ".tight.png");
  await sharp(trimmed)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#FFFFFF" })
    .resize(1024, 1024, { fit: "contain", background: "#FFFFFF" })
    .png()
    .toFile(out);
  // eslint-disable-next-line no-console
  console.log(`[favicon] tightened -> ${out}`);
}

async function emitFile(src: string): Promise<void> {
  // Flatten onto pure white (kill any AI near-white/alpha fuzz), square,
  // then emit the website set + IG profile (1024).
  const base = await sharp(readFileSync(resolve(process.cwd(), src)))
    .flatten({ background: "#FFFFFF" })
    .resize(1024, 1024, { fit: "cover" })
    .png()
    .toBuffer();
  for (const px of [16, 32, 48, 180, 512]) {
    await sharp(base).resize(px, px).png().toFile(resolve(OUT, `icon-${px}.png`));
  }
  await sharp(base).png().toFile(resolve(OUT, `instagram.png`));
  // eslint-disable-next-line no-console
  console.log(`[favicon] emitted website set + instagram.png from ${src}`);
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const args = process.argv;
  const tightenArg = args.find((a) => a.startsWith("--tighten="))?.slice(10);
  const emitArg = args.find((a) => a.startsWith("--emit-file="))?.slice(12);

  if (args.includes("--refine")) return refine();
  if (tightenArg) return tighten(tightenArg);
  if (emitArg) return emitFile(emitArg);

  // eslint-disable-next-line no-console
  console.log(
    "Usage:\n  npm run favicon -- --refine\n  npm run favicon -- --tighten=favicon-crawl/refine-1.png\n  npm run favicon -- --emit-file=favicon-crawl/refine-1.tight.png"
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(`[favicon] FATAL: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
