import { defineConcern } from "@/lib/content/types";

export const underEyeConcerns = defineConcern({
  slug: "under-eye-concerns",
  name: "Dark circles & under-eye concerns",
  shortDescription:
    "Discoloration, hollowing, fine lines, and puffiness under the eyes - usually a mix of pigmentation, vascular shadowing, and volume loss.",
  tier: "tier1",
  bodyArea: "face",
  audience: "all",
  treatmentSlugs: ["dermal-fillers", "prp", "chemical-peels", "microneedling"],
  subConcerns: [
    { slug: "dark-circles", name: "Dark circles", shortDescription: "Discoloration under the eyes from pigmentation, vascular shadowing, or both." },
    { slug: "tear-trough-hollows", name: "Tear-trough hollows", shortDescription: "Loss of volume between the lower eyelid and cheek, casting a shadow." },
    { slug: "under-eye-puffiness", name: "Under-eye puffiness", shortDescription: "Fluid retention or fat protrusion below the eyes." },
  ],
  relatedConcernSlugs: ["pigmentation", "wrinkles-and-fine-lines"],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Dark circles & under-eye treatment options in the UAE",
  metaDescription:
    "What actually causes dark circles, hollows, and puffiness under the eyes, and which treatments are evidence-based for each cause.",
  faqs: [],
});
