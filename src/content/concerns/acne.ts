import { defineConcern } from "@/lib/content/types";

export const acne = defineConcern({
  slug: "acne",
  name: "Acne",
  shortDescription:
    "Spots, pimples, and breakouts caused by clogged pores, oil, bacteria, and inflammation - from occasional flare-ups to persistent cystic acne.",
  tier: "tier1",
  bodyArea: "face",
  audience: "all",
  treatmentSlugs: ["chemical-peels", "microneedling", "hydrafacial"],
  subConcerns: [
    {
      slug: "cystic-acne",
      name: "Cystic acne",
      shortDescription:
        "Deep, painful, inflamed acne lesions that often leave scarring without medical treatment.",
    },
    {
      slug: "hormonal-acne",
      name: "Hormonal acne",
      shortDescription:
        "Acne driven by hormonal cycles, typically along the jawline and chin in adult women.",
    },
    {
      slug: "acne-scars",
      name: "Acne scars",
      shortDescription:
        "Atrophic, hypertrophic, or pigmented marks left behind after acne resolves.",
    },
  ],
  relatedConcernSlugs: ["pigmentation", "skin-texture-and-pores"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Acne: causes, types & evidence-based treatments in the UAE",
  metaDescription:
    "Understand the causes of acne, the difference between acne types, and which evidence-based treatments are available in the UAE.",
  faqs: [
    {
      question: "What causes acne?",
      answer:
        "Acne develops when hair follicles become blocked by oil and dead skin cells, allowing the bacterium Cutibacterium acnes to grow and trigger inflammation.",
    },
  ],
});
