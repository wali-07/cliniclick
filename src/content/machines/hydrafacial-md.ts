import { defineMachine } from "@/lib/content/types";

export const hydrafacialMd = defineMachine({
  slug: "hydrafacial-md",
  name: "HydraFacial MD",
  alternateNames: [],
  manufacturer: "HydraFacial (Bausch + Lomb)",
  shortDescription:
    "A device-based facial that combines exfoliation, vacuum-assisted extraction, and serum infusion in one session, with no downtime.",
  kind: "machine",
  category: "other",
  treatmentSlugs: ["hydrafacial"],
  suitableSkinTypes: ["I", "II", "III", "IV", "V", "VI"],
  evidenceStrength: "limited",
  subDevices: [],
  questionsToAsk: [
    "Which serums will be used in my treatment, and what are they for?",
    "How long does the result typically last?",
    "What's a realistic expectation - what this can and can't address?",
  ],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "HydraFacial MD: what the device actually does",
  metaDescription:
    "An honest look at HydraFacial MD - what it cleans, hydrates, and brightens, and what it can't substitute for.",
});
