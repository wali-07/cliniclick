import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

const calendarEntrySchema = z.object({
  slug: z.string(),
  parentType: z.enum(["concern", "treatment", "machine", "guide"]),
  parentSlug: z.string(),
  kind: z.enum([
    "overview",
    "explainer",
    "comparison",
    "cost-guide",
    "questions",
    "treatment-guide", // "How to treat X" - condition-led spoke
    "safety-guide", // safety/considerations spoke (skin tone, contraindications)
  ]),
  title: z.string(),
  keywords: z.array(z.string()).default([]),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum([
    "queued",
    "drafting",
    "in-review",
    "awaiting-approval",
    "approved",
    "published",
    "rejected",
    "skipped",
  ]),
  publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  brief: z.string().optional(),
  notes: z.string().optional(),
  rejectionNotes: z.string().optional(),
});
export type CalendarEntry = z.infer<typeof calendarEntrySchema>;

const calendarSchema = z.object({
  articles: z.array(calendarEntrySchema),
});

const CALENDAR_PATH = resolve(process.cwd(), "editorial/calendar.yaml");

export function loadCalendar(): CalendarEntry[] {
  const raw = readFileSync(CALENDAR_PATH, "utf-8");
  const parsed = yaml.load(raw);
  const validated = calendarSchema.parse(parsed);
  return validated.articles;
}

/**
 * Pick the next entry to draft. Defaults to the earliest queued entry whose
 * dueDate is on or before today. Pass an explicit slug to target a specific
 * entry regardless of date.
 */
export function pickEntry(opts: { slug?: string } = {}): CalendarEntry | null {
  const entries = loadCalendar();
  if (opts.slug) {
    return entries.find((e) => e.slug === opts.slug) ?? null;
  }
  const today = new Date().toISOString().slice(0, 10);
  const due = entries
    .filter((e) => e.status === "queued" && e.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return due[0] ?? null;
}

/**
 * Update a single entry's status (and optionally other fields) and write the
 * calendar back to disk. Preserves YAML formatting as best as js-yaml allows.
 */
export function updateEntry(
  slug: string,
  updates: Partial<Pick<CalendarEntry, "status" | "publishedDate" | "rejectionNotes" | "notes">>
): void {
  const entries = loadCalendar();
  const idx = entries.findIndex((e) => e.slug === slug);
  if (idx === -1) throw new Error(`Calendar entry not found: ${slug}`);
  entries[idx] = { ...entries[idx], ...updates };
  const yamlOut = yaml.dump(
    { articles: entries },
    { lineWidth: 100, noRefs: true, quotingType: '"' }
  );
  writeFileSync(CALENDAR_PATH, yamlOut, "utf-8");
}

/**
 * Pure string-in / string-out variant of updateEntry. Used by the
 * serverless pipeline where the calendar.yaml content is fetched from
 * GitHub and the updated YAML is committed back via the Trees API
 * (never written to disk). Validates the parsed source against the
 * same schema as loadCalendar() so corrupt input fails loudly.
 */
export function applyEntryUpdate(args: {
  yaml: string;
  slug: string;
  updates: Partial<Pick<CalendarEntry, "status" | "publishedDate" | "rejectionNotes" | "notes">>;
}): string {
  const parsed = yaml_load_validated(args.yaml);
  const idx = parsed.findIndex((e) => e.slug === args.slug);
  if (idx === -1) throw new Error(`Calendar entry not found: ${args.slug}`);
  parsed[idx] = { ...parsed[idx], ...args.updates };
  return yaml.dump(
    { articles: parsed },
    { lineWidth: 100, noRefs: true, quotingType: '"' }
  );
}

function yaml_load_validated(text: string): CalendarEntry[] {
  const raw = yaml.load(text);
  return calendarSchema.parse(raw).articles;
}

/**
 * Parse a calendar YAML string into CalendarEntry[]. Pure - no I/O.
 * Used by the serverless pipeline to inspect the calendar fetched from
 * GitHub before deciding what to draft.
 */
export function parseCalendar(text: string): CalendarEntry[] {
  return yaml_load_validated(text);
}
