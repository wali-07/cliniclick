/**
 * Recolour an approved hero image's background and re-validate.
 *
 * Use when the OBJECT in an approved hero is right (already passed
 * Image-Brand + Image-Safety) but the grid needs a different palette
 * colour today (the article hero's background clashes with the
 * recent IG grid). Cheaper, faster and more reliable than re-rolling
 * the object on Recraft - the object stays pixel-identical, only the
 * background hue shifts.
 *
 * Flow:
 *   Read source webp -> square 1024 crop -> HSL hue-rotate background
 *     -> Image-Brand + Image-Safety re-validate the recoloured webp
 *       -> composite Selfologi title -> save base.webp + webp + jpg
 *
 * Usage:
 *   npx tsx agents/social-recolor.ts \
 *     --slug=body-fat-single --title="Body fat" \
 *     --source=public/article-images/what-is-body-fat.webp \
 *     --from-hue=240,300 --to-hue=175 --bg-color=teal \
 *     [--titleY=0.47]
 *
 * `--bg-color` declares the candidate's colour (one of: purple, coral,
 * teal, butter-yellow, sky-blue, lavender). The script builds the live
 * grid context from social-calendar.yaml and passes it to Image-Brand
 * so the agent judges grid harmony as well as visual brand.
 *
 * Palette hue references (degrees):
 *   brand purple #A75CFF ~ 268
 *   warm coral          ~ 8
 *   fresh teal          ~ 175
 *   soft butter yellow  ~ 48   (avoid for butter-object posts)
 *   sky blue            ~ 205
 *   soft lavender       ~ 255
 */

import "dotenv/config";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { callVisionAgent, reviewerPasses } from "./lib/anthropic.js";
import {
  buildGridContext,
  PALETTE,
  type PaletteColour,
} from "./lib/social-grid.js";
import { loadPrompt } from "./lib/prompts.js";

const ROOT = process.cwd();
const OUT = resolve(ROOT, "public/social-renders");
const SIZE = 1024;

function arg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (h < 60) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h < 120) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h < 180) {
    [r1, g1, b1] = [0, c, x];
  } else if (h < 240) {
    [r1, g1, b1] = [0, x, c];
  } else if (h < 300) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

/**
 * Replace background pixels (those whose hue falls inside [fromLo,fromHi])
 * with the same lightness/saturation rotated to `toHue`. The object keeps
 * its native colour because its hue is outside the range.
 */
