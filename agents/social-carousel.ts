/**
 * Finished Instagram CAROUSEL renderer.
 *
 * LOCKED RULE (Abdullah 2026-05-18, feedback_grid_cohesion_all_formats):
 * the COVER (slide 1 - the image that lands in the 3x3 grid) is ALWAYS the
 * witty single object-pun photograph on a vibrant brand colour, with the
 * locked Selfologi title overlay - identical treatment to the single
 * posts, so the grid stays consistent. A carousel whose cover is not an
 * object-pun (or a reused approved object-pun source) is REJECTED here -
 * the renderer will not produce an off-system cover. Inner slides are the
 * typographic info slides on the deepened brand-anchored palette.
 *
 * Spec (editorial/social-briefs/<slug>.json):
 *   slides[0] (cover) MUST have: title + (object + bg) | source
 *     - object: Recraft object-pun subject (e.g. "a single ripe avocado")
 *     - bg:     Recraft colour phrase (e.g. "brand purple", "warm coral")
 *     - source: path to an approved object-pun image to reuse instead
 *   slides[1..] : { bg: <palette key>, headline, sub? }
 *
 * Usage:  npx tsx agents/social-carousel.ts --slug=<slug>
 * Output: social-crawl/<slug>/slide-01.png ...  (gitignored scratch)
 */

import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { generateImage, recraftConfigured } from "./lib/recraft.js";

const SIZE = 1024; // matches social-post.ts for grid cohesion

// Inner-slide palette = the LIVE GRID tones (from Abdullah's @clini.click
// screenshot) so slides feel like the same fun, vibrant set as the
// object-pun covers. Text colour is auto-picked per background (navy on
// light, white on deep) so it is always legible AND looks designed.
const BG: Record<string, string> = {
  purple: "#A75CFF",
  lavender: "#7C5CFF",
  teal: "#15B5A3",
  coral: "#EE6A4A",
  blue: "#3FA7DC",
  yellow: "#EFC550",
  pink: "#FF8FB1",
  navy: "#001435",
};

