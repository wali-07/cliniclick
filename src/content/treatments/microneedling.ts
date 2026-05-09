import { defineTreatment } from "@/lib/content/types";

export const microneedling = defineTreatment({
  slug: "microneedling",
  name: "Microneedling",
  alternateNames: ["Collagen induction therapy", "Dermapen"],
  shortDescription:
    "Tiny needles create controlled micro-injuries in the skin to stimulate collagen and improve scars, texture, and fine lines.",
  category: "device",
  downtime: "short",
  invasiveness: "minimally-invasive",
  sessionsTypical: "Course of 3-6, every 4-6 weeks",
  resultsOnsetWeeks: "4-8",
  resultsDurationMonths: "6-12",
  costRangeAed: { low: 600, high: 2500, perSession: true },
  concernSlugs: ["acne", "wrinkles-and-fine-lines", "pigmentation", "under-eye-concerns"],
  relatedTreatmentSlugs: ["chemical-peels", "prp"],
  subTreatments: [],
  comparisonSlugs: ["chemical-peels"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Microneedling: how it works, results & cost in Dubai",
  metaDescription:
    "What microneedling can and can't do, the role of PRP, and how to set realistic expectations for results.",
  faqs: [],
});
