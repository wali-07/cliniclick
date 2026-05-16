import { allArticles } from "@/content/articles";
import type { Article } from "@/lib/content/types";

export function getAllArticles(): Article[] {
  return allArticles;
}

export function getPublishedArticles(): Article[] {
  return allArticles.filter((a) => a.published);
}

export function getArticleBySlug(args: {
  parentType: Article["parentType"];
  parentSlug: string;
  slug: string;
}): Article | undefined {
  return allArticles.find(
    (a) =>
      a.parentType === args.parentType &&
      a.parentSlug === args.parentSlug &&
      a.slug === args.slug
  );
}

export function getArticlesForParent(args: {
  parentType: Article["parentType"];
  parentSlug: string;
}): Article[] {
  return allArticles.filter(
    (a) =>
      a.parentType === args.parentType &&
      a.parentSlug === args.parentSlug &&
      a.published
  );
}

/** Published top-level guide articles (live at /learn/[slug]). */
export function getPublishedGuides(): Article[] {
  return allArticles.filter((a) => a.parentType === "guide" && a.published);
}

/**
 * Estimate reading time at ~220 words per minute over text-bearing blocks.
 * Used when an Article doesn't supply an explicit `readingMinutes`.
 */
export function estimateReadingMinutes(article: Article): number {
  if (article.readingMinutes) return article.readingMinutes;
  const wordsPerMinute = 220;
  let words = 0;
  for (const block of article.body) {
    switch (block.type) {
      case "paragraph":
      case "quote":
        words += block.text.split(/\s+/).length;
        break;
      case "heading":
        words += block.text.split(/\s+/).length;
        break;
      case "list":
      case "checklist":
        for (const item of block.items) words += item.split(/\s+/).length;
        break;
      case "callout":
        words += block.text.split(/\s+/).length;
        if (block.title) words += block.title.split(/\s+/).length;
        break;
      case "table":
        for (const row of block.rows) {
          for (const cell of row) words += cell.split(/\s+/).length;
        }
        break;
      default:
        break;
    }
  }
  return Math.max(1, Math.round(words / wordsPerMinute));
}

/**
 * Auto-generate an anchor id from a heading's text - used for the in-page TOC.
 * Mirrors the behaviour of common slugifiers; safe for repeated text by appending
 * a numeric suffix at the call site if needed.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
