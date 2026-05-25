/**
 * Recraft API client for the Visuals Agent (Recraft V4).
 *
 * V4 reality (verified against the live API 2026-05-17): V4 does NOT support
 * the `style` parameter, custom `style_id`, or style `controls` - styles were
 * a V3-only feature. So brand consistency on V4 comes from two places:
 *
 *   1. BRAND_STYLE_SPEC - a fixed house-style block this module prepends to
 *      EVERY generation prompt, so every hero shares the same look/palette.
 *   2. The Image-Brand agent - the second gate that rejects + loops out
 *      anything off-brand that the prompt spec didn't pin down.
 *
 * Cost: recraftv4 raster = $0.04 / image. n>1 multiplies linearly.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const RECRAFT_BASE = "https://external.api.recraft.ai/v1";

/** Brand hexes from the brand-standards memory, stated in-prompt for V4. */
export const BRAND_HEX = {
  purple: "#A75CFF",
  navy: "#001435",
  offWhite: "#FFFFFF",
};

/**
 * The locked CliniClick house style, prepended to every prompt. This is the
 * V4 substitute for a locked style_id - keep it identical across runs so
 * heroes look like a set. Refine the wording via `npm run
 * bootstrap-brand-style -- --candidates` then lock the winner here.
 */
export const BRAND_STYLE_SPEC = [
  // Direction FINAL 2026-05-17 (Abdullah, Selfologi-referenced): polished
  // photographic object-metaphor still-life. NOT illustration, NOT medical.
  "Bold, minimal, VERY PLAYFUL editorial still-life PHOTOGRAPH: exactly",
  "ONE single everyday object (optionally one small cheeky accessory) that",
  "is a clever, fun visual pun for the subject - real photography,",
  "magazine-grade, crisp, soft studio light, gentle shadow. Whimsical and",
  "toy-like in spirit (bright, friendly material/colour), never a serious,",
  "sharp, technical or clinical-looking real tool - but still INSTANTLY",
  "RECOGNISABLE as the real object it represents, with a clear, correct,",
  "true-to-life silhouette (a toy razor must still obviously look like a",
  "razor: slim handle + razor head). Never abstract, blobby or deformed.",
  "The ONE object is shown WHOLE - fully visible, never cropped or clipped",
  "by any frame edge, and INTACT - never bitten, sliced, gouged, cut open,",
  "peeled, hollowed or damaged. Fresh, clean and appetising.",
  `The ENTIRE background is ONE flat solid SATURATED colour from the`,
  `curated lively brand palette (amended 2026-05-17, used on BOTH website`,
  `article heroes AND the IG grid for vibrancy): brand purple`,
  `${BRAND_HEX.purple} (the signature/anchor, most frequent), warm coral,`,
  `fresh teal, soft butter yellow, sky blue, or soft lavender. Pick ONE`,
  `per image; vary across articles so the set is colourful and full of`,
  `life, not monotone purple. Clean, premium, vibrant - no muddy or`,
  `garish off-palette colours. Seamless, no gradient/vignette/second`,
  "colour/visible surface. The object keeps its natural colour.",
  "The object is MODEST in scale (roughly a third of the frame, never more",
  "than ~45%) with generous empty space around it, and is shown WHOLE -",
  "not substantially cropped by an edge. A soft natural drop shadow and",
  "very subtle tonal falloff are fine and expected (like the reference",
  "images). Just one single solid colour - no second colour, no obvious",
  "gradient, no busy backdrop.",
  "A real photograph - NOT an illustration, NOT a 3D or CGI render.",
  "If a small accessory is present it RESTS gently ON TOP OF, AGAINST or",
  "BESIDE the object - it must NEVER pierce, penetrate, stab, insert into,",
  "stick into or embed in the object (that can look sexual). Nothing",
  "inserted into anything.",
  "ONE object only - no busy arrangements, no plates, garnish, props or",
  "styling clutter. No people or faces, no text, letters, numbers, logos,",
  "brand packaging or watermarks, no medical/clinical content, no",
  "before/after, nothing sexual or suggestive.",
].join(" ");

/**
 * 16:9, 1344px wide. A valid Recraft V4 size (V4 rejects the V3 1536x1024)
 * that still clears Google Discover's >=1200px-wide bar and matches the
 * site's 16:9 article-image framing.
 */
