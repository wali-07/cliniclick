/**
 * Selfologi-style IG title overlay using @vercel/og (Satori under the
 * hood). Replaces the previous @resvg/resvg-js implementation which
 * silently rendered text-less PNGs - first because of an SVG filter
 * resvg can't handle, then for reasons that remained unclear even
 * after the filter was removed.
 *
 * @vercel/og is Vercel's purpose-built dynamic-image library: it
 * accepts a font Buffer directly, ships its own renderer (no native
 * binaries, no fontconfig dependency), and is the canonical
 * "render text on a serverless image" path. The output is a Response
 * we convert to a Buffer for sharp.composite() at the call site.
 *
 * Lives as .tsx so we can use JSX for the Satori layout - which
 * supports a flexbox subset of CSS but NOT arbitrary SVG, so the
 * Selfologi light/bold stack is built as two stacked <div>s instead
 * of <text> tags.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ImageResponse } from "next/og";

const SIZE_DEFAULT = 1024;

// Load both Inter weights once at module init. @fontsource/inter ships
// each weight as a separate WOFF2 with internal family name "Inter"
// (the variable WOFF2's internal family is "Inter Variable" which
// caused our earlier rendering failures).
const INTER_REGULAR_PATH = resolve(
  process.cwd(),
  "public/fonts/Inter-Regular.woff2"
);
const INTER_BOLD_PATH = resolve(
  process.cwd(),
  "public/fonts/Inter-Bold.woff2"
);

let cachedRegular: Buffer | null = null;
let cachedBold: Buffer | null = null;

function fonts(): Array<{
  name: string;
  data: Buffer;
  weight: 400 | 800;
  style: "normal";
}> {
  if (!cachedRegular) cachedRegular = readFileSync(INTER_REGULAR_PATH);
  if (!cachedBold) cachedBold = readFileSync(INTER_BOLD_PATH);
  return [
    { name: "Inter", data: cachedRegular, weight: 400, style: "normal" },
    { name: "Inter", data: cachedBold, weight: 800, style: "normal" },
  ];
}

/**
 * Render the title overlay (transparent PNG, 1024x1024 by default) for
 * compositing onto the IG cover via sharp. 1-word titles render as a
 * single bold word; 2+ words stack as light-first / bold-second (the
 * Selfologi signature). yFrac controls vertical placement.
 */
export async function titleSvg(
  title: string,
  opts: { yFrac?: number; size?: number } = {}
): Promise<Buffer> {
  const SIZE = opts.size ?? SIZE_DEFAULT;
  const yFrac = opts.yFrac ?? 0.47;

  const words = title.trim().split(/\s+/);
  // Use Selfologi's hierarchy: light + smaller for the first word(s),
  // bold + larger for the rest. Single-word titles get one bold line.
  let lines: Array<{ text: string; size: number; weight: 400 | 800 }>;
  if (words.length === 1) {
    lines = [{ text: words[0], size: 156, weight: 800 }];
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
      { text: words.slice(0, split).join(" "), size: 118, weight: 400 },
      { text: words.slice(split).join(" "), size: 156, weight: 800 },
    ];
  }

  // Vertical positioning: anchor the block at yFrac * SIZE. Satori's
  // flex layout centres horizontally; we use absolute positioning for
  // the vertical anchor since flex can't pin to a fractional offset.
  const topOffsetPx = Math.round(SIZE * yFrac - (lines.length === 1 ? lines[0].size / 2 : (lines[0].size + lines[1].size) / 2));

  const response = new ImageResponse(
    (
      <div
        style={{
          width: `${SIZE}px`,
          height: `${SIZE}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "rgba(0,0,0,0)",
          paddingTop: `${topOffsetPx}px`,
        }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Inter",
              fontSize: `${l.size}px`,
              fontWeight: l.weight,
              color: "#FFFFFF",
              letterSpacing: "-3px",
              lineHeight: 1,
              marginTop: i === 0 ? 0 : `${Math.round(l.size * -0.18)}px`,
              textShadow: "0 2px 8px rgba(0,0,0,0.32)",
              display: "flex",
            }}
          >
            {l.text}
          </div>
        ))}
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      fonts: fonts(),
    }
  );

  const arrayBuf = await response.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  // eslint-disable-next-line no-console
  console.log(
    `[title-overlay] rendered ${buf.length} bytes (Satori via @vercel/og)`
  );
  return buf;
}

/**
 * Carousel info-slide compositor. Solid palette background with a
 * stacked headline + optional sub line. Returns a 1024x1024 PNG.
 */
export async function infoSlideSvg(args: {
  headline: string;
  sub?: string;
  bgHex: string;
  textHex?: string;
  size?: number;
}): Promise<Buffer> {
  const SIZE = args.size ?? SIZE_DEFAULT;
  const text = args.textHex ?? "#FFFFFF";

  const response = new ImageResponse(
    (
      <div
        style={{
          width: `${SIZE}px`,
          height: `${SIZE}px`,
          background: args.bgHex,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontFamily: "Inter",
            fontSize: "96px",
            fontWeight: 800,
            color: text,
            lineHeight: 1.08,
            letterSpacing: "-2px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {args.headline}
        </div>
        {args.sub && (
          <div
            style={{
              marginTop: "40px",
              fontFamily: "Inter",
              fontSize: "42px",
              fontWeight: 400,
              color: text,
              opacity: 0.92,
              lineHeight: 1.3,
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              maxWidth: `${SIZE - 200}px`,
            }}
          >
            {args.sub}
          </div>
        )}
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      fonts: fonts(),
    }
  );

  return Buffer.from(await response.arrayBuffer());
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
