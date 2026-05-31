/**
 * Serverless IG-asset pipeline. Generates a finished Instagram post
 * (image + brief JSON) entirely in memory so the Vercel cron can run
 * it without a laptop in the loop.
 *
 * Two formats supported:
 *  - Single: object-pun cover with title overlay. Output: <slug>.webp +
 *    <slug>.base.webp (untitled, for future retitle) + <slug>.jpg.
 *  - Carousel: same cover as a single, plus N typographic info slides.
 *    Output: <slug>/slide-01.png..slide-NN.png.
 *
 * The brief (caption + 5 hashtags + title + optional slide content)
 * comes from the Social Briefer agent. The cover image comes from the
 * Visuals Agent + Recraft + Image-Brand + Image-Safety chain (same
 * gates the local social-image.ts uses, just routed through buffers).
 */
import sharp from "sharp";
import { Buffer } from "node:buffer";
import { callAgent, callVisionAgent, reviewerPasses } from "./anthropic.js";
import { generateImage, recraftConfigured } from "./recraft.js";
import { loadPrompt } from "./prompts.js";
import {
  titleSvg,
  infoSlideSvg,
  PALETTE_HEX,
  type PaletteHexKey,
} from "./title-overlay.js";
import { buildGridContext, PALETTE } from "./social-grid.js";

const SIZE = 1024;

export type SocialFormat = "single" | "carousel";

export type SocialBrief = {
  title: string;
  caption: string;
  hashtags: string[]; // EXACTLY 5
  slides?: Array<{ headline: string; sub?: string }>;
};

/** Inputs to the social pipeline. The cron route assembles these from the
 *  calendar entry it picked. */
export type SocialRunOpts = {
  slug: string;
  topic: string;
  /** "single" or "carousel". Parsed from slug suffix in the cron route. */
  format: SocialFormat;
  /** Optional article URL or excerpt - flows into both brief + visuals. */
  articleContext?: string;
  /** Topics already on the grid (for distinctness). */
  pastTopics?: string[];
  /** Cap on Recraft + Image-Brand retry cycles for the cover image. */
  maxVisualCycles?: number;
  log?: (msg: string) => void;
};

export type SocialBundle = {
  brief: SocialBrief;
  /** Always present: the final composited cover (1024x1024). */
  composedCoverWebp: Buffer;
  /** Always present: jpg fallback for Telegram-safe send. */
  composedCoverJpg: Buffer;
  /** The untitled cover (post-Recraft, post-square-crop, NO title overlay).
   *  Saved so a future retitle/recompose run can reuse it without a fresh
   *  Recraft call. */
  baseCoverWebp: Buffer;
  /** Carousel info slides as PNG buffers. Empty for single posts. */
  slides: Buffer[];
  /** The bgColor chosen by the Visuals Agent for grid harmony. */
  bgColor: PaletteHexKey;
};

const noop = () => {};

// ---------------------------------------------------------------------------
// Brief generation
// ---------------------------------------------------------------------------

function parseBriefJson(raw: string, format: SocialFormat): SocialBrief {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) text = fence[1].trim();
  if (!text.startsWith("{")) {
    const brace = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (brace >= 0 && end > brace) text = text.slice(brace, end + 1);
  }
  const obj = JSON.parse(text) as Partial<SocialBrief> & { error?: string };
  if (obj.error) throw new Error(`Social Briefer error: ${obj.error}`);
  if (!obj.title || typeof obj.title !== "string") {
    throw new Error("Social Briefer: missing title");
  }
  if (!obj.caption || typeof obj.caption !== "string") {
    throw new Error("Social Briefer: missing caption");
  }
  if (!Array.isArray(obj.hashtags) || obj.hashtags.length !== 5) {
    throw new Error(
      `Social Briefer: hashtags must be exactly 5 (got ${obj.hashtags?.length ?? 0})`
    );
  }
  if (format === "carousel") {
    if (!Array.isArray(obj.slides) || obj.slides.length < 3 || obj.slides.length > 5) {
      throw new Error(
        `Social Briefer: carousel needs 3-5 slides (got ${obj.slides?.length ?? 0})`
      );
    }
  }
  return {
    title: obj.title,
    caption: obj.caption,
    hashtags: obj.hashtags,
    ...(format === "carousel" ? { slides: obj.slides } : {}),
  };
}

