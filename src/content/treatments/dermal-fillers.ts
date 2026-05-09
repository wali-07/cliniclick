import { defineTreatment } from "@/lib/content/types";

export const dermalFillers = defineTreatment({
  slug: "dermal-fillers",
  name: "Dermal fillers",
  alternateNames: ["Hyaluronic acid fillers", "HA fillers"],
  shortDescription:
    "Injectable gels - most commonly hyaluronic acid - used to restore volume, smooth lines, and contour the lips, cheeks, jawline, and tear troughs.",
  category: "injectable",
  downtime: "minimal",
  invasiveness: "injectable",
  sessionsTypical: "1 session, repeated every 6-18 months by area",
  resultsOnsetWeeks: "0-2",
  resultsDurationMonths: "6-18",
  costRangeAed: { low: 1500, high: 5500, perSession: true, notes: "Cost varies by syringe count and product." },
  concernSlugs: ["wrinkles-and-fine-lines", "under-eye-concerns"],
  relatedTreatmentSlugs: ["botox"],
  subTreatments: [],
  comparisonSlugs: ["botox"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Dermal fillers in Dubai: types, cost & what to expect",
  metaDescription:
    "What hyaluronic acid fillers do, how long they last, what they cost in Dubai, and how to choose a safe clinician.",
  faqs: [],
});
