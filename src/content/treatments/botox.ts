import { defineTreatment } from "@/lib/content/types";

export const botox = defineTreatment({
  slug: "botox",
  name: "Botox",
  alternateNames: ["Botulinum toxin", "Wrinkle relaxers", "Anti-wrinkle injections"],
  shortDescription:
    "Injectable botulinum toxin that temporarily relaxes the muscles responsible for dynamic wrinkles like frown lines and crow's feet.",
  category: "injectable",
  downtime: "none",
  invasiveness: "injectable",
  sessionsTypical: "1 session, repeated every 3-4 months",
  resultsOnsetWeeks: "1-2",
  resultsDurationMonths: "3-4",
  costRangeAed: { low: 700, high: 2500, perSession: true, notes: "Cost varies by area and number of units." },
  concernSlugs: ["wrinkles-and-fine-lines"],
  relatedTreatmentSlugs: ["dermal-fillers"],
  subTreatments: [],
  comparisonSlugs: ["dermal-fillers"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Botox in Dubai: how it works, cost & what to expect",
  metaDescription:
    "An evidence-based guide to botox: how it works, what it treats, what it costs in Dubai, downtime, and what to look for in a clinician.",
  faqs: [],
});
