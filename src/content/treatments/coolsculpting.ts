import { defineTreatment } from "@/lib/content/types";

export const coolsculpting = defineTreatment({
  slug: "coolsculpting",
  name: "CoolSculpting (cryolipolysis)",
  alternateNames: ["Cryolipolysis", "Fat freezing"],
  shortDescription:
    "Non-surgical fat reduction by controlled cooling that destroys fat cells, which the body then clears over weeks.",
  category: "device",
  downtime: "none",
  invasiveness: "energy-based",
  sessionsTypical: "1-2 sessions per area, repeated if needed",
  resultsOnsetWeeks: "8-12",
  resultsDurationMonths: "12+ with stable weight",
  costRangeAed: { low: 1500, high: 6000, perSession: true, notes: "Cost varies by applicator count and area." },
  concernSlugs: ["body-fat"],
  relatedTreatmentSlugs: [],
  subTreatments: [],
  comparisonSlugs: [],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "CoolSculpting in Dubai: results, risks & realistic expectations",
  metaDescription:
    "How cryolipolysis works, what fat it can and can't remove, the risk of paradoxical adipose hyperplasia, and what it costs in Dubai.",
  faqs: [],
});
