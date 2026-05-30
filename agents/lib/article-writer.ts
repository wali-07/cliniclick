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
 * guides sit flat under /guides/.
 */
export function articleFilePath(entry: CalendarEntry): string {
  if (entry.parentType === "guide") {
    return resolve(ARTICLES_DIR, "guides", `${entry.slug}.ts`);
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
  if (entry.parentType === "guide") {
    return `./guides/${entry.slug}`;
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
 * Extract the actual exported binding name from a generated TS file.
 * The Drafter agent picks its own grammatically-natural name (e.g.
 * "whatAreDermalFillers" rather than slug-derived "whatIsDermalFillers"),
 * so we parse it from the source rather than guess.
 */
export function extractExportName(tsContent: string): string | null {
  const match = tsContent.match(/^export const ([A-Za-z_][A-Za-z0-9_]*)\s*=\s*defineArticle/m);
  return match ? match[1] : null;
}

/**
 * Force the article's slug, parentType, and parentSlug to match what the
 * calendar entry says, regardless of what the Drafter wrote. Drafters
 * sometimes "improve" these fields to be grammatically nicer, which breaks
 * URL resolution. This is the safety belt.
 */
export function enforceCalendarFields(args: {
  tsContent: string;
  entry: CalendarEntry;
}): string {
  let out = args.tsContent;
  out = out.replace(/(slug:\s*)"[^"]*"/, `$1"${args.entry.slug}"`);
  out = out.replace(/(parentType:\s*)"[^"]*"/, `$1"${args.entry.parentType}"`);
  out = out.replace(/(parentSlug:\s*)"[^"]*"/, `$1"${args.entry.parentSlug}"`);
  return out;
}

/**
 * Inject (or replace) the `heroImage` property inside a `defineArticle({...})`
 * block. Deterministic + idempotent via a trailing `// @generated-hero`
 * marker, so backfill re-runs swap the image cleanly instead of stacking.
 *
 * heroImage is a flat object (no nested objects), so a JSON literal is valid
 * TypeScript and safe to splice in.
 */
export function setHeroImage(
  tsContent: string,
  hero: Record<string, string | number | undefined>
): string {
  // Drop undefined keys so we never emit `"caption": undefined`.
  const clean = Object.fromEntries(
    Object.entries(hero).filter(([, v]) => v !== undefined)
  );
  const literal = JSON.stringify(clean, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join("\n");
  const block = `  heroImage: ${literal}, // @generated-hero\n`;

  // Remove any prior generated block first (idempotent).
  let out = tsContent.replace(
    /[ \t]*heroImage:\s*\{[\s\S]*?\},\s*\/\/ @generated-hero\r?\n/,
    ""
  );

  const anchor = out.match(/defineArticle\(\{\s*\r?\n/);
  if (!anchor) {
    throw new Error(
      "setHeroImage: could not find defineArticle({ opening to anchor heroImage"
    );
  }
  const insertAt = anchor.index! + anchor[0].length;
  out = out.slice(0, insertAt) + block + out.slice(insertAt);
  return out;
}

/**
 * Strip a generated `heroImage` block (idempotent; no-op if absent). Used by
 * the backfill `--reset` path so a re-run under a new visual direction never
 * leaves a previously-rejected image referenced.
 */
export function clearHeroImage(tsContent: string): string {
  return tsContent.replace(
    /[ \t]*heroImage:\s*\{[\s\S]*?\},\s*\/\/ @generated-hero\r?\n/,
    ""
  );
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
  const finalContent = enforceCalendarFields({
    tsContent: args.tsContent,
    entry: args.entry,
  });
  const binding =
    extractExportName(finalContent) ?? camelize(args.entry.slug);

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, finalContent + "\n", "utf-8");

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
    // Match the consecutive import block at file top. Handles both LF and
    // CRLF line endings (the file lives in git which auto-converts on
    // Windows checkout).
    const lastImportMatch = source.match(/^(import .+;\r?\n)+/m);
    if (!lastImportMatch) {
      throw new Error(
        "Could not locate import block in src/content/articles/index.ts"
      );
    }
    const insertAt = lastImportMatch.index! + lastImportMatch[0].length;
    // Match the line ending used in the surrounding file (CRLF or LF).
    const eol = source.includes("\r\n") ? "\r\n" : "\n";
    source = source.slice(0, insertAt) + importLine + eol + source.slice(insertAt);
  }

  if (!new RegExp(`\\b${args.binding}\\b`).test(source.split("export const allArticles")[1] ?? "")) {
    source = source.replace(
      /export const allArticles: Article\[\] = \[([\s\S]*?)\];/,
      (_, current: string) => {
        // Split on comma + filter empties so any combination of trailing
        // commas, blank lines, or whitespace can't produce a sparse-array
        // hole (which crashes .find() at runtime with "Cannot read
        // properties of undefined").
        const bindings = current
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        bindings.push(args.binding);
        return `export const allArticles: Article[] = [\n  ${bindings.join(",\n  ")},\n];`;
      }
    );
  }

  writeFileSync(ARTICLES_INDEX, source, "utf-8");
}
