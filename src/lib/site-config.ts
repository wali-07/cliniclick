export const siteConfig = {
  name: "CliniClick",
  legalName: "CliniClick FZ-LLC",
  tagline: "Aesthetic medicine, honestly explained.",
  description:
    "The UAE's evidence-based guide to aesthetic treatments - concerns, treatments, devices, and practical guides for everything you need to know before you book.",
  url: "https://cliniclick.ae",
  ogImage: "https://cliniclick.ae/og.png",
  locale: "en-AE",
  country: "AE",
  primaryRegion: "Dubai",
  twitter: "@cliniclick",
  editorial: {
    url: "/how-we-write-our-content",
  },
  contact: {
    email: "hello@cliniclick.ae",
    feedback: "feedback@cliniclick.ae",
  },
  nav: {
    primary: [
      { label: "Concerns", href: "/concerns" },
      { label: "Treatments", href: "/treatments" },
      { label: "Devices", href: "/machines" },
      { label: "Guides", href: "/learn" },
    ],
    secondary: [
      { label: "Quiz", href: "/quiz" },
      { label: "Glossary", href: "/glossary" },
    ],
    footer: [
      { label: "About", href: "/about" },
      { label: "How we write our content", href: "/how-we-write-our-content" },
      { label: "Editorial policy", href: "/editorial-policy" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