export async function generateSocialBrief(
  opts: SocialRunOpts
): Promise<SocialBrief> {
  const systemPrompt = loadPrompt("social-briefer");
  const userMessage = [
    `TOPIC: ${opts.topic}`,
    `SLUG: ${opts.slug}`,
    `FORMAT: ${opts.format}`,
    opts.articleContext ? `ARTICLE: ${opts.articleContext}` : ``,
    opts.pastTopics && opts.pastTopics.length
      ? `PAST_TOPICS: ${opts.pastTopics.join(" · ")}`
      : ``,
  ]
    .filter(Boolean)
    .join("\n");
  const raw = await callAgent({
    agent: "social-briefer",
    systemPrompt,
    userMessage,
    maxTokens: 2000,
  });
  return parseBriefJson(raw, opts.format);
}

// ---------------------------------------------------------------------------
// Cover image (Visuals + Recraft + Image-Brand + Image-Safety, buffer mode)
// ---------------------------------------------------------------------------

type VisualsBrief = {
  concept: string;
  recraftPrompt: string;
  negativePrompt: string;
  alt: string;
  bgColor?: string;
};

function parseVisualsBrief(raw: string): VisualsBrief {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) text = fence[1].trim();
  if (!text.startsWith("{")) {
    const brace = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (brace >= 0 && end > brace) text = text.slice(brace, end + 1);
  }
  const obj = JSON.parse(text) as Partial<VisualsBrief> & { error?: string };
  if (obj.error) throw new Error(`Visuals Agent error: ${obj.error}`);
  if (!obj.recraftPrompt || !obj.alt) {
    throw new Error("Visuals Agent output missing recraftPrompt/alt");
  }
  return {
    concept: obj.concept ?? "",
    recraftPrompt: obj.recraftPrompt,
    negativePrompt: obj.negativePrompt ?? "",
    alt: obj.alt,
    bgColor: obj.bgColor,
  };
}

/** Resolve the palette key from the Visuals Agent's brief. Prefers the
 *  agent's explicit `bgColor` field (authoritative); only falls back to
 *  scanning free-text if that field is absent. Free-text scanning is
 *  fragile because the concept routinely mentions OTHER palette names
 *  in its grid-reasoning sentence (e.g. "...butter-yellow is a neighbour
 *  so we chose sky-blue..." - the simple `if includes("butter")` check
 *  would mis-attribute butter-yellow over the agent's actual sky-blue
 *  choice). */
function inferBgColor(visualsBrief: VisualsBrief): PaletteHexKey {
  // 1. Honour the agent's explicit field when set + recognisable.
  if (visualsBrief.bgColor) {
    const n = visualsBrief.bgColor.toLowerCase().trim();
    const palettes: PaletteHexKey[] = [
      "purple",
      "coral",
      "teal",
      "butter-yellow",
      "sky-blue",
      "lavender",
    ];
    for (const p of palettes) {
      if (n === p) return p;
    }
    // Tolerate space variants the model sometimes emits.
    if (n === "butter yellow") return "butter-yellow";
    if (n === "sky blue") return "sky-blue";
  }
  // 2. Fallback: scan only the recraftPrompt (the actual generation
  // input), not the concept (which contains grid-reasoning noise).
  const text = visualsBrief.recraftPrompt.toLowerCase();
  if (text.includes("butter")) return "butter-yellow";
  if (text.includes("lavender")) return "lavender";
  if (text.includes("sky")) return "sky-blue";
  if (text.includes("teal")) return "teal";
  if (text.includes("coral")) return "coral";
  if (text.includes("purple")) return "purple";
  return "purple"; // brand anchor; safe default
}

/** Run the cover-image chain in-memory and return the square 1024 webp
 *  (untitled) plus the chosen bgColor. Throws if Recraft can't converge
 *  within maxVisualCycles. */
