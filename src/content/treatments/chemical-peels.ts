import { defineTreatment } from "@/lib/content/types";

export const chemicalPeels = defineTreatment({
  slug: "chemical-peels",
  name: "Chemical peels",
  alternateNames: ["AHA peel", "BHA peel", "TCA peel", "Glycolic peel"],
  shortDescription:
    "Topical acids applied to exfoliate the skin's surface, stimulate cell turnover, and improve tone, texture, and pigmentation.",
  category: "peel",
  downtime: "minimal",
  invasiveness: "topical",
  sessionsTypical: "Course of 4-6, every 2-4 weeks",
  resultsOnsetWeeks: "1-4",
  resultsDurationMonths: "6+",
  costRangeAed: { low: 350, high: 1800, perSession: true },
  concernSlugs: ["acne", "pigmentation", "wrinkles-and-fine-lines"],
  relatedTreatmentSlugs: ["microneedling"],
  subTreatments: [],
  comparisonSlugs: ["microneedling"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Chemical peels: types, depths & what they treat",
  metaDescription:
    "From light glycolic to deep TCA - which chemical peel suits your concern, downtime, and skin type.",
  faqs: [],
});
