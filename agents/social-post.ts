/**
 * Crawl-stage Instagram post-image tool. Produces ONE grid-ready 1:1 asset:
 * the locked Selfologi object-pun image (Recraft) on a lively brand-anchored
 * pop background, with a brand-typographic TITLE overlay composited via sharp
 * so the grid is instantly readable (Recraft can't render text - the title
 * is a post-process layer). See memory/project_social_media.md.
 *
 * Usage:
 *   npm run social-post -- --slug=dark-spots --title="Dark spots" \
 *     --bg="warm coral" --object="a single speckled brown egg"
 *
 * Output: ./social-crawl/<slug>.webp (gitignored scratch, for approval).
 * Nothing is published. Crawl stage = Claude acts as the pod manually.
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { generateImage, recraftConfigured } from "./lib/recraft.js";

const OUT = resolve(process.cwd(), "social-crawl");
const SIZE = 1024; // 1:1 grid unit (valid Recraft V4 size)

function arg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

/**
 * Selfologi-style title (Abdullah 2026-05-17): big editorial type, vertically
 * mid-height, white, NO box - a subtle soft shadow keeps it readable. A
 * 2-word title stacks as a lighter/smaller first word over a bolder/bigger
 * second word, tight leading (the signature "Dark / spots" look). Fixed
 * sizes for cross-post consistency; mid-height also survives IG's portrait
 * grid crop and clears the bottom view-count chip.
 */
