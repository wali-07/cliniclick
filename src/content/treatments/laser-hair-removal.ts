import { defineTreatment } from "@/lib/content/types";

export const laserHairRemoval = defineTreatment({
  slug: "laser-hair-removal",
  name: "Laser hair removal",
  alternateNames: ["Diode laser", "Alexandrite laser", "Nd:YAG laser"],
  shortDescription:
    "Light-based treatment that targets the pigment in hair follicles to reduce hair growth over a course of sessions.",
  category: "laser",
  downtime: "none",
  invasiveness: "energy-based",
  sessionsTypical: "6-10 sessions every 4-6 weeks, with maintenance",
  resultsOnsetWeeks: "1-2 per session",
  resultsDurationMonths: "12+ with maintenance",
  costRangeAed: { low: 200, high: 2500, perSession: true, notes: "Cost varies dramatically by area size." },
  concernSlugs: ["unwanted-hair"],
  relatedTreatmentSlugs: [],
  subTreatments: [],
  comparisonSlugs: [],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Laser hair removal in Dubai: cost, sessions & what works",
  metaDescription:
    "How laser hair removal actually works, how many sessions you'll need, what it costs in Dubai, and which laser type matches your skin.",
  faqs: [],
});
