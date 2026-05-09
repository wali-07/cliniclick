import { allMachines } from "@/content/machines";
import type { Machine } from "@/lib/content/types";

export function getAllMachines(): Machine[] {
  return allMachines;
}

export function getPublishedMachines(): Machine[] {
  return allMachines.filter((m) => m.published);
}

export function getMachineBySlug(slug: string): Machine | undefined {
  return allMachines.find((m) => m.slug === slug);
}

export function getMachinesForTreatment(treatmentSlug: string): Machine[] {
  return allMachines.filter(
    (m) => m.treatmentSlugs.includes(treatmentSlug) && m.published
  );
}
