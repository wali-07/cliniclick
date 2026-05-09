import { defineMachine } from "@/lib/content/types";

export const juvederm = defineMachine({
  slug: "juvederm",
  name: "Juvederm",
  alternateNames: ["Juvederm hyaluronic acid fillers", "JUVÉDERM"],
  manufacturer: "Allergan / AbbVie",
  shortDescription:
    "A family of hyaluronic acid dermal fillers used to add volume to the face, smooth lines, and refine specific facial areas.",
  kind: "brand",
  category: "injectable-brand",
  treatmentSlugs: ["dermal-fillers"],
  suitableSkinTypes: ["I", "II", "III", "IV", "V", "VI"],
  evidenceStrength: "strong",
  questionsToAsk: [
    "Which Juvederm product will be used on me, and why?",
    "How many syringes are you recommending and why that amount?",
    "What's your protocol if I'm not happy with the result?",
    "How is the product stored and is it from an authorised supplier?",
  ],
  subDevices: [
    {
      slug: "juvederm-voluma",
      name: "Juvederm Voluma",
      shortDescription: "A firmer, longer-lasting filler designed for cheek volume and chin/jawline contouring.",
      focusArea: "Cheeks, chin, jawline",
    },
    {
      slug: "juvederm-vollure",
      name: "Juvederm Vollure",
      shortDescription: "A medium-firmness filler used for nasolabial folds and moderate facial lines.",
      focusArea: "Nasolabial folds, marionette lines",
    },
    {
      slug: "juvederm-volbella",
      name: "Juvederm Volbella",
      shortDescription: "A softer filler designed for lip enhancement and fine perioral lines.",
      focusArea: "Lips, perioral area",
    },
    {
      slug: "juvederm-volift",
      name: "Juvederm Volift",
      shortDescription: "A versatile mid-range filler for lip volume and cheek enhancement.",
      focusArea: "Lips, cheeks",
    },
  ],
  sources: [],
  published: true,
  lastReviewed: "2026-05-09",
  metaTitle: "Juvederm: the hyaluronic acid filler family explained",
  metaDescription:
    "Each Juvederm product, what it's used for, and the questions worth asking before treatment.",
});