export async function runCoverImage(
  opts: SocialRunOpts
): Promise<{ baseCoverWebp: Buffer; bgColor: PaletteHexKey; alt: string }> {
  if (!recraftConfigured()) {
    throw new Error(
      "RECRAFT_API_KEY not set. Required for serverless IG generation."
    );
  }
  const log = opts.log ?? noop;
  const maxCycles = opts.maxVisualCycles ?? 3;

  const visualsPrompt = loadPrompt("visuals");
  const brandPrompt = loadPrompt("image-brand");
  const safetyPrompt = loadPrompt("image-safety");

  // Grid context for harmony - so the Visuals Agent picks a non-clashing
  // bgColor and Image-Brand validates against it.
  const grid = buildGridContext({ candidateSlug: opts.slug });

  const socialContext = [
    `THIS IS A SOCIAL/INSTAGRAM POST, not an article hero.`,
    `Topic: ${opts.topic}.`,
    grid.asText,
    `Pick ONE bgColor from the curated palette (${PALETTE.join(", ")}) per the grid-harmony rules above. Also pick the SINGLE everyday object that is the visual pun. Output the standard JSON brief with concept, recraftPrompt, negativePrompt, alt, AND a bgColor field naming the palette colour you chose.`,
  ].join("\n\n");

  log(`[social-pipeline] Visuals Agent: writing brief...`);
  let visualsRaw = await callAgent({
    agent: "visuals",
    systemPrompt: visualsPrompt,
    userMessage: socialContext,
    maxTokens: 1500,
  });
  let visualsBrief = parseVisualsBrief(visualsRaw);
  log(`[social-pipeline] Concept: ${visualsBrief.concept}`);

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    log(`[social-pipeline] Cycle ${cycle}/${maxCycles}: Recraft generate...`);
    const [img] = await generateImage({
      prompt: visualsBrief.recraftPrompt,
      negativePrompt: visualsBrief.negativePrompt,
      n: 1,
      size: `${SIZE}x${SIZE}`,
    });
    const square = await sharp(img.buffer)
      .resize(SIZE, SIZE, { fit: "cover" })
      .webp({ quality: 92 })
      .toBuffer();
    const b64 = square.toString("base64");

    const reviewMsg = [
      `Topic: ${opts.topic}`,
      `Concept: ${visualsBrief.concept}`,
      `Intended alt: ${visualsBrief.alt}`,
      ``,
      grid.asText,
      ``,
      `Judge the attached generated illustration against your rules - including the grid-harmony section.`,
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
    log(
      `[social-pipeline]   Image-Brand: ${brandOk ? "PASS" : "ISSUES"} · Image-Safety: ${safetyOk ? "PASS" : "BLOCK"}`
    );
    if (brandOk && safetyOk) {
      return {
        baseCoverWebp: square,
        bgColor: inferBgColor(visualsBrief),
        alt: visualsBrief.alt,
      };
    }
    if (cycle === maxCycles) {
      throw new Error(
        `Cover image did not converge after ${maxCycles} cycles. Image-Brand: ${brandVerdict.slice(0, 200)} · Image-Safety: ${safetyVerdict.slice(0, 200)}`
      );
    }
    // Revise the brief from reviewer feedback and try again.
    const critique = [
      !brandOk ? `IMAGE-BRAND:\n${brandVerdict}` : ``,
      !safetyOk ? `IMAGE-SAFETY:\n${safetyVerdict}` : ``,
    ]
      .filter(Boolean)
      .join("\n\n");
    visualsRaw = await callAgent({
      agent: "visuals",
      systemPrompt: visualsPrompt,
      userMessage: `Your previous IG cover was rejected. Produce a NEW JSON brief that fixes every issue below.\n\nPREVIOUS BRIEF:\n${JSON.stringify(visualsBrief, null, 2)}\n\nREVIEWER FEEDBACK:\n${critique}\n\n${socialContext}`,
      maxTokens: 1500,
    });
    visualsBrief = parseVisualsBrief(visualsRaw);
  }
  // Unreachable: the loop either returns or throws on the final cycle.
  throw new Error("runCoverImage: unreachable end of loop");
}

