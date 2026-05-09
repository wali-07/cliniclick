import { allTreatments } from "@/content/treatments";
import type { Treatment } from "@/lib/content/types";

export function getAllTreatments(): Treatment[] {
  return allTreatments;
}

export function getPublishedTreatments(): Treatment[] {
  return allTreatments.filter((t) => t.published);
}

export function getTreatmentBySlug(slug: string): Treatment | undefined {
  return allTreatments.find((t) => t.slug === slug);
}

export function getTreatmentsForConcern(concernSlug: string): Treatment[] {
  return allTreatments.filter(
    (t) => t.concernSlugs.includes(concernSlug) && t.published
  );
}