function titleSvg(title: string, yFrac = 0.47): Buffer {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  let BIG = 156; // bold word / single word
  let SMALL = 118; // lighter first word
  // IG's profile grid crops a 1:1 to ~4:5 portrait, trimming ~10-12% off
  // EACH side. Keep the title inside the centred grid-safe zone (~76% of
  // width) and horizontally centred so it is never clipped (Abdullah
  // 2026-05-17, from a real grid screenshot showing "Dark" -> "ark").
  const maxW = Math.round(SIZE * 0.76);
  const wEst = (s: string, sz: number) => s.length * sz * 0.56;

  // 1 word -> one bold line. 2+ words -> two lines: first word(s) light/small
  // over the rest bold/big (the Selfologi stack).
  const words = title.trim().split(/\s+/);
  let lines: { t: string; sz: number; w: number }[];
  if (words.length === 1) {
    lines = [{ t: words[0], sz: BIG, w: 800 }];
  } else {
    // Balance the split so neither line is absurdly long.
    let split = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      const d = Math.abs(a.length - b.length);
      if (d < bestDiff) {
        bestDiff = d;
        split = i;
      }
    }
    lines = [
      { t: words.slice(0, split).join(" "), sz: SMALL, w: 600 },
      { t: words.slice(split).join(" "), sz: BIG, w: 800 },
    ];
  }

  // Shrink uniformly only if the widest line would overflow (keeps the
  // light/bold size ratio and cross-post consistency).
  const maxEst = Math.max(...lines.map((l) => wEst(l.t, l.sz)));
  if (maxEst > maxW) {
    const f = maxW / maxEst;
    BIG = Math.round(BIG * f);
    SMALL = Math.round(SMALL * f);
    lines = lines.map((l) => ({
      ...l,
      sz: l.sz === 156 ? BIG : l.sz === 118 ? SMALL : Math.round(l.sz * f),
    }));
  }

  // Tight stacked leading; block centred at yFrac (default 0.47H - the locked
  // Selfologi mid-height). Override per-spec when the focal point of the
  // object-pun sits at mid-height (e.g. the under-eye tea-bag's googly eyes).
  const gap = Math.round(BIG * 0.86);
  const blockH = lines.length === 1 ? lines[0].sz : lines[0].sz + gap;
  let y = Math.round(SIZE * yFrac - blockH / 2 + lines[0].sz * 0.82);
  const texts = lines
    .map((l, i) => {
      if (i > 0) y += gap;
      return `<text x="${SIZE / 2}" y="${y}" fill="#FFFFFF"
        text-anchor="middle"
        font-family="Inter, Montserrat, Arial, sans-serif"
        font-size="${l.sz}" font-weight="${l.w}"
        style="letter-spacing:-3px;">${esc(l.t)}</text>`;
    })
    .join("\n      ");

  return Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="7"
            flood-color="#000000" flood-opacity="0.28"/>
        </filter>
      </defs>
      <g filter="url(#soft)">
      ${texts}
      </g>
    </svg>`
  );
}

async function main() {
  const slug = arg("slug");
  const title = arg("title");
  const bg = arg("bg");
  const object = arg("object");
  const source = arg("source");
  const titleYRaw = arg("titleY");
  const titleY = titleYRaw === undefined ? 0.47 : Number(titleYRaw);
  if (!Number.isFinite(titleY) || titleY < 0 || titleY > 1) {
    // eslint-disable-next-line no-console
    console.log(`[social-post] --titleY must be 0..1, got ${titleYRaw}`);
    process.exit(1);
  }
  const { readFileSync, existsSync } = await import("node:fs");
  const retitle = process.argv.includes("--retitle");
  const baseFile = resolve(OUT, `${slug}.base.webp`);

  if (!slug || !title) {
    // eslint-disable-next-line no-console
    console.log("Need --slug and --title.");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  let baseBuffer: Buffer;
  if (retitle) {
    // Re-composite a new title onto the saved untitled art - no Recraft
    // call, zero re-roll risk. For title-only iteration.
    if (!existsSync(baseFile)) {
      // eslint-disable-next-line no-console
      console.log(`[social-post] --retitle needs ${baseFile} (run once normally first)`);
      process.exit(1);
    }
    baseBuffer = readFileSync(baseFile);
    // eslint-disable-next-line no-console
    console.log(`[social-post] ${slug}: retitle from saved base -> "${title}"`);
  } else if (source) {
    // Reuse an approved image (e.g. an article hero). Guarantees a
    // known-good visual; core to the "repurpose articles" strategy.
    baseBuffer = readFileSync(resolve(process.cwd(), source));
    // eslint-disable-next-line no-console
    console.log(`[social-post] ${slug}: reusing source ${source}`);
  } else {
    if (!bg || !object) {
      // eslint-disable-next-line no-console
      console.log("Need --bg and --object (or --source, or --retitle).");
      process.exit(1);
    }
    baseBuffer = await generateFromRecraft(object, bg, slug);
  }

  // Save the untitled, square base so future title tweaks are a free,
  // zero-risk re-composite (--retitle) instead of a fresh art roll.
  const squareBase = await sharp(baseBuffer)
    .resize(SIZE, SIZE, { fit: "cover" })
    .webp({ quality: 92 })
    .toBuffer();
  await sharp(squareBase).toFile(baseFile);

  const composed = sharp(squareBase)
    .composite([{ input: titleSvg(title, titleY), top: 0, left: 0 }]);
  const webpFile = resolve(OUT, `${slug}.webp`);
  const jpgFile = resolve(OUT, `${slug}.jpg`);
  await composed.clone().webp({ quality: 88 }).toFile(webpFile);
  await composed.clone().jpeg({ quality: 92 }).toFile(jpgFile);
  // eslint-disable-next-line no-console
  console.log(`[social-post] wrote ${webpFile} + ${jpgFile}`);
}

async function generateFromRecraft(
  object: string,
  bg: string,
  slug: string
): Promise<Buffer> {
  if (!recraftConfigured()) {
    // eslint-disable-next-line no-console
    console.log("RECRAFT_API_KEY not set in .env");
    process.exit(1);
  }

  const prompt = [
    "Premium editorial still-life photograph,",
    `${object},`,
    "modest scale with generous empty space around it, whole and intact,",
    `on ONE single flat solid ${bg} background (no gradient, no second`,
    "colour, no visible surface or horizon), soft natural studio shadow.",
    "Fun, fresh, premium, tasteful. A real photograph - NOT an",
    "illustration, NOT 3D/CGI. No people, no faces, no text, no letters,",
    "no logos, no medical or clinical content, nothing sexual, nothing",
    "inserted into anything, no pigs/pork.",
  ].join(" ");

  // eslint-disable-next-line no-console
  console.log(`[social-post] ${slug}: generating "${object}" on ${bg}...`);
  const [img] = await generateImage({
    prompt,
    rawPrompt: true,
    n: 1,
    size: `${SIZE}x${SIZE}`,
  });
  return img.buffer;
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(`[social-post] FATAL: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
