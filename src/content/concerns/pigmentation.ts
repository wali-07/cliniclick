import { defineConcern } from "@/lib/content/types";

export const pigmentation = defineConcern({
  slug: "pigmentation",
  name: "Pigmentation & uneven skin tone",
  shortDescription:
    "Dark patches, sun spots, melasma, and post-inflammatory marks left by acne or irritation.",
  tier: "tier1",
  bodyArea: "face",
  audience: "all",
  treatmentSlugs: ["chemical-peels", "microneedling", "hydrafacial"],
  subConcerns: [
    { slug: "melasma", name: "Melasma", shortDescription: "Hormone-driven brown patches, often on the cheeks and forehead." },
    { slug: "sun-spots", name: "Sun spots", shortDescription: "Flat brown spots from cumulative UV exposure." },
    { slug: "post-inflammatory-hyperpigmentation", name: "Post-inflammatory pigmentation", shortDescription: "Dark marks left after acne or skin trauma resolves." },
  ],
  relatedConcernSlugs: ["acne"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Pigmentation: melasma, sun spots & treatment options",
  metaDescription:
    "Understand why pigmentation happens, why it's especially common in the Gulf, and which evidence-based treatments work for which type.",
  faqs: [],
});
