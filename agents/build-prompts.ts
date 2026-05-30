/**
 * Bundle the agents/prompts/*.md files into a single TypeScript module so
 * Vercel serverless functions can import them without filesystem reads.
 *
 * Why: the local CLI pipeline reads prompts via readFileSync at runtime,
 * which doesn't work in Vercel functions (the agents/prompts directory
 * isn't automatically bundled with the function). Pre-baking them as TS
 * imports avoids the bundling-config dance.
 *
 * Run: `npm run build-prompts` (also wired into the pre-build hook so a
 * `vercel build` / `next build` regenerates them automatically).
 *
 * Source of truth remains the .md files - this is a generated artifact.
 * Editing the .ts directly is wasted work; the next build overwrites it.
 *
 * Usage: npx tsx agents/build-prompts.ts
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";

const PROMPTS_DIR = resolve(process.cwd(), "agents/prompts");
const OUT_FILE = resolve(process.cwd(), "agents/lib/prompts.ts");

// Each agent name in MODEL_FOR (agents/lib/anthropic.ts) maps to a prompt
// file. Keep this in sync if a new agent is added.
const KNOWN_AGENTS = [
  "drafter",
  "editor",
  "brand",
  "legal",
  "compliance",
  "seo-qa",
  "visuals",
  "image-brand",
  "image-safety",
  "social-briefer",
] as const;

/**
 * Escape a markdown string for embedding inside a TS template literal.
 * Three characters break out of a template literal: backtick, ${, and
 * trailing backslashes. Everything else (newlines, single/double quotes)
 * is fine as-is.
 */
function escapeForTemplate(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function main(): void {
  const files = readdirSync(PROMPTS_DIR).filter((f) => f.endsWith(".md"));
  const map: Record<string, string> = {};

  for (const file of files) {
    const name = basename(file, ".md");
    if (name === "README") continue; // documentation, not a prompt
    if (!KNOWN_AGENTS.includes(name as (typeof KNOWN_AGENTS)[number])) {
      // eslint-disable-next-line no-console
      console.warn(
        `[build-prompts] unknown prompt name "${name}" - add it to KNOWN_AGENTS or rename the file`
      );
    }
    map[name] = readFileSync(resolve(PROMPTS_DIR, file), "utf-8");
  }

  const missing = KNOWN_AGENTS.filter((a) => !map[a]);
  if (missing.length > 0) {
    throw new Error(
      `[build-prompts] missing prompt files for: ${missing.join(", ")}`
    );
  }

  const entries = KNOWN_AGENTS.map((name) => {
    const body = escapeForTemplate(map[name]);
    return `  "${name}": \`${body}\``;
  }).join(",\n");

  const out = `/**
 * AUTO-GENERATED from agents/prompts/*.md by agents/build-prompts.ts.
 * Do NOT edit by hand - regenerate via \`npm run build-prompts\`.
 *
 * Bundled so Vercel serverless functions can import prompts without
 * filesystem access to the .md source files.
 */

export const PROMPTS = {
${entries},
} as const;

export type PromptName = keyof typeof PROMPTS;

/**
 * Drop-in replacement for the previous \`loadPrompt(name)\` function that
 * used readFileSync. Works in both local + serverless contexts.
 */
export function loadPrompt(name: PromptName): string {
  return PROMPTS[name];
}
`;

  writeFileSync(OUT_FILE, out, "utf-8");
  // eslint-disable-next-line no-console
  console.log(
    `[build-prompts] wrote ${OUT_FILE} (${Object.keys(map).length} prompts)`
  );
}

main();
