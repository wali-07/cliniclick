import { defineConcern } from "@/lib/content/types";

export const wrinklesAndFineLines = defineConcern({
  slug: "wrinkles-and-fine-lines",
  name: "Wrinkles & fine lines",
  shortDescription:
    "Forehead lines, frown lines, crow's feet, and perioral lines - caused by repeated muscle movement, collagen loss, and sun damage.",
  tier: "tier1",
  bodyArea: "face",
  audience: "all",
  treatmentSlugs: ["botox", "dermal-fillers", "microneedling", "chemical-peels"],
  subConcerns: [
    { slug: "forehead-lines", name: "Forehead lines", shortDescription: "Horizontal lines from raising the eyebrows." },
    { slug: "frown-lines", name: "Frown lines (11s)", shortDescription: "Vertical lines between the brows." },
    { slug: "crows-feet", name: "Crow's feet", shortDescription: "Fine lines radiating from the corners of the eyes." },
  ],
  relatedConcernSlugs: ["under-eye-concerns"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Wrinkles & fine lines: treatments that actually work",
  metaDescription:
    "From botox to skincare to lasers - which treatments are evidence-based for which type of wrinkle.",
  faqs: [],
});
