/**
 * Validated social-image renderer. The single source of truth for any
 * social asset that needs a FRESH Recraft image (not a reused approved
 * hero). Runs the full agent chain so every IG-grid post is on-brand
 * AND on-palette - exactly the same gates the article hero pipeline
 * uses, just routed to social-crawl/ instead of /public/article-images/.
 *
 * Flow:
 *   Visuals Agent (object + palette colour + Recraft prompt)
 *     -> Recraft generate (BRAND_STYLE_SPEC + concept prompt)
 *       -> Image-Brand + Image-Safety review the REAL webp (parallel)
 *         -> on fail, feed critique back to Visuals Agent, retry
 *
 * Then composites the locked Selfologi title overlay via sharp.
 *
 * Output: social-crawl/<slug>.base.webp + <slug>.webp + <slug>.jpg
 *
 * Usage:
 *   npx tsx agents/social-image.ts \
 *     --slug=body-fat-single --title="Body fat" \
 *     --topic="Stubborn body fat" \
 *     --object="a single whole pat or stick of butter (LOCKED per visuals.md)" \
 *     --exclude-bg="brand purple #A75CFF (botox-single 5-21 used it)" \
 *     [--titleY=0.22]  [--max-cycles=3]
 *
 * Reuse the approved hero path? Use social-post.ts --source=... instead.
 * This script is for when a NEW image is needed (grid colour clash, new
 * topic not in the approved hero library, etc.).
 */

import "dotenv/config";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { generateImage, recraftConfigured } from "./lib/recraft.js";
import { callAgent, callVisionAgent, reviewerPasses } from "./lib/anthropic.js";
import { buildGridContext } from "./lib/social-grid.js";

const ROOT = process.cwd();
const PROMPTS = resolve(ROOT, "agents/prompts");
const OUT = resolve(ROOT, "social-crawl");
const SIZE = 1024;

function arg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

function loadPrompt(name: "visuals" | "image-brand" | "image-safety"): string {
  return readFileSync(resolve(PROMPTS, `${name}.md`), "utf-8");
}

type Brief = {
  concept: string;
  recraftPrompt: string;
  negativePrompt: string;
  alt: string;
  caption: string;
};

function parseBrief(raw: string): Brief {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) text = fence[1].trim();
  if (!text.startsWith("{")) {
    const brace = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (brace >= 0 && end > brace) text = text.slice(brace, end + 1);
  }
  const obj = JSON.parse(text) as Partial<Brief> & { error?: string };
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

