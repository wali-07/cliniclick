/**
 * The Selfologi-style title SVG compositor used by every IG post (single
 * and carousel cover). Extracted from social-post.ts so both the local
 * scripts and the serverless cron use the SAME compositor and produce
 * pixel-identical overlays.
 *
 * The 2-word title stacks light first / bold second (the Selfologi
 * signature); 1-word titles render as a single bold word. yFrac controls
 * vertical placement; default 0.47 is the locked mid-height — see
 * feedback_locked_title_position memory.
 */

const DEFAULT_SIZE = 1024;

/**
 * Build an SVG buffer with the title typography centred at yFrac.
 * Pass the buffer to sharp.composite() to overlay on a 1024x1024 base.
 */
export function titleSvg(
  title: string,
  opts: { yFrac?: number; size?: number } = {}
): Buffer {
  const yFrac = opts.yFrac ?? 0.47;
  const SIZE = opts.size ?? DEFAULT_SIZE;
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

  // Shrink uniformly only if the widest line overflows the grid-safe
  // zone (76% of width; IG's profile-grid crop is ~10-12% off each side).
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

/**
 * Carousel info-slide compositor. Renders a typographic slide on a
 * solid palette colour (no Recraft image). 6-word headline stack +
 * 14-word sub. Used for slides 2..N of an IG carousel; slide 1 (cover)
 * uses titleSvg() over an object-pun image instead.
 */
export function infoSlideSvg(args: {
  headline: string;
  sub?: string;
  bgHex: string;
  textHex?: string;
  size?: number;
}): Buffer {
  const SIZE = args.size ?? DEFAULT_SIZE;
  const text = args.textHex ?? "#FFFFFF";
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  // Wrap headline at ~16 chars per line, then size to fit.
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
        font-family="Inter, Montserrat, Arial, sans-serif"
        font-size="${HEAD_SIZE}" font-weight="800"
        style="letter-spacing:-2px;">${esc(line)}</text>`;
    })
    .join("\n");
  const subTexts = sub
    .map((line, i) => {
      const y = startY + head.length * headLineH + 32 + i * subLineH + SUB_SIZE * 0.4;
      return `<text x="${SIZE / 2}" y="${y}" fill="${text}" opacity="0.92"
        text-anchor="middle"
        font-family="Inter, Montserrat, Arial, sans-serif"
        font-size="${SUB_SIZE}" font-weight="400">${esc(line)}</text>`;
    })
    .join("\n");

  return Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${SIZE}" height="${SIZE}" fill="${args.bgHex}"/>
      ${headTexts}
      ${subTexts}
    </svg>`
  );
}

/**
 * Hex values for each curated palette colour. Used by infoSlideSvg to
 * render the solid backgrounds; mirrors the saturated tones the Recraft
 * BRAND_STYLE_SPEC produces.
 */
export const PALETTE_HEX = {
  purple: "#A75CFF",
  coral: "#FF7A6B",
  teal: "#1FB6A8",
  "butter-yellow": "#F5C543",
  "sky-blue": "#5BB3E8",
  lavender: "#C7AEEF",
} as const;

export type PaletteHexKey = keyof typeof PALETTE_HEX;
