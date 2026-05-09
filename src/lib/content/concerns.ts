import { allConcerns } from "@/content/concerns";
import type { Concern } from "@/lib/content/types";

export function getAllConcerns(): Concern[] {
  return allConcerns;
}

export function getPublishedConcerns(): Concern[] {
  return allConcerns.filter((c) => c.published);
}

export function getConcernBySlug(slug: string): Concern | undefined {
  return allConcerns.find((c) => c.slug === slug);
}

export function getConcernsByTreatmentSlug(treatmentSlug: string): Concern[] {
  return allConcerns.filter((c) => c.treatmentSlugs.includes(treatmentSlug) && c.published);
}
