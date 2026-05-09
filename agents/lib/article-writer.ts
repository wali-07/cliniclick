import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { CalendarEntry } from "./calendar.js";

const ROOT = process.cwd();
const ARTICLES_DIR = resolve(ROOT, "src/content/articles");
const ARTICLES_INDEX = resolve(ARTICLES_DIR, "index.ts");

/**
 * Convert a kebab-case slug into a camelCase identifier suitable for a TS
 * binding name: "what-is-acne" -> "whatIsAcne".
 */
export function camelize(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Compute the relative file path under src/content/articles/ for a given
 * calendar entry. Concerns/treatments/machines nest under their parent slug;
 * decoders sit flat under /decoders/.
 */
export function articleFilePath(entry: CalendarEntry): string {
  if (entry.parentType === "decoder") {
    return resolve(ARTICLES_DIR, "decoders", `${entry.slug}.ts`);
  }
  return resolve(
    ARTICLES_DIR,
    `${entry.parentType}s`,
    entry.parentSlug,
    `${entry.slug}.ts`
  );
}

/**
 * Compute the import path used inside src/content/articles/index.ts for the
 * given calendar entry. Mirrors articleFilePath but as an import string.
 */
function articleImportPath(entry: CalendarEntry): string {
  if (entry.parentType === "decoder") {
    return `./decoders/${entry.slug}`;
  }
  return `./${entry.parentType}s/${entry.parentSlug}/${entry.slug}`;
}

/**
 * Strip a markdown code fence wrapper (```ts ... ```) if the agent included
 * one in its output. We want raw TS to write to disk.
 */
export function stripCodeFence(text: string): string {
  const fence = /^```(?:ts|typescript)?\s*\n([\s\S]*?)\n```\s*$/;
  const match = text.trim().match(fence);
  return match ? match[1] : text.trim();
}

/**
 * Write the article TS file to disk and add an entry to the central index.
 * Idempotent: if the file already exists, it gets overwritten; if the index
 * already imports it, the import is left as-is.
 */
export function writeArticle(args: {
  entry: CalendarEntry;
  tsContent: string;
}): { filePath: string; importPath: string; binding: string } {
  const filePath = articleFilePath(args.entry);
  const importPath = articleImportPath(args.entry);
  const binding = camelize(args.entry.slug);

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, args.tsContent + "\n", "utf-8");

  registerInIndex({ binding, importPath });

  return { filePath, importPath, binding };
}

/**
 * Add the article to src/content/articles/index.ts. Inserts a new import line
 * at the top of the imports section and adds the binding to the allArticles
 * array. Skips both edits if already present.
 */
function registerInIndex(args: { binding: string; importPath: string }): void {
  if (!existsSync(ARTICLES_INDEX)) {
    throw new Error(
      `Articles index missing at ${ARTICLES_INDEX} - cannot register new article`
    );
  }
  let source = readFileSync(ARTICLES_INDEX, "utf-8");

  const importLine = `import { ${args.binding} } from "${args.importPath}";`;
  if (!source.includes(importLine)) {
    const lastImportMatch = source.match(/^(import .+;\n)+/m);
    if (!lastImportMatch) {
      throw new Error(
        "Could not locate import block in src/content/articles/index.ts"
      );
    }
    const insertAt = lastImportMatch.index! + lastImportMatch[0].length;
    source = source.slice(0, insertAt) + importLine + "\n" + source.slice(insertAt);
  }

  if (!new RegExp(`\\b${args.binding}\\b`).test(source.split("export const allArticles")[1] ?? "")) {
    source = source.replace(
      /export const allArticles: Article\[\] = \[([^\]]*)\];/,
      (_, current: string) => {
        const trimmed = current.trim();
        const next = trimmed.length > 0 ? `${trimmed}, ${args.binding}` : args.binding;
        return `export const allArticles: Article[] = [${next}];`;
      }
    );
  }

  writeFileSync(ARTICLES_INDEX, source, "utf-8");
}
