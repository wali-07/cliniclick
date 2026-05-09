import { defineMachine } from "@/lib/content/types";

export const coolsculptingElite = defineMachine({
  slug: "coolsculpting-elite",
  name: "CoolSculpting Elite",
  alternateNames: [],
  manufacturer: "AbbVie / Allergan",
  shortDescription:
    "A non-surgical fat-reduction device using cryolipolysis - controlled cooling that targets fat cells, which the body clears over weeks.",
  kind: "machine",
  category: "cryolipolysis",
  treatmentSlugs: ["coolsculpting"],
  suitableSkinTypes: [],
  evidenceStrength: "strong",
  subDevices: [],
  questionsToAsk: [
    "Am I an appropriate candidate based on the kind of fat I want to reduce?",
    "How many cycles per session, and how many sessions do you typically recommend for my goals?",
    "What's the published rate of paradoxical adipose hyperplasia, and how would you handle it?",
  ],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "CoolSculpting Elite: what cryolipolysis can and can't do",
  metaDescription:
    "How CoolSculpting Elite works, who it suits, the risk of paradoxical adipose hyperplasia, and how to set realistic expectations.",
});