/**
 * Selfologi-style title SVG (copied from social-post.ts so this file is
 * a single self-contained entry point). yFrac defaults to 0.47 - the
 * locked mid-height. Override per-spec when the object's focal point
 * sits at mid-height and the title would clobber it.
 */
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
  const topic = arg("topic");
  const object = arg("object");
  const excludeBg = arg("exclude-bg") || "";
  const titleYRaw = arg("titleY");
  const titleY = titleYRaw === undefined ? 0.47 : Number(titleYRaw);
  const maxCycles = Number(arg("max-cycles") || "3");

  if (!slug || !title || !topic || !object) {
    // eslint-disable-next-line no-console
    console.log(
      "Need --slug, --title, --topic, --object. See file header for usage."
    );
    process.exit(1);
  }
  if (!Number.isFinite(titleY) || titleY < 0 || titleY > 1) {
    // eslint-disable-next-line no-console
    console.log(`--titleY must be 0..1, got ${titleYRaw}`);
    process.exit(1);
  }
  if (!recraftConfigured()) {
    // eslint-disable-next-line no-console
    console.log("RECRAFT_API_KEY not set in .env");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });

  const visualsPrompt = loadPrompt("visuals");
  const brandPrompt = loadPrompt("image-brand");
  const safetyPrompt = loadPrompt("image-safety");

  // The Visuals Agent normally reads an article. For social we hand it
  // a compressed brief: topic + LOCKED object + the live grid layout so
  // it picks a bgColor that doesn't clash with neighbours. The agent
  // prompt (visuals.md) defines the grid-harmony role; this script
  // supplies the layout via the GRID CONTEXT block below. The
  // BRAND_STYLE_SPEC in recraft.ts is prepended at generation time, so
  // we still get the full house-style rules baked in.
  const grid = buildGridContext({ candidateSlug: slug });
  const socialContext = [
    `THIS IS A SOCIAL/INSTAGRAM POST, not an article hero.`,
    `Topic: ${topic}.`,
    `Object (LOCKED, do NOT change): ${object}.`,
    grid.asText,
    excludeBg
      ? `Additional constraint from the caller: DO NOT use ${excludeBg}.`
      : ``,
    `Pick the bgColor per the grid-harmony rules above. State the chosen colour + grid reasoning in the JSON \`concept\` field. Output the standard JSON brief (concept, recraftPrompt, negativePrompt, alt, caption="").`,
  ]
    .filter(Boolean)
    .join("\n\n");

  // eslint-disable-next-line no-console
  console.log("[social-image] Visuals Agent: writing brief...");
  let briefRaw = await callAgent({
    agent: "visuals",
    systemPrompt: visualsPrompt,
    userMessage: socialContext,
    maxTokens: 1500,
  });
  let brief = parseBrief(briefRaw);
  // eslint-disable-next-line no-console
  console.log(`[social-image] Concept: ${brief.concept}`);

  let baseBuffer: Buffer | null = null;
  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    // eslint-disable-next-line no-console
    console.log(
      `[social-image] Cycle ${cycle}/${maxCycles}: Recraft generate...`
    );
    const [img] = await generateImage({
      prompt: brief.recraftPrompt,
      negativePrompt: brief.negativePrompt,
      n: 1,
      size: `${SIZE}x${SIZE}`,
    });
    const square = await sharp(img.buffer)
      .resize(SIZE, SIZE, { fit: "cover" })
      .webp({ quality: 92 })
      .toBuffer();

    const reviewMsg = [
      `Topic: ${topic}`,
      `Concept: ${brief.concept}`,
      `Intended alt: ${brief.alt}`,
      ``,
      grid.asText,
      ``,
      `Judge the attached generated illustration against your rules - including the grid-harmony section.`,
    ].join("\n");
    const b64 = square.toString("base64");

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
      `[social-image]   Image-Brand: ${
        brandOk ? "PASS" : "ISSUES"
      } · Image-Safety: ${safetyOk ? "PASS" : "BLOCK"}`
    );
    if (!brandOk) {
      // eslint-disable-next-line no-console
      console.log(`  Image-Brand: ${brandVerdict.trim().slice(0, 600)}`);
    }
    if (!safetyOk) {
      // eslint-disable-next-line no-console
      console.log(`  Image-Safety: ${safetyVerdict.trim().slice(0, 600)}`);
    }

    if (brandOk && safetyOk) {
      baseBuffer = square;
      break;
    }

    if (cycle === maxCycles) {
      // eslint-disable-next-line no-console
      console.log(
        "[social-image] Did not converge within maxCycles. Aborting."
      );
      process.exit(2);
    }

    const critique = [
      !brandOk ? `IMAGE-BRAND said:\n${brandVerdict}` : "",
      !safetyOk ? `IMAGE-SAFETY said:\n${safetyVerdict}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    // eslint-disable-next-line no-console
    console.log("[social-image]   Revising brief from reviewer feedback...");
    briefRaw = await callAgent({
      agent: "visuals",
      systemPrompt: visualsPrompt,
      userMessage: `Your previous brief was rejected. Output a NEW JSON brief that fixes every issue below. Keep the LOCKED object the same; adjust the background colour, framing or prompt wording per the feedback.\n\nPREVIOUS BRIEF:\n${JSON.stringify(
        brief,
        null,
        2
      )}\n\nREVIEWER FEEDBACK:\n${critique}\n\nORIGINAL CONTEXT:\n${socialContext}`,
      maxTokens: 1500,
    });
    brief = parseBrief(briefRaw);
    // eslint-disable-next-line no-console
    console.log(`[social-image]   Revised concept: ${brief.concept}`);
  }

  if (!baseBuffer) process.exit(2);

  // Save the untitled square base so future title tweaks are a zero-risk
  // re-composite (--retitle via social-post.ts) instead of a fresh roll.
  const baseFile = resolve(OUT, `${slug}.base.webp`);
  await sharp(baseBuffer).toFile(baseFile);

  const composed = sharp(baseBuffer).composite([
    { input: titleSvg(title, titleY), top: 0, left: 0 },
  ]);
  const webpFile = resolve(OUT, `${slug}.webp`);
  const jpgFile = resolve(OUT, `${slug}.jpg`);
  await composed.clone().webp({ quality: 88 }).toFile(webpFile);
  await composed.clone().jpeg({ quality: 92 }).toFile(jpgFile);
  // eslint-disable-next-line no-console
  console.log(
    `[social-image] wrote ${webpFile} + ${jpgFile} (validated by Image-Brand + Image-Safety)`
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(
    `[social-image] FATAL: ${e instanceof Error ? e.message : String(e)}`
  );
  process.exit(1);
});
