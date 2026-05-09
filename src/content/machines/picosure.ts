import { defineMachine } from "@/lib/content/types";

export const picosure = defineMachine({
  slug: "picosure",
  name: "PicoSure",
  alternateNames: [],
  manufacturer: "Cynosure",
  shortDescription:
    "A picosecond-pulse laser used for pigmentation, tattoo removal, and skin-revitalisation indications, delivering energy in trillionths of a second.",
  kind: "machine",
  category: "laser",
  treatmentSlugs: ["chemical-peels"],
  suitableSkinTypes: ["I", "II", "III", "IV", "V"],
  evidenceStrength: "moderate",
  subDevices: [],
  questionsToAsk: [
    "What's your experience using PicoSure on darker skin types?",
    "How does picosecond delivery compare to nanosecond Q-switched for my specific concern?",
    "What aftercare protocol do you follow to reduce post-inflammatory pigmentation risk?",
  ],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "PicoSure: how picosecond lasers actually work",
  metaDescription:
    "What a picosecond laser does, where the evidence is strong, and how to evaluate clinics offering PicoSure for pigmentation in the UAE.",
});