export const DEFAULT_SIZE = "1344x768";

export const PUBLIC_IMAGE_DIR = resolve(process.cwd(), "public/article-images");

export function recraftConfigured(): boolean {
  return Boolean(process.env.RECRAFT_API_KEY);
}

function apiKey(): string {
  const key = process.env.RECRAFT_API_KEY;
  if (!key) {
    throw new Error(
      "RECRAFT_API_KEY is not set. Copy .env.example to .env and fill it in."
    );
  }
  return key;
}

function model(): string {
  return process.env.RECRAFT_MODEL || "recraftv4";
}

export type GenerateArgs = {
  /** The concept prompt from the Visuals Agent (subject + composition). */
  prompt: string;
  /** Things that must not appear; folded into the prompt (V4 has no field). */
  negativePrompt?: string;
  /** How many candidates to return (1-6). Default 1. */
  n?: number;
  /** WxH. Default DEFAULT_SIZE. */
  size?: string;
  /**
   * Skip the BRAND_STYLE_SPEC prepend and send `prompt` verbatim. Only the
   * brand-style bootstrap uses this, to trial different style wordings.
   */
  rawPrompt?: boolean;
};

export type GeneratedImage = {
  /** Raw image bytes as returned by Recraft (pre-optimisation). */
  buffer: Buffer;
  /** Provenance string for the article's `generatedBy` field. */
  via: string;
};

/**
 * Compose the final prompt: locked house style + concept + folded negatives.
 */
export function composePrompt(args: {
  prompt: string;
  negativePrompt?: string;
  rawPrompt?: boolean;
}): string {
  if (args.rawPrompt) return args.prompt;
  const parts = [BRAND_STYLE_SPEC, args.prompt.trim()];
  if (args.negativePrompt && args.negativePrompt.trim()) {
    parts.push(`Strictly avoid: ${args.negativePrompt.trim()}.`);
  }
  return parts.join("\n\n");
}

/**
 * Generate one or more raster images on Recraft V4. V4-safe body: only
 * prompt / model / n / size / response_format (no style, style_id, controls,
 * or negative_prompt - all rejected by V4). Uses b64_json so we never
 * depend on an expiring URL.
 */
export async function generateImage(
  args: GenerateArgs
): Promise<GeneratedImage[]> {
  const finalPrompt = composePrompt(args);

  const body: Record<string, unknown> = {
    prompt: finalPrompt,
    model: model(),
    n: args.n ?? 1,
    size: args.size ?? DEFAULT_SIZE,
    response_format: "b64_json",
  };

  const res = await fetch(`${RECRAFT_BASE}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Recraft generate failed: ${res.status} ${res.statusText} ${detail}`
    );
  }

  const json = (await res.json()) as {
    data?: { b64_json?: string; url?: string }[];
  };
  const data = json.data ?? [];
  if (data.length === 0) throw new Error("Recraft returned no image data");

  const via = `recraft:${model()}`;
  const out: GeneratedImage[] = [];
  for (const item of data) {
    let buffer: Buffer;
    if (item.b64_json) {
      buffer = Buffer.from(item.b64_json, "base64");
    } else if (item.url) {
      const imgRes = await fetch(item.url);
      if (!imgRes.ok) {
        throw new Error(`Recraft image download failed: ${imgRes.status}`);
      }
      buffer = Buffer.from(await imgRes.arrayBuffer());
    } else {
      throw new Error("Recraft data item had neither b64_json nor url");
    }
    out.push({ buffer, via });
  }
  return out;
}

/**
 * Resize + convert a generated image to an optimised WebP under
 * /public/article-images/<slug>.webp. Returns the site-relative src and
 * final pixel dimensions for schema.org/ImageObject + OG tags.
 */
export async function optimizeToWebp(args: {
  buffer: Buffer;
  slug: string;
}): Promise<{ src: string; width: number; height: number; bytes: number }> {
  mkdirSync(PUBLIC_IMAGE_DIR, { recursive: true });
  const filePath = resolve(PUBLIC_IMAGE_DIR, `${args.slug}.webp`);

  const { data, info } = await sharp(args.buffer)
    .webp({ quality: 82, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  writeFileSync(filePath, data);

  return {
    src: `/article-images/${args.slug}.webp`,
    width: info.width,
    height: info.height,
    bytes: data.length,
  };
}
