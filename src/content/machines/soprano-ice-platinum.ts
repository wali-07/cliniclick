import { defineMachine } from "@/lib/content/types";

export const sopranoIcePlatinum = defineMachine({
  slug: "soprano-ice-platinum",
  name: "Soprano Ice Platinum",
  alternateNames: ["Soprano Platinum", "Alma Soprano"],
  manufacturer: "Alma Lasers",
  shortDescription:
    "A diode-laser hair-removal platform that combines three wavelengths (755, 810, and 1064 nm) for use across a wide range of skin tones.",
  kind: "machine",
  category: "laser",
  treatmentSlugs: ["laser-hair-removal"],
  suitableSkinTypes: ["I", "II", "III", "IV", "V", "VI"],
  evidenceStrength: "strong",
  subDevices: [],
  questionsToAsk: [
    "Which wavelength will be used for my skin tone?",
    "Will you do a test patch first?",
    "Who operates the device - a doctor, nurse, or technician?",
    "How many sessions are typical for the area I want treated?",
  ],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Soprano Ice Platinum: how the diode laser actually works",
  metaDescription:
    "An evidence-based explainer on the Soprano Ice Platinum laser - what wavelengths it uses, who it suits, and what to ask if a clinic offers it.",
});