// ---------------------------------------------------------------------------
// Composite + carousel slides
// ---------------------------------------------------------------------------

/** Composite the title overlay onto the base cover and return webp + jpg buffers. */
async function composeTitleOverlay(
  base: Buffer,
  title: string
): Promise<{ webp: Buffer; jpg: Buffer }> {
  const titlePng = await titleSvg(title, { yFrac: 0.47, size: SIZE });
  const composed = sharp(base).composite([
    { input: titlePng, top: 0, left: 0 },
  ]);
  const webp = await composed.clone().webp({ quality: 88 }).toBuffer();
  const jpg = await composed.clone().jpeg({ quality: 92 }).toBuffer();
  return { webp, jpg };
}

/** Rotate the palette so consecutive carousel slides aren't the same colour
 *  and the rotation excludes the cover's bgColor (to keep it distinct on
 *  the user's scroll). */
function pickSlideColors(
  count: number,
  coverColor: PaletteHexKey
): PaletteHexKey[] {
  const order: PaletteHexKey[] = [
    "purple",
    "coral",
    "teal",
    "butter-yellow",
    "sky-blue",
    "lavender",
  ];
  const without = order.filter((c) => c !== coverColor);
  const result: PaletteHexKey[] = [];
  for (let i = 0; i < count; i++) result.push(without[i % without.length]);
  return result;
}

/** Render carousel info slides as PNG buffers. Slide 1 is the cover (not
 *  generated here - caller composes it with composeTitleOverlay). */
async function renderInfoSlides(
  slides: SocialBrief["slides"],
  coverColor: PaletteHexKey
): Promise<Buffer[]> {
  if (!slides || slides.length === 0) return [];
  const palette = pickSlideColors(slides.length, coverColor);
  const out: Buffer[] = [];
  for (let i = 0; i < slides.length; i++) {
    const colour = palette[i];
    // infoSlideSvg now returns a PNG buffer directly (via @vercel/og),
    // no need for a sharp roundtrip.
    const png = await infoSlideSvg({
      headline: slides[i].headline,
      sub: slides[i].sub,
      bgHex: PALETTE_HEX[colour],
      size: SIZE,
    });
    out.push(png);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * End-to-end IG-asset generation. Caller passes the calendar entry's
 * fields plus optional article context; we return the brief JSON + all
 * the image buffers needed to commit + send to Telegram.
 *
 * Order of operations:
 *   1. Social Briefer agent  -> brief JSON (title, caption, hashtags, slides?)
 *   2. Visuals Agent + Recraft + Image-Brand + Image-Safety -> base cover
 *   3. Composite title overlay -> final cover webp + jpg
 *   4. (Carousel only) render info slides as PNG buffers
 *
 * Throws on unrecoverable failures (Recraft cant converge, brief malformed)
 * - the cron route catches and Telegram-alerts.
 */
export async function generateSocialAsset(
  opts: SocialRunOpts
): Promise<SocialBundle> {
  const log = opts.log ?? noop;
  log(`[social-pipeline] Generating ${opts.format} for ${opts.slug}`);

  // 1. Brief.
  const brief = await generateSocialBrief(opts);
  log(`[social-pipeline] Brief: title="${brief.title}", ${brief.hashtags.length} hashtags${brief.slides ? `, ${brief.slides.length} slides` : ""}`);

  // 2. Cover image.
  const cover = await runCoverImage(opts);
  log(`[social-pipeline] Cover: bgColor=${cover.bgColor}`);

  // 3. Composite title.
  const composed = await composeTitleOverlay(cover.baseCoverWebp, brief.title);

  // 4. (Carousel) info slides.
  const slides =
    opts.format === "carousel"
      ? await renderInfoSlides(brief.slides, cover.bgColor)
      : [];
  if (opts.format === "carousel") {
    log(`[social-pipeline] Rendered ${slides.length} info slides.`);
  }

  return {
    brief,
    composedCoverWebp: composed.webp,
    composedCoverJpg: composed.jpg,
    baseCoverWebp: cover.baseCoverWebp,
    slides,
    bgColor: cover.bgColor,
  };
}
