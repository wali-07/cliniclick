/**
 * Selfologi-style title overlay + carousel info-slide rendering.
 *
 * Originally used sharp's built-in SVG rendering (via librsvg), which
 * silently produces text-less output on Vercel because the serverless
 * container has no system fonts. Now uses @resvg/resvg-js with the Inter
 * variable font bundled from @fontsource-variable/inter, so text renders
 * identically in local + serverless.
 *
 * Returns transparent PNG buffers the caller composites onto a base
 * image via sharp.
 */
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const SIZE_DEFAULT = 1024;

/**
 * Inter font files (Regular + Bold weights, latin subset). Non-variable
 * versions from @fontsource/inter - the variable WOFF2 has an internal
 * family name of "Inter Variable" not "Inter", which resvg can't match
 * against SVG `font-family="Inter"` so titles silently render blank.
 * The non-variable files use "Inter" as their internal family.
 *
 * Both files live under public/fonts/ (tracked, ~24KB each) so Vercel's
 * static asset path always ships them with each function bundle via the
 * next.config.mjs outputFileTracingIncludes entry.
 */
const FONT_FILES = [
  resolve(process.cwd(), "public/fonts/Inter-Regular.woff2"),
  resolve(process.cwd(), "public/fonts/Inter-Bold.woff2"),
];

let fontProbeLogged = false;

function renderSvgToPng(svg: string, size: number): Buffer {
  for (const f of FONT_FILES) {
    if (!existsSync(f)) {
      throw new Error(
        `[title-overlay] Inter font missing at runtime: ${f}. ` +
          `Confirm public/fonts/ is committed AND that next.config.mjs ` +
          `outputFileTracingIncludes ships public/fonts/** to the calling route.`
      );
    }
  }
  if (!fontProbeLogged) {
    const detail = FONT_FILES.map((f) => `${f} (${statSync(f).size}B)`).join(", ");
    // eslint-disable-next-line no-console
    console.log(`[title-overlay] fonts ready: ${detail}`);
    fontProbeLogged = true;
  }
  const resvg = new Resvg(svg, {
    background: "rgba(0,0,0,0)",
    fitTo: { mode: "width", value: size },
    font: {
      fontFiles: FONT_FILES,
      defaultFontFamily: "Inter",
      loadSystemFonts: false, // deterministic + matches local-host font set
    },
  });
  return resvg.render().asPng();
}

/**
 * Selfologi-style title overlay. 1 word renders as a single bold word;
 * 2+ words stack as light first / bold second (the brand signature).
 * yFrac defaults to 0.47 (locked mid-height per feedback memory).
 * Returns a 1024x1024 transparent PNG.
 */
export function titleSvg(
  title: string,
  opts: { yFrac?: number; size?: number } = {}
): Buffer {
  const yFrac = opts.yFrac ?? 0.47;
  const SIZE = opts.size ?? SIZE_DEFAULT;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  let BIG = 156;
  let SMALL = 118;
  const maxW = Math.round(SIZE * 0.76);
  const wEst = (s: string, sz: number) => s.length * sz * 0.56;

  const words = title.trim().split(/\s+/);
  let lines: { t: string; sz: number; w: number }[];
  // Use weights that map exactly to the loaded font files: 400 (Regular)
  // and 800 (Bold). Other weights would fall back via nearest-match in
  // resvg which can produce inconsistent rendering.
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
      { t: words.slice(0, split).join(" "), sz: SMALL, w: 400 },
      { t: words.slice(split).join(" "), sz: BIG, w: 800 },
    ];
  }

  // Shrink uniformly if the widest line overflows the IG profile-grid
  // safe zone (76% of width to clear the ~12% crop each side).
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
        font-family="Inter"
        font-size="${l.sz}" font-weight="${l.w}"
        letter-spacing="-3">${esc(l.t)}</text>`;
    })
    .join("\n      ");

  const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="7"
            flood-color="#000000" flood-opacity="0.28"/>
        </filter>
      </defs>
      <g filter="url(#soft)">
      ${texts}
      </g>
    </svg>`;
  return renderSvgToPng(svg, SIZE);
}

/**
 * Carousel info-slide compositor. Solid palette background with a stacked
 * headline + optional sub line. Returns a 1024x1024 PNG.
 */
export function infoSlideSvg(args: {
  headline: string;
  sub?: string;
  bgHex: string;
  textHex?: string;
  size?: number;
}): Buffer {
  const SIZE = args.size ?? SIZE_DEFAULT;
  const text = args.textHex ?? "#FFFFFF";
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const wrap = (s: string, max: number): string[] => {
    const words = s.trim().split(/\s+/);
    const out: string[] = [];
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (next.length > max && line) {
        out.push(line);
        line = w;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
    return out;
  };
  const head = wrap(args.headline, 14);
  const sub = args.sub ? wrap(args.sub, 28) : [];

  const HEAD_SIZE = head.length === 1 ? 112 : head.length === 2 ? 96 : 82;
  const SUB_SIZE = 42;
  const headLineH = Math.round(HEAD_SIZE * 1.08);
  const subLineH = Math.round(SUB_SIZE * 1.3);
  const blockH =
    head.length * headLineH + (sub.length ? 32 + sub.length * subLineH : 0);
  const startY = Math.round(SIZE / 2 - blockH / 2 + HEAD_SIZE * 0.78);

  const headTexts = head
    .map((line, i) => {
      const y = startY + i * headLineH;
      return `<text x="${SIZE / 2}" y="${y}" fill="${text}"
        text-anchor="middle"
        font-family="Inter"
        font-size="${HEAD_SIZE}" font-weight="800"
        letter-spacing="-2">${esc(line)}</text>`;
    })
    .join("\n");
  const subTexts = sub
    .map((line, i) => {
      const y = startY + head.length * headLineH + 32 + i * subLineH + SUB_SIZE * 0.4;
      return `<text x="${SIZE / 2}" y="${y}" fill="${text}" opacity="0.92"
        text-anchor="middle"
        font-family="Inter"
        font-size="${SUB_SIZE}" font-weight="400">${esc(line)}</text>`;
    })
    .join("\n");

  const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${SIZE}" height="${SIZE}" fill="${args.bgHex}"/>
      ${headTexts}
      ${subTexts}
    </svg>`;
  return renderSvgToPng(svg, SIZE);
}

export const PALETTE_HEX = {
  purple: "#A75CFF",
  coral: "#FF7A6B",
  teal: "#1FB6A8",
  "butter-yellow": "#F5C543",
  "sky-blue": "#5BB3E8",
  lavender: "#C7AEEF",
} as const;

export type PaletteHexKey = keyof typeof PALETTE_HEX;
