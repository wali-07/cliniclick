import { defineArticle } from "@/lib/content/types";

export const whatIsBotox = defineArticle({
  slug: "what-is-botox",
  parentType: "treatment",
  parentSlug: "botox",
  kind: "overview",
  title: "What is botox",
  dek: "The most common cosmetic injection in the world - what it actually does, where it works, what it costs in the UAE, and what to weigh before you book.",
  eyebrow: "Treatment overview",
  lastReviewed: "2026-05-09",
  metaTitle: "What is botox? How it works, results, and what to ask",
  metaDescription:
    "Botox explained from first principles: what it is, how it works on a muscle, what it treats, what to expect during and after, costs in the UAE, and what to ask in your consultation.",
  keywords: [
    "what is botox",
    "botox explained",
    "how botox works",
    "botox cost dubai",
    "botulinum toxin",
    "anti-wrinkle injections",
  ],
  body: [
    {
      type: "paragraph",
      text: "Botox is the most common cosmetic procedure in the world. It is also the most quietly misunderstood. People describe it as \"freezing\" the face, but that is not quite right - and the gap between how it actually works and how it gets marketed is where most disappointing results come from. This is what botox is, what it does, what it does not do, and how to think about it before you sit in a consultation.[^1]",
    },

    {
      type: "heading",
      level: 2,
      text: "What botox actually is",
    },
    {
      type: "paragraph",
      text: "\"Botox\" is the brand name for one specific formulation of botulinum toxin type A, made by Allergan. There are several other brands of the same active toxin - Dysport, Xeomin, Jeuveau - that work similarly with small differences in dosing, onset, and how the protein is formulated.[^1] In everyday language people use \"botox\" to mean any of them. In a clinic, it is worth asking which brand you are receiving and why.",
    },
    {
      type: "paragraph",
      text: "Despite the word \"toxin,\" the medical use of botulinum toxin is well-studied. It has been used in medicine since the late 1980s for muscle spasms and crossed eyes, and was approved for cosmetic use by the FDA in 2002.[^2] The cosmetic dose is tiny relative to a harmful one - we are talking about a few units injected into a specific muscle, not a body-wide effect.",
    },

    {
      type: "heading",
      level: 2,
      text: "How it works on a muscle",
    },
    {
      type: "paragraph",
      text: "When a nerve tells a muscle to contract, it releases a chemical called acetylcholine across the gap between the nerve ending and the muscle fibre. Botulinum toxin temporarily blocks that release. The muscle does not get the signal, so it does not contract. It is not paralysed forever, and it does not lose tone permanently - the nerve grows new connections over a few months and the muscle gradually starts contracting again.[^2]",
    },
    {
      type: "callout",
      variant: "note",
      title: "Why \"frozen\" is misleading",
      text: "A well-dosed botox treatment softens muscle activity rather than eliminating it. The forehead can still rise, the eyebrows can still emote. The frozen look people associate with botox is almost always over-dosing or treating the wrong muscle - not what skilled, conservative use produces.",
    },

    {
      type: "heading",
      level: 2,
      text: "What it treats - and what it does not",
    },
    {
      type: "paragraph",
      text: "Botox works on **dynamic wrinkles** - the lines that appear when you make an expression. It does not work on **static wrinkles** - the lines that are visible even with your face at rest. The two are related: dynamic wrinkles tend to deepen into static ones over years of repeated movement. Botox is sometimes used preventatively for that reason.",
    },
    {
      type: "table",
      headers: ["Common areas", "What botox does there", "What it cannot do"],
      rows: [
        [
          "Forehead horizontal lines",
          "Softens the lines that show when you raise your eyebrows",
          "Cannot soften deep static lines that stay visible at rest"
        ],
        [
          "Frown lines (between brows, '11 lines')",
          "Relaxes the muscles that pull brows together",
          "Cannot fill the line itself if it has become a deep crease"
        ],
        [
          "Crow's feet (around the eyes)",
          "Reduces the lines that appear when you smile",
          "Cannot improve loose skin or undereye texture"
        ],
        [
          "Bunny lines (top of the nose)",
          "Smooths lines that crinkle when you scrunch your nose",
          "n/a"
        ],
        [
          "Masseter muscles (jaw slimming)",
          "Reduces the size of the chewing muscle to slim the lower face",
          "Does not change the underlying bone structure"
        ],
        [
          "Underarms or palms (hyperhidrosis)",
          "Blocks sweat-producing nerve signals for several months",
          "Not a cure - sweating returns when the toxin wears off"
        ],
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "When fillers are the answer instead",
      text: "If your concern is volume loss (sunken cheeks, hollow under-eyes, thinning lips) or static lines that stay visible at rest, dermal fillers do that job - botox does not. The two are often combined, but they treat different things. A clinician suggesting botox for everything is using one tool to solve a problem it was not built for.",
    },

    {
      type: "heading",
      level: 2,
      text: "What the appointment looks like",
    },
    {
      type: "list",
      style: "number",
      items: [
        "**Consultation.** A clinician examines your face at rest and in motion, identifies the muscles producing the lines you want softened, and agrees a plan including which brand, how many units, and where.",
        "**Marking.** Tiny dots mark the injection points. You may be asked to make expressions while this happens.",
        "**Injection.** A series of small injections - usually 4 to 20 across multiple sites depending on areas treated. The needle is fine and most people describe it as a quick pinch. No anaesthetic is normally needed.",
        "**Aftercare.** No lying down, no rubbing the area, no strenuous exercise, no facials, and no make-up over the sites for several hours. Most clinicians ask you to gently exercise the muscles for the first few hours.",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "What to expect afterwards",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Onset.** Botox does not work immediately. You typically see the first changes around day 3 to 5, with the full effect at day 10 to 14.[^1]",
        "**Duration.** The effect typically lasts 3 to 4 months. Some people get longer; some, especially with strong muscles or fast metabolisms, get shorter.",
        "**Common side effects.** Small bruises at injection sites, mild headache for a day or two, occasional brief heaviness in the brow.",
        "**Less common but real risks.** Eyelid drooping (ptosis), brow asymmetry, an unintended look from the toxin migrating to a nearby muscle. These usually resolve on their own as the toxin wears off, but they can last weeks.",
        "**Important contraindications.** Botox is not recommended in pregnancy or while breastfeeding, in certain neuromuscular conditions, or if you have an active infection in the treatment area.",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "What it costs in the UAE",
    },
    {
      type: "paragraph",
      text: "Botox in the UAE is usually priced one of two ways: per unit (typical range AED 30-80 per unit) or per area (typical range AED 700-2,500 per area). Different clinics use different brands, dose differently for the same person, and include or exclude follow-up sessions, so a sticker price comparison rarely tells the full story.[^3]",
    },
    {
      type: "callout",
      variant: "context",
      title: "Why prices vary so much",
      text: "Cost differences typically reflect the brand used, the experience and credentials of the injector, the units required for your specific muscles, and what the price includes (consultation, follow-up touch-up at 2 weeks, repeat sessions). Cheaper is not always lower-quality, and more expensive is not always better - what matters is whether the plan suits your face and the clinician has the experience to deliver it.",
    },

    {
      type: "heading",
      level: 2,
      text: "What to ask in your consultation",
    },
    {
      type: "checklist",
      items: [
        "Which brand of botulinum toxin will you use, and why that one?",
        "How many units do you recommend for me, and what is the rationale?",
        "Will you treat the muscles I am asking about, or do you recommend treating others as well?",
        "What does this price include - consultation, follow-up, top-ups?",
        "What outcome should I expect at 2 weeks, and what is the plan if I am unhappy?",
        "What are the specific risks for the areas you are injecting?",
        "How long have you been performing this specific procedure, and how often do you do it?",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "How to read marketing claims",
      id: "marketing-claims",
    },
    {
      type: "paragraph",
      text: "Botox is one of the most heavily marketed cosmetic procedures, which means it is also one of the most heavily over-promised. Treat the following claims with caution: \"natural-looking results guaranteed\" (no injectable can be guaranteed), \"painless and downtime-free\" (briefly true, but bruising is real), \"lasts 6+ months from one session\" (uncommon at standard doses), and any pricing that seems significantly below market without a clear reason. The clinics, products, and routines worth your time are the ones that explain timelines, side effects, brand choice, and what is included up front, before you book.",
    },
  ],
  faqs: [
    {
      question: "Does botox hurt?",
      answer:
        "Most people describe each injection as a brief pinch. The needle used is very fine, and the procedure is fast. Topical numbing is sometimes offered but is rarely necessary.",
    },
    {
      question: "How long until I see results?",
      answer:
        "First changes are usually visible at day 3 to 5, with full effect at day 10 to 14. If you have a follow-up booked, the standard is around the 2-week mark to assess and add small touch-ups if needed.",
    },
    {
      question: "Will my face look frozen?",
      answer:
        "A well-dosed treatment softens muscle activity without eliminating it - your face should still be expressive. The frozen look is almost always a sign of over-dosing or treating the wrong muscle. Conservative dosing on a first session is generally the safer choice; you can add more, you cannot take it away.",
    },
    {
      question: "What happens when I stop having botox?",
      answer:
        "Your muscles return to their previous activity over 3 to 4 months. Botox does not weaken or atrophy the muscle permanently. You will not look worse than you did before - your face simply returns to its natural pattern of movement and the dynamic lines come back.",
    },
    {
      question: "Is botox safe long-term?",
      answer:
        "Botulinum toxin has been used cosmetically since 2002 and medically for far longer. The published evidence on repeated cosmetic use is reassuring at standard doses with qualified injectors. Long-term safety still depends on dosing, site selection, and the experience of the clinician - which is why those questions matter more than the brand name.",
    },
    {
      question: "Can I get botox while pregnant or breastfeeding?",
      answer:
        "No. Botox is not recommended during pregnancy or while breastfeeding. There is not enough evidence to confirm safety, and the conservative position is to wait.",
    },
  ],
  sources: [
    {
      title: "Botulinum toxin injections",
      publisher: "NHS",
      url: "https://www.nhs.uk/conditions/cosmetic-procedures/botox-injections/",
      type: "guideline",
    },
    {
      title: "Botulinum Toxin (Botox)",
      publisher: "Cleveland Clinic",
      url: "https://my.clevelandclinic.org/health/treatments/22662-botox",
      type: "explainer",
    },
    {
      title: "Botulinum Toxin Type A - prescribing information",
      publisher: "U.S. Food & Drug Administration",
      url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/103000s5302lbl.pdf",
      type: "regulator",
    },
  ],
  relatedArticleSlugs: [],
  published: true,
});
