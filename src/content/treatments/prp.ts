import { defineTreatment } from "@/lib/content/types";

export const prp = defineTreatment({
  slug: "prp",
  name: "PRP (platelet-rich plasma)",
  alternateNames: ["Vampire facial", "Platelet-rich plasma therapy"],
  shortDescription:
    "Plasma drawn from your own blood is concentrated and reintroduced to stimulate hair growth, skin healing, and collagen.",
  category: "injectable",
  downtime: "minimal",
  invasiveness: "injectable",
  sessionsTypical: "Course of 3-4, every 4 weeks",
  resultsOnsetWeeks: "8-12",
  resultsDurationMonths: "6-12",
  costRangeAed: { low: 800, high: 3500, perSession: true },
  concernSlugs: ["hair-loss", "under-eye-concerns"],
  relatedTreatmentSlugs: ["microneedling"],
  subTreatments: [],
  comparisonSlugs: [],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "PRP for hair & skin: what the evidence actually shows",
  metaDescription:
    "Where PRP works, where the evidence is mixed, and how to evaluate clinics offering it in Dubai.",
  faqs: [],
});
