import { defineMachine } from "@/lib/content/types";

export const morpheus8 = defineMachine({
  slug: "morpheus8",
  name: "Morpheus8",
  alternateNames: [],
  manufacturer: "InMode",
  shortDescription:
    "A radiofrequency microneedling device that combines fine needles with controlled RF energy to remodel deeper layers of the skin.",
  kind: "machine",
  category: "microneedling-rf",
  treatmentSlugs: ["microneedling"],
  suitableSkinTypes: ["I", "II", "III", "IV", "V", "VI"],
  evidenceStrength: "moderate",
  subDevices: [],
  questionsToAsk: [
    "What depths and energy settings will you use for my concern?",
    "How many sessions are typical for the result I'm looking for?",
    "What's your protocol to reduce the risk of post-inflammatory hyperpigmentation on darker skin?",
  ],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Morpheus8: how RF microneedling actually works",
  metaDescription:
    "What Morpheus8 does, the evidence base for skin tightening and acne scarring, and what to ask if a clinic offers it.",
});
