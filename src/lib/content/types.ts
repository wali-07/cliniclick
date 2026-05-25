import { z } from "zod";

export const concernTierSchema = z.enum(["tier1", "tier2", "tier3"]);
export type ConcernTier = z.infer<typeof concernTierSchema>;

export const downtimeSchema = z.enum(["none", "minimal", "short", "moderate", "significant"]);
export const invasivenessSchema = z.enum(["topical", "minimally-invasive", "injectable", "energy-based", "surgical"]);
export const sexAppealSchema = z.enum(["all", "women", "men"]);

export const sourceSchema = z.object({
  title: z.string(),
  publisher: z.string(),
  /**
   * Optional - omit when the Drafter cannot verify the exact URL exists.
   * When present, Link Health validates that it is reachable. When absent,
   * the renderer shows the citation as plain text (still attributable but
   * not clickable). Better to ship an attributed citation than to ship a
   * broken URL or to drop the citation entirely.
   */
  url: z.string().url().optional(),
  type: z.enum(["guideline", "review", "study", "explainer", "regulator"]),
});
export type Source = z.infer<typeof sourceSchema>;

export const concernSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().optional(),
  tier: concernTierSchema,
  bodyArea: z.enum(["face", "body", "scalp", "general"]),
  audience: sexAppealSchema.default("all"),
  treatmentSlugs: z.array(z.string()),
  subConcerns: z
    .array(
      z.object({
        slug: z.string(),
        name: z.string(),
        shortDescription: z.string(),
      })
    )
    .default([]),
  relatedConcernSlugs: z.array(z.string()).default([]),
  sources: z.array(sourceSchema).default([]),
  published: z.boolean().default(false),
  lastReviewed: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
});
export type Concern = z.infer<typeof concernSchema>;

export const treatmentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  alternateNames: z.array(z.string()).default([]),
  shortDescription: z.string(),
  longDescription: z.string().optional(),
  category: z.enum([
    "injectable",
    "laser",
    "energy",
    "topical",
    "peel",
    "surgical",
    "transplant",
    "device",
    "other",
  ]),
  downtime: downtimeSchema,
  invasiveness: invasivenessSchema,
  sessionsTypical: z.string().optional(),
  resultsOnsetWeeks: z.string().optional(),
  resultsDurationMonths: z.string().optional(),
  costRangeAed: z
    .object({
      low: z.number(),
      high: z.number(),
      perSession: z.boolean().default(true),
      notes: z.string().optional(),
    })
    .optional(),
  concernSlugs: z.array(z.string()),
  relatedTreatmentSlugs: z.array(z.string()).default([]),
  comparisonSlugs: z.array(z.string()).default([]),
  /**
   * Sub-treatments (e.g. "lip fillers" under "dermal fillers"). Each is a
   * specific application or focus area of the parent treatment, with its own
   * page at /treatments/[slug]/[subSlug] for SEO topical clustering.
   */
  subTreatments: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/),
        name: z.string(),
        shortDescription: z.string(),
        focusArea: z.string().optional(),
      })
    )
    .default([]),
  sources: z.array(sourceSchema).default([]),
  published: z.boolean().default(false),
  lastReviewed: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
});
export type Treatment = z.infer<typeof treatmentSchema>;

/**
 * Device - covers both physical machines (lasers, RF devices, cryolipolysis) AND
 * branded product lines (Juvederm, Allergan, Galderma) that sit between treatments
 * and clinics. Sub-devices nest underneath: e.g., Juvederm → Juvederm Voluma /
 * Vollure / Volbella, with each getting its own /machines/[slug]/[subSlug] page
 * for SEO topical clustering.
 */
export const machineSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  alternateNames: z.array(z.string()).default([]),
  manufacturer: z.string().optional(),
  shortDescription: z.string(),
  longDescription: z.string().optional(),
  /** Whether this entry is a physical machine, an injectable brand line, or another product type. */
  kind: z.enum(["machine", "brand", "product"]).default("machine"),
  category: z.enum([
    "laser",
    "rf",
    "ultrasound",
    "cryolipolysis",
    "ipl",
    "microneedling-rf",
    "led",
    "injectable-device",
    "injectable-brand",
    "other",
  ]),
  treatmentSlugs: z.array(z.string()),
  suitableSkinTypes: z
    .array(z.enum(["I", "II", "III", "IV", "V", "VI"]))
    .default([]),
  evidenceStrength: z.enum(["strong", "moderate", "emerging", "limited"]).optional(),
  questionsToAsk: z.array(z.string()).default([]),
  /** Sub-devices nested under this entry. For brands, each sub-device is a named product. */
  subDevices: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/),
        name: z.string(),
        shortDescription: z.string(),
        focusArea: z.string().optional(),
      })
    )
    .default([]),
  sources: z.array(sourceSchema).default([]),
  published: z.boolean().default(false),
  lastReviewed: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
export type Machine = z.infer<typeof machineSchema>;

/**
 * Clinic - designed for Phase 2 directory. Booking lookups go: Concern/Treatment/Machine
 * → reverse-resolve to Clinics whose treatmentSlugs/machineSlugs/concernSlugs include the slug.
 * Not rendered or populated in Phase 1; the type exists so the data layer is consistent.
 */
