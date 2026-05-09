import { defineMachine } from "@/lib/content/types";

export const candelaGentleMaxPro = defineMachine({
  slug: "candela-gentlemax-pro",
  name: "Candela GentleMax Pro",
  alternateNames: ["GentleMax Pro Plus"],
  manufacturer: "Candela",
  shortDescription:
    "A dual-wavelength laser (755 nm Alexandrite + 1064 nm Nd:YAG) used for hair removal and a range of vascular and pigmented lesions.",
  kind: "machine",
  category: "laser",
  treatmentSlugs: ["laser-hair-removal"],
  suitableSkinTypes: ["I", "II", "III", "IV", "V", "VI"],
  evidenceStrength: "strong",
  subDevices: [],
  questionsToAsk: [
    "Will you use the Alexandrite or the Nd:YAG wavelength on me, and why?",
    "How does the cooling system protect my skin during treatment?",
    "What outcomes have you seen on Fitzpatrick V-VI skin?",
  ],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Candela GentleMax Pro: what the dual-wavelength laser does",
  metaDescription:
    "How the Candela GentleMax Pro works, the difference between its Alexandrite and Nd:YAG wavelengths, and what to ask before treatment.",
});