async function recolour(args: {
  source: Buffer;
  fromLo: number;
  fromHi: number;
  toHue: number;
  satFloor?: number;
}): Promise<Buffer> {
  // Square-crop centre to 1024x1024 (the social grid unit).
  const square = await sharp(args.source)
    .resize(SIZE, SIZE, { fit: "cover" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = square;
  const ch = info.channels; // 4 with ensureAlpha
  const buf = Buffer.from(data); // mutable copy
  const satFloor = args.satFloor ?? 0.18;
  for (let i = 0; i < buf.length; i += ch) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    // Only recolour pixels that are sufficiently saturated AND whose hue
    // lies in the source range. Shadows and near-grey pixels are left
    // alone so the object's own shadow on the surface stays neutral.
    if (s >= satFloor && h >= args.fromLo && h <= args.fromHi) {
      const [nr, ng, nb] = hslToRgb(args.toHue, s, l);
      buf[i] = nr;
      buf[i + 1] = ng;
      buf[i + 2] = nb;
    }
  }
  return sharp(buf, {
    raw: { width: info.width, height: info.height, channels: ch },
  })
    .webp({ quality: 92 })
    .toBuffer();
}

function titleSvg(title: string, yFrac = 0.47): Buffer {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  let BIG = 156;
  let SMALL = 118;
  const maxW = Math.round(SIZE * 0.76);
  const wEst = (s: string, sz: number) => s.length * sz * 0.56;
  const words = title.trim().split(/\s+/);
  let lines: { t: string; sz: number; w: number }[];
  if (words.length === 1) {
    lines = [{ t: words[0], sz: BIG, w: 800 }];
  } else {
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
  const source = arg("source");
  const fromHueArg = arg("from-hue") || "240,300";
  const toHueArg = arg("to-hue");
  const bgColorArg = arg("bg-color");
  const topic = arg("topic") || title || slug;
  const titleY = arg("titleY") === undefined ? 0.47 : Number(arg("titleY"));
  if (!slug || !title || !source || !toHueArg || !bgColorArg) {
    // eslint-disable-next-line no-console
    console.log(
      "Need --slug, --title, --source, --to-hue, --bg-color. See header."
    );
    process.exit(1);
  }
  if (!(PALETTE as readonly string[]).includes(bgColorArg)) {
    // eslint-disable-next-line no-console
    console.log(
      `--bg-color must be one of ${PALETTE.join(", ")} (got ${bgColorArg})`
    );
    process.exit(1);
  }
  const bgColor = bgColorArg as PaletteColour;
  const [fromLo, fromHi] = fromHueArg.split(",").map(Number);
  const toHue = Number(toHueArg);
  if (
    !Number.isFinite(fromLo) ||
    !Number.isFinite(fromHi) ||
    !Number.isFinite(toHue)
  ) {
    // eslint-disable-next-line no-console
    console.log("--from-hue must be 'lo,hi' and --to-hue must be a number");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });

  const srcBuf = readFileSync(resolve(ROOT, source));
  // eslint-disable-next-line no-console
  console.log(
    `[social-recolor] ${slug}: recolouring background ${fromLo}-${fromHi}° -> ${toHue}°`
  );
  const recoloured = await recolour({
    source: srcBuf,
    fromLo,
    fromHi,
    toHue,
  });

  // Re-validate the recoloured image. The object hasn't moved a pixel so
  // Image-Safety should be unchanged from the article hero verdict; the
  // open questions are (a) whether Image-Brand still reads the background
  // as a clean curated-palette colour and (b) whether the chosen colour
  // clashes with the live grid - which the agent now checks because the
  // user message includes a GRID CONTEXT block (see image-brand.md).
  const grid = buildGridContext({
    candidateSlug: slug,
    candidateBgColor: bgColor,
  });
  const brandPrompt = loadPrompt("image-brand");
  const safetyPrompt = loadPrompt("image-safety");
  const b64 = recoloured.toString("base64");
  const reviewMsg = [
    `Topic: ${topic}`,
    `Note: this is an approved hero image with the background recoloured`,
    `from purple to a different curated palette colour (the original`,
    `object passed both gates as the article hero).`,
    `Candidate bgColor: ${bgColor}.`,
    ``,
    grid.asText,
    ``,
    `Judge the attached recoloured illustration against your rules - including grid harmony.`,
  ].join("\n");
  const [brandVerdict, safetyVerdict] = await Promise.all([
    callVisionAgent({
      agent: "image-brand",
      systemPrompt: brandPrompt,
      userMessage: reviewMsg,
      image: { base64: b64, mediaType: "image/webp" },
    }),
    callVisionAgent({
      agent: "image-safety",
      systemPrompt: safetyPrompt,
      userMessage: reviewMsg,
      image: { base64: b64, mediaType: "image/webp" },
    }),
  ]);
  const brandOk = reviewerPasses(brandVerdict);
  const safetyOk = reviewerPasses(safetyVerdict);
  // eslint-disable-next-line no-console
  console.log(
    `[social-recolor]   Image-Brand: ${
      brandOk ? "PASS" : "ISSUES"
    } · Image-Safety: ${safetyOk ? "PASS" : "BLOCK"}`
  );
  if (!brandOk) {
    // eslint-disable-next-line no-console
    console.log(`  Image-Brand: ${brandVerdict.trim().slice(0, 800)}`);
  }
  if (!safetyOk) {
    // eslint-disable-next-line no-console
    console.log(`  Image-Safety: ${safetyVerdict.trim().slice(0, 800)}`);
  }
  if (!brandOk || !safetyOk) {
    // eslint-disable-next-line no-console
    console.log(
      "[social-recolor] Recolour did not pass both gates. Aborting before save."
    );
    process.exit(2);
  }

  const baseFile = resolve(OUT, `${slug}.base.webp`);
  await sharp(recoloured).toFile(baseFile);

  const composed = sharp(recoloured).composite([
    { input: titleSvg(title, titleY), top: 0, left: 0 },
  ]);
  const webpFile = resolve(OUT, `${slug}.webp`);
  const jpgFile = resolve(OUT, `${slug}.jpg`);
  await composed.clone().webp({ quality: 88 }).toFile(webpFile);
  await composed.clone().jpeg({ quality: 92 }).toFile(jpgFile);
  // eslint-disable-next-line no-console
  console.log(
    `[social-recolor] wrote ${webpFile} + ${jpgFile} (Image-Brand + Image-Safety PASS)`
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(
    `[social-recolor] FATAL: ${e instanceof Error ? e.message : String(e)}`
  );
  process.exit(1);
});