export const clinicSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  dhaLicenseNumber: z.string(),
  areasServed: z.array(z.string()),
  languages: z.array(z.string()),
  hasFemalePractitioners: z.boolean().default(false),
  hasPrayerRoom: z.boolean().default(false),
  womenOnlyHours: z.boolean().default(false),
  /** All booking lookups depend on these reverse-index arrays. */
  concernSlugs: z.array(z.string()).default([]),
  treatmentSlugs: z.array(z.string()),
  machineSlugs: z.array(z.string()),
  practitionerSlugs: z.array(z.string()).default([]),
  priceTier: z.enum(["$", "$$", "$$$"]).optional(),
  typicalConsultationFeeAed: z.number().optional(),
  hours: z.string().optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  verified: z.boolean().default(false),
  published: z.boolean().default(false),
});
export type Clinic = z.infer<typeof clinicSchema>;

/**
 * Practitioner - individual clinician (doctor / nurse-practitioner / aesthetician).
 * Designed-for Phase 2/3 booking. Searchable by name, by treatments offered,
 * by concerns addressed, by devices used. Sits inside one or more clinics.
 */
export const practitionerSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  title: z.string(),
  credential: z.string().optional(),
  dhaLicenseNumber: z.string().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).default([]),
  /** Reverse-index arrays for booking search */
  concernSlugs: z.array(z.string()).default([]),
  treatmentSlugs: z.array(z.string()).default([]),
  machineSlugs: z.array(z.string()).default([]),
  clinicSlugs: z.array(z.string()),
  yearsOfExperience: z.number().optional(),
  verified: z.boolean().default(false),
  published: z.boolean().default(false),
});
export type Practitioner = z.infer<typeof practitionerSchema>;

/**
 * Article - long-form content that lives as a sub-page under a Concern, Treatment,
 * or Machine hub (e.g., /concerns/acne/what-is-acne). Body is a structured block
 * array (no MDX yet - kept TS-pure so editorial agents can manipulate it as data).
 *
 * Inline text in `paragraph` blocks supports a small markdown subset:
 *   - **bold**
 *   - [link text](https://...)
 *   - [^1] reference to a numbered source in the `sources` array (1-indexed)
 *   - [glossary term](#glossary:term-slug) for hover-defined glossary terms
 */
export const articleBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string(),
    /** Optional explicit anchor id; otherwise auto-derived from text. */
    id: z.string().optional(),
  }),
  z.object({
    type: z.literal("paragraph"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("list"),
    style: z.enum(["bullet", "number"]),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal("callout"),
    variant: z.enum(["info", "warning", "note", "context"]),
    title: z.string().optional(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string(),
    attribution: z.string().optional(),
  }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal("checklist"),
    title: z.string().optional(),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal("image"),
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  }),
]);
export type ArticleBlock = z.infer<typeof articleBlockSchema>;

export const articleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /**
   * "guide" articles are top-level explainers without a hub parent - they
   * live at /learn/[slug]. parentSlug for guides is a category tag for
   * file-tree organisation (e.g. "pricing", "regulation"), not a real entity
   * slug.
   */
  parentType: z.enum(["concern", "treatment", "machine", "guide"]),
  parentSlug: z.string(),
  kind: z.enum([
    "overview", // "What is X" - one per parent, required
    "explainer", // facet article ("Causes of acne", "How it works")
    "comparison", // "X vs Y"
    "cost-guide", // "Cost of X in Dubai"
    "questions", // "Questions to ask in your consultation"
    "treatment-guide", // "How to treat X" - condition-led practical spoke
    "safety-guide", // safety/considerations spoke (skin tone, contraindications)
  ]),
  title: z.string(),
  /** One-line subhead under the H1. Drop trailing periods. */
  dek: z.string(),
  /** Optional category tag for the eyebrow above H1. Defaults derived from `kind`. */
  eyebrow: z.string().optional(),

  body: z.array(articleBlockSchema),

  sources: z.array(sourceSchema).default([]),

  /** YYYY-MM-DD. Drives the "Last reviewed" trust signal. */
  lastReviewed: z.string(),
  /** Estimated reading minutes; auto-computed in renderer if omitted. */
  readingMinutes: z.number().optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  /** Target SEO keywords for this article (Phase 1 used for ordering hints). */
  keywords: z.array(z.string()).default([]),

  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),

  /** Sibling/cluster articles to surface in the "Related" section. */
  relatedArticleSlugs: z.array(z.string()).default([]),

  /**
   * Editorial hero illustration. Generated by the Visuals Agent (Recraft),
   * cleared by the Image-Brand + Image-Safety agents, and committed as an
   * optimised WebP under /public/article-images/. Optional: coming-soon
   * stubs and not-yet-backfilled articles render without it.
   */
  heroImage: z
    .object({
      /** Site-relative path, e.g. "/article-images/what-is-acne.webp". */
      src: z.string(),
      /** Descriptive alt text - accessibility + image-search SEO. */
      alt: z.string(),
      /** Optional visible caption under the image. */
      caption: z.string().optional(),
      /** Source pixel dimensions (>=1200px wide for Discover eligibility). */
      width: z.number().optional(),
      height: z.number().optional(),
      /** Recraft prompt used - provenance + regeneration. */
      prompt: z.string().optional(),
      /** Generator + style id, e.g. "recraft-v3:style_abc123". */
      generatedBy: z.string().optional(),
    })
    .optional(),

  published: z.boolean().default(false),
});
export type Article = z.infer<typeof articleSchema>;

export function defineConcern(c: Concern): Concern {
  return concernSchema.parse(c);
}

export function defineTreatment(t: Treatment): Treatment {
  return treatmentSchema.parse(t);
}

export function defineMachine(m: Machine): Machine {
  return machineSchema.parse(m);
}

export function defineArticle(a: Article): Article {
  return articleSchema.parse(a);
}
