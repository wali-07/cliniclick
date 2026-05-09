import { defineTreatment } from "@/lib/content/types";

export const hydrafacial = defineTreatment({
  slug: "hydrafacial",
  name: "HydraFacial",
  alternateNames: ["Hydrodermabrasion"],
  shortDescription:
    "A device-based facial that combines exfoliation, extraction, and serum infusion in a single session, with no downtime.",
  category: "device",
  downtime: "none",
  invasiveness: "topical",
  sessionsTypical: "Single sessions or monthly for maintenance",
  resultsOnsetWeeks: "0",
  resultsDurationMonths: "1-2",
  costRangeAed: { low: 350, high: 1500, perSession: true },
  concernSlugs: ["acne", "pigmentation"],
  relatedTreatmentSlugs: ["chemical-peels"],
  subTreatments: [],
  comparisonSlugs: [],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "HydraFacial: what it actually does and what it doesn't",
  metaDescription:
    "Honest assessment of HydraFacial - what it cleans, hydrates, and brightens, and what it can't substitute for.",
  faqs: [],
});
