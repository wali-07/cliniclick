3/**
 * The Visuals stage, shared by the editorial pipeline (run-article.ts) and
 * the one-off backfill (backfill-images.ts).
 *
 * Flow:
 *   Visuals Agent (reads article -> Recraft brief + alt)
 *     -> Recraft generate -> optimise to WebP under /public/article-images
 *       -> Image-Brand + Image-Safety review the REAL webp
 *         -> on fail, feed the critique back to the Visuals Agent and retry
 *
 * Image generation is an enhancement, not a publish gate: if it cannot
 * converge within maxCycles the article still ships text-only and the caller
 * is told. We never block an approved article on imagery.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { callAgent, callVisionAgent, reviewerPasses } from "./anthropic.js";
import { generateImage, optimizeToWebp, recraftConfigured } from "./recraft.js";

const PROMPTS_DIR = resolve(process.cwd(), "agents/prompts");

function loadPrompt(name: "visuals" | "image-brand" | "image-safety"): string {
  return readFileSync(resolve(PROMPTS_DIR, `${name}.md`), "utf-8");
}

export type HeroImage = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  prompt?: string;
  generatedBy?: string;
};

type VisualsBrief = {
  concept: string;
  recraftPrompt: string;
  negativePrompt: string;
  alt: string;
  caption: string;
};

function parseBrief(raw: string): VisualsBrief {
  // Tolerate accidental code fences / surrounding prose.
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
    caption: obj.caption ?? "",
  };
}

const noop = () => {};

/**
 * Run the full Visuals stage for one article. `articleContext` is the
 * article TS (or a distilled brief) given to the Visuals Agent so it can
 * choose a relevant concept. Returns the HeroImage to splice into the
 * article, or null if generation could not converge / Recraft unconfigured.
 */
export async function runVisualsStage(args: {
  articleContext: string;
  slug: string;
  maxCycles?: number;
  log?: (msg: string) => void;
}): Promise<HeroImage | null> {
  const log = args.log ?? noop;
  const maxCycles = args.maxCycles ?? 3;

  if (!recraftConfigured()) {
    log("[Visuals] RECRAFT_API_KEY not set - skipping image generation.");
    return null;
  }

  const visualsPrompt = loadPrompt("visuals");
  const brandPrompt = loadPrompt("image-brand");
  const safetyPrompt = loadPrompt("image-safety");

  log("[Visuals] Asking Visuals Agent for a hero concept...");
  let briefRaw = await callAgent({
    agent: "visuals",
    systemPrompt: visualsPrompt,
    userMessage: `Decide the hero illustration for this article and output the JSON brief.\n\n\`\`\`ts\n${args.articleContext}\n\`\`\``,
    maxTokens: 1500,
  });
  let brief = parseBrief(briefRaw);
  log(`[Visuals] Concept: ${brief.concept}`);

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    log(`[Visuals] Cycle ${cycle}/${maxCycles}: generating with Recraft...`);
    const [img] = await generateImage({
      prompt: brief.recraftPrompt,
      negativePrompt: brief.negativePrompt,
      n: 1,
    });
    const opt = await optimizeToWebp({ buffer: img.buffer, slug: args.slug });
    log(
      `[Visuals]   wrote ${opt.src} (${opt.width}x${opt.height}, ${Math.round(
        opt.bytes / 1024
      )}KB)`
    );

    const b64 = readFileSync(
      resolve(process.cwd(), "public", `article-images/${args.slug}.webp`)
    ).toString("base64");
    const reviewMsg = `Article concept: ${brief.concept}\nIntended alt text: ${brief.alt}\n\nJudge the attached generated hero illustration against your rules.`;

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
    if (!brandOk) {
      log(`[Visuals]   Image-Brand says: ${brandVerdict.trim().slice(0, 500)}`);
    }
    if (!safetyOk) {
      log(`[Visuals]   Image-Safety says: ${safetyVerdict.trim().slice(0, 400)}`);
    }
    log(
      `[Visuals]   Image-Brand: ${brandOk ? "PASS" : "ISSUES"} · Image-Safety: ${
        safetyOk ? "PASS" : "BLOCK"
      }`
    );

    if (brandOk && safetyOk) {
      log("[Visuals] Image cleared by both gates.");
      return {
        src: opt.src,
        alt: brief.alt,
        caption: brief.caption || undefined,
        width: opt.width,
        height: opt.height,
        prompt: brief.recraftPrompt,
        generatedBy: img.via,
      };
    }

    if (cycle === maxCycles) {
      log(
        "[Visuals] Did not converge within maxCycles. Shipping article WITHOUT a hero image."
      );
      return null;
    }

    // Feed the critique back to the Visuals Agent for a revised brief.
    const critique = [
      !brandOk ? `IMAGE-BRAND said:\n${brandVerdict}` : "",
      !safetyOk ? `IMAGE-SAFETY said:\n${safetyVerdict}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    log("[Visuals]   Revising the brief from reviewer feedback...");
    briefRaw = await callAgent({
      agent: "visuals",
      systemPrompt: visualsPrompt,
      userMessage: `Your previous hero image was rejected. Produce a NEW JSON brief that fixes every issue below. Keep the concept relevant to the article.\n\nPREVIOUS BRIEF:\n${JSON.stringify(
        brief,
        null,
        2
      )}\n\nREVIEWER FEEDBACK:\n${critique}\n\nARTICLE:\n\`\`\`ts\n${args.articleContext}\n\`\`\``,
      maxTokens: 1500,
    });
    brief = parseBrief(briefRaw);
  }

  return null;
}
