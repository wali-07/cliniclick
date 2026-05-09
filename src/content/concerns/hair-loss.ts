import { defineConcern } from "@/lib/content/types";

export const hairLoss = defineConcern({
  slug: "hair-loss",
  name: "Hair loss & thinning",
  shortDescription:
    "Pattern hair loss, telogen effluvium, and other forms of thinning that affect men and women - and the medical and procedural treatments that work.",
  tier: "tier1",
  bodyArea: "scalp",
  audience: "all",
  treatmentSlugs: ["prp"],
  subConcerns: [
    { slug: "male-pattern-hair-loss", name: "Male pattern hair loss", shortDescription: "Genetic, hormone-driven thinning at the crown and hairline." },
    { slug: "female-pattern-hair-loss", name: "Female pattern hair loss", shortDescription: "Diffuse thinning across the crown, common after hormonal shifts." },
    { slug: "postpartum-hair-loss", name: "Postpartum hair loss", shortDescription: "Temporary shedding 2-6 months after childbirth." },
  ],
  relatedConcernSlugs: [],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Hair loss: causes, evidence-based treatments & UAE clinics",
  metaDescription:
    "How to identify the type of hair loss you have, what treatments are proven to work, and what to expect from each.",
  faqs: [],
});
