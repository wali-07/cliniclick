import { defineConcern } from "@/lib/content/types";

export const unwantedHair = defineConcern({
  slug: "unwanted-hair",
  name: "Unwanted body & facial hair",
  shortDescription:
    "Coarse or visible hair on the face or body that shaving, waxing, and threading only address temporarily.",
  tier: "tier1",
  bodyArea: "general",
  audience: "all",
  treatmentSlugs: ["laser-hair-removal"],
  subConcerns: [
    {
      slug: "facial-hair",
      name: "Facial hair",
      shortDescription: "Coarse or visible hair on the upper lip, chin, jawline, sideburns, or cheeks.",
    },
    {
      slug: "body-hair",
      name: "Body hair",
      shortDescription: "Hair on arms, legs, back, chest, and other body areas.",
    },
    {
      slug: "sensitive-areas",
      name: "Sensitive areas",
      shortDescription: "Underarms, bikini line, and other delicate zones that need gentler approaches.",
    },
  ],
  relatedConcernSlugs: [],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Unwanted hair: laser hair removal & alternatives in the UAE",
  metaDescription:
    "How laser hair removal works, who it's suitable for, alternatives, and what to expect from a course of treatment.",
  faqs: [],
});