/** Perceived luminance 0-1, for the auto two-tone text choice. */
function lum(hex: string): number {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

type Slide = {
  bg?: string;
  title?: string;
  object?: string;
  source?: string;
  headline?: string;
  sub?: string;
};
type Spec = {
  slug: string;
  caption: string;
  hashtags: string[];
  slides: Slide[];
};

function arg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The LOCKED Selfologi title treatment (verbatim from social-post.ts):
 * lighter/smaller first word over bolder/bigger rest, white, no box, soft
 * shadow, centred, mid-height, grid-safe (~76% width). Transparent overlay
 * - composited over the object-pun cover image.
 */
function titleOverlaySvg(title: string): Buffer {
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
    let best = Infinity;
    for (let i = 1; i < words.length; i++) {
      const d = Math.abs(
        words.slice(0, i).join(" ").length - words.slice(i).join(" ").length
      );
      if (d < best) {
        best = d;
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
  let y = Math.round(SIZE * 0.47 - blockH / 2 + lines[0].sz * 0.82);
  const texts = lines
    .map((l, i) => {
      if (i > 0) y += gap;
      return `<text x="${SIZE / 2}" y="${y}" fill="#FFFFFF" text-anchor="middle"
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

function wrap(text: string, size: number, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  const fits = (s: string) => s.length * size * 0.56 <= maxW;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (fits(next) || !line) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Fun editorial info slide: big left-aligned bold type on a live-grid
 * colour, an oversized translucent index number, a brand accent bar, and
 * the @clini.click handle - same playful energy as the object-pun grid,
 * never a boring centred paragraph. Text colour auto-flips for contrast.
 */
function innerSlide(s: Slide, idx: number): Buffer {
  const fill = BG[s.bg || "purple"] || s.bg || BG.purple;
  const fg = lum(fill) > 0.62 ? "#001435" : "#FFFFFF";
  const accent =
    fill.toUpperCase() === BG.purple ? "#FFFFFF" : "#A75CFF";
  const MX = 86;
  const maxW = SIZE - MX * 2;
  const hSize = 88;
  const sSize = 40;
  const hLines = wrap(s.headline || "", hSize, maxW);
  const sLines = s.sub ? wrap(s.sub, sSize, maxW) : [];
  const hLead = Math.round(hSize * 1.14);
  const sLead = Math.round(sSize * 1.34);
  const parts: string[] = [];

  // Oversized translucent index number - editorial energy.
  parts.push(
    `<text x="${MX}" y="258" fill="${fg}" opacity="0.15"
      font-family="Inter, Montserrat, Arial, sans-serif"
      font-size="190" font-weight="800"
      style="letter-spacing:-8px;">${String(idx).padStart(2, "0")}</text>`
  );
  // Brand accent bar.
  parts.push(
    `<rect x="${MX}" y="300" width="96" height="14" rx="7" fill="${accent}"/>`
  );

  let y = 392;
  for (const l of hLines) {
    parts.push(
      `<text x="${MX}" y="${y}" fill="${fg}"
        font-family="Inter, Montserrat, Arial, sans-serif"
        font-size="${hSize}" font-weight="800"
        style="letter-spacing:-2px;">${esc(l)}</text>`
    );
    y += hLead;
  }
  if (sLines.length) {
    y += 20;
    for (const l of sLines) {
      parts.push(
        `<text x="${MX}" y="${y}" fill="${fg}" opacity="0.88"
          font-family="Inter, Montserrat, Arial, sans-serif"
          font-size="${sSize}" font-weight="500">${esc(l)}</text>`
      );
      y += sLead;
    }
  }
  // Playful magazine-style handle, bottom-left.
  parts.push(
    `<text x="${MX}" y="${SIZE - 62}" fill="${fg}" opacity="0.42"
      font-family="Inter, Montserrat, Arial, sans-serif"
      font-size="31" font-weight="700">@clini.click</text>`
  );

  return Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${SIZE}" height="${SIZE}" fill="${fill}"/>
      ${parts.join("\n      ")}
    </svg>`
  );
}

/** Object-pun cover: Recraft (or reused approved source) + locked title. */
async function renderCover(s: Slide, slug: string): Promise<Buffer> {
  if (!s.title || (!s.object && !s.source)) {
    throw new Error(
      "COVER REJECTED: slide 1 must be a witty object-pun - needs `title` " +
        "plus (`object` + `bg`) or `source`. A plain text cover is off the " +
        "locked grid system (feedback_grid_cohesion_all_formats)."
    );
  }
  let base: Buffer;
  if (s.source) {
    base = readFileSync(resolve(process.cwd(), s.source));
    console.log(`[carousel] ${slug}: cover reuses approved source ${s.source}`);
  } else {
    if (!recraftConfigured()) {
      throw new Error(
        "RECRAFT_API_KEY not set locally - cannot generate the object-pun " +
          "cover. Set it in .env, or give the cover slide a `source` path to " +
          "an approved object-pun image to reuse."
      );
    }
    const prompt = [
      "Premium editorial still-life photograph,",
      `${s.object},`,
      "modest scale with generous empty space around it, whole and intact,",
      `on ONE single flat solid ${s.bg} background (no gradient, no second`,
      "colour, no visible surface or horizon), soft natural studio shadow.",
      "Fun, fresh, premium, tasteful. A real photograph - NOT an",
      "illustration, NOT 3D/CGI. No people, no faces, no text, no letters,",
      "no logos, no medical or clinical content, nothing sexual, nothing",
      "inserted into anything, no pigs/pork.",
    ].join(" ");
    console.log(
      `[carousel] ${slug}: generating cover "${s.object}" on ${s.bg}...`
    );
    const [img] = await generateImage({
      prompt,
      rawPrompt: true,
      n: 1,
      size: `${SIZE}x${SIZE}`,
    });
    base = img.buffer;
  }
  const square = await sharp(base)
    .resize(SIZE, SIZE, { fit: "cover" })
    .toBuffer();
  return sharp(square)
    .composite([{ input: titleOverlaySvg(s.title), top: 0, left: 0 }])
    .png({ quality: 95 })
    .toBuffer();
}

async function main() {
  const slug = arg("slug");
  if (!slug) {
    console.log("Need --slug.");
    process.exit(1);
  }
  const specPath = resolve(
    process.cwd(),
    `editorial/social-briefs/${slug}.json`
  );
  if (!existsSync(specPath)) {
    console.log(`[carousel] missing spec ${specPath}`);
    process.exit(1);
  }
  const spec = JSON.parse(readFileSync(specPath, "utf-8")) as Spec;
  if (spec.hashtags.length !== 5) {
    console.log(
      `[carousel] HARD RULE: exactly 5 hashtags, got ${spec.hashtags.length}`
    );
    process.exit(1);
  }
  const outDir = resolve(process.cwd(), "social-crawl", slug);
  mkdirSync(outDir, { recursive: true });

  // slide 1 = locked object-pun cover (throws if off-system)
  const cover = await renderCover(spec.slides[0], slug);
  await sharp(cover).toFile(resolve(outDir, "slide-01.png"));

  let i = 1;
  for (const s of spec.slides.slice(1)) {
    i += 1;
    await sharp(innerSlide(s, i - 1))
      .png({ quality: 95 })
      .toFile(resolve(outDir, `slide-${String(i).padStart(2, "0")}.png`));
  }
  console.log(
    `[carousel] ${slug}: wrote ${i} finished slides (object-pun cover + ${i - 1} info) -> ${outDir}`
  );
}

main().catch((e) => {
  console.error(
    `[carousel] FATAL: ${e instanceof Error ? e.message : String(e)}`
  );
  process.exit(1);
});
