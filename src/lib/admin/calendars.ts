/**
 * Read-only calendar readers for the admin dashboard. Parse the YAML files
 * that already drive the editorial + social pipelines so the dashboard
 * reflects exactly what is planned/committed. No writes here.
 *
 * Files are ensured into the serverless bundle via outputFileTracingIncludes
 * in next.config.mjs.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

// ---- SEO content (editorial/calendar.yaml) ----

const seoStatus = z.enum([
  "queued",
  "drafting",
  "in-review",
  "awaiting-approval",
  "approved",
  "published",
  "rejected",
  "skipped",
]);
export type SeoStatus = z.infer<typeof seoStatus>;

const seoEntry = z.object({
  slug: z.string(),
  parentType: z.string(),
  parentSlug: z.string(),
  kind: z.string(),
  title: z.string(),
  keywords: z.array(z.string()).default([]),
  dueDate: z.string(),
  status: seoStatus,
  publishedDate: z.string().optional(),
  notes: z.string().optional(),
});
export type SeoEntry = z.infer<typeof seoEntry>;

const seoFile = z.object({ articles: z.array(seoEntry) });

// ---- Social (editorial/social-calendar.yaml) ----

const socialStatus = z.enum(["draft", "delivered", "posted", "skipped"]);
export type SocialStatus = z.infer<typeof socialStatus>;

const socialPost = z.object({
  topic: z.string(),
  slug: z.string(),
  article: z.string().optional(),
  scheduledFor: z.string(),
  status: socialStatus,
  notes: z.string().optional(),
});
export type SocialPost = z.infer<typeof socialPost>;

const socialFile = z.object({ posts: z.array(socialPost) });

function readYaml(rel: string): unknown {
  return yaml.load(readFileSync(resolve(process.cwd(), rel), "utf-8"));
}

export function getSeoCalendar(): SeoEntry[] {
  try {
    const { articles } = seoFile.parse(readYaml("editorial/calendar.yaml"));
    return [...articles].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  } catch {
    return [];
  }
}

export function getSocialCalendar(): SocialPost[] {
  try {
    const { posts } = socialFile.parse(
      readYaml("editorial/social-calendar.yaml")
    );
    return [...posts].sort((a, b) =>
      a.scheduledFor.localeCompare(b.scheduledFor)
    );
  } catch {
    return [];
  }
}

/** "What's next": not-yet-done items from today onward, soonest first. */
export function nextUp<T extends { status: string }>(
  items: T[],
  date: (t: T) => string,
  doneStatuses: string[]
): T[] {
  const today = new Date().toISOString().slice(0, 10);
  return items
    .filter((i) => !doneStatuses.includes(i.status) && date(i) >= today)
    .slice(0, 6);
}
