import { defineArticle } from "@/lib/content/types";

export const whatIsChemicalPeels = defineArticle({
  heroImage: {
    "src": "/article-images/what-is-chemical-peels.webp",
    "alt": "A single whole fresh lemon with textured yellow skin on a flat solid warm coral background.",
    "width": 1344,
    "height": 768,
    "prompt": "Premium editorial still-life photograph, real photography, soft natural studio light, crisp focus. A single whole fresh lemon, complete and undamaged, with its naturally textured bright yellow skin, centred with generous empty space around it. The lemon is modest in scale — roughly one third of the frame. The background is a single flat solid warm coral colour, seamless, no gradient, no vignette, no second colour, no visible surface or horizon line. Soft natural drop shadow beneath the lemon. Natural colours, no props, no labels, no text, no people, no medical items. NOT an illustration, NOT a 3D/CGI render.",
    "generatedBy": "recraft:recraftv4"
  }, // @generated-hero
  slug: "what-is-chemical-peels",
  parentType: "treatment",
  parentSlug: "chemical-peels",
  kind: "overview",
  title: "What Are Chemical Peels",
  dek: "A guide to how chemical peels work, which depth tier suits which concern, and what darker skin tones need to know before booking",
  eyebrow: "TREATMENT OVERVIEW",
  lastReviewed: "2025-07-10",
  metaTitle: "Chemical Peels Explained: Depths, Acids & Skin Tones",
  metaDescription: "Chemical peels remove damaged skin and resurface texture - but depth, acid choice, and skin tone all determine whether yours is safe and effective.",
  keywords: [
    "what are chemical peels",
    "chemical peels explained",
    "glycolic peel",
    "tca peel",
    "chemical peel dark skin",
    "chemical peel hyperpigmentation",
    "chemical peel for acne",
    "chemical peel aftercare",
  ],
  body: [
    {
      type: "paragraph",
      text: "Chemical peels have been around for decades, yet they remain one of the most misunderstood treatments in aesthetic medicine. Some people picture dramatic, raw skin and weeks of hiding indoors. Others assume a 'peel' is just a fancy term for an expensive face mask. The truth sits somewhere more practical: a [chemical peel](/treatments/chemical-peels) is a controlled, acid-based treatment that removes a precise layer of skin to prompt fresher, more even skin to surface. Done at the right depth for the right concern on the right skin tone, the results are well-documented. Done without that matching, the risks - especially post-inflammatory hyperpigmentation (PIH, or dark patches triggered by skin trauma) - are equally real. This guide walks you through exactly how peels work, what the three depth tiers mean for your skin, and the questions worth asking before you book.",
    },
    {
      type: "heading",
      level: 2,
      text: "How chemical peels work",
    },
    {
      type: "paragraph",
      text: "A chemical peel applies an acidic solution to the skin for a set contact time. The acid disrupts the bonds holding dead and damaged skin cells together, causing controlled exfoliation and - depending on depth - triggering the skin's wound-healing response. That healing response is where the real benefit lies: the skin produces new collagen, sheds uneven pigmentation, and resurfaces with a smoother texture.[^1]",
    },
    {
      type: "list",
      style: "number",
      items: [
        "**Acid application** - the solution is applied to cleansed skin at a controlled concentration and pH.",
        "**Cell bond disruption** - the acid breaks down bonds in the target layer, whether epidermis only or reaching into the dermis for deeper peels.",
        "**Skin response** - the skin accelerates cell turnover and, for medium and deep peels, triggers collagen remodeling.",
        "**Shedding** - the treated layer sheds over days to weeks, revealing newer skin beneath.",
        "**Pigment redistribution** - melanin shifts as the skin repairs, which is why peels can improve uneven tone - but also why incorrect depth or aftercare can worsen it.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "The three depth tiers",
    },
    {
      type: "paragraph",
      text: "Peel depth determines what concerns a peel can address, how much downtime you face, and how much care is needed around skin tone. Depth is controlled by acid type, concentration, and contact time - not just by the name on the bottle.",
    },
    {
      type: "table",
      headers: ["Depth", "Common acids", "Penetrates to", "Typical downtime", "Best suited for"],
      rows: [
        ["Superficial", "Glycolic acid (AHA), salicylic acid (BHA), lactic acid, mandelic acid", "Epidermis only", "Little to none; mild flaking 2-5 days", "Dull texture, mild acne, minor uneven tone, maintenance"],
        ["Medium", "TCA (trichloroacetic acid) 20-35%, Jessner's + TCA", "Papillary dermis", "5-10 days; peeling, redness, swelling", "Sun damage, moderate pigmentation, acne scarring, fine lines"],
        ["Deep", "Phenol (carbolic acid), high-concentration TCA", "Reticular dermis", "2-3 weeks; significant crusting, redness persisting months", "Severe sun damage, deep wrinkles, significant scarring"],
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Superficial does not mean ineffective",
      text: "A well-chosen superficial peel done in a series can achieve results comparable to a single medium peel - with far less downtime and far lower risk. Depth should match the concern, not the desire to do 'something stronger'.",
    },
    {
      type: "heading",
      level: 2,
      text: "What chemical peels treat - and what they do not",
    },
    {
      type: "table",
      headers: ["Concern", "Superficial", "Medium", "Deep"],
      rows: [
        ["Dull or rough texture", "Strong fit", "Strong fit", "Possible (overkill for texture alone)"],
        ["Active acne and congestion", "Strong fit - salicylic BHA especially", "Possible", "Not indicated"],
        ["Post-acne marks (flat, dark)", "With series", "Strong fit", "Possible"],
        ["Melasma and diffuse pigmentation", "Possible, carefully", "Possible with caution", "Not recommended"],
        ["Moderate acne scars (atrophic)", "Partial improvement", "Strong fit", "Strong fit"],
        ["Deep lines and wrinkles", "Minimal effect", "Moderate improvement", "Strong fit"],
        ["Active eczema or rosacea", "Not indicated", "Not indicated", "Not indicated"],
        ["Open wounds or active infection", "Not indicated", "Not indicated", "Not indicated"],
      ],
    },
    {
      type: "paragraph",
      text: "Peels cannot remove raised (hypertrophic) scars, treat active nodular acne, or permanently remove deep-set wrinkles. For concerns like these, a combination approach - or a different treatment pathway - tends to deliver better outcomes.[^2]",
    },
    {
      type: "heading",
      level: 2,
      text: "Which peel is right for you",
    },
    {
      type: "paragraph",
      text: "Skin tone, skin type, and underlying health history all shape which peel depth is appropriate for you. A board-certified dermatologist or licensed aesthetic practitioner will assess these factors at consultation. Here are the headline considerations to understand going in.",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Skin tone (Fitzpatrick scale):** Lighter tones (Fitzpatrick I-III) generally tolerate medium and deep peels with lower risk. Darker tones (IV-VI) carry a significantly higher risk of PIH from deeper peels - see the dedicated section below.",
        "**Active skincare:** Retinol, tretinoin, and other actives can sensitise the skin and affect how it responds to acid. Your practitioner will typically ask you to pause these 5-7 days before treatment.",
        "**Isotretinoin (Accutane) history:** Most guidelines recommend waiting 6-12 months after finishing a course before any medium or deep peel, due to impaired wound healing.[^3]",
        "**Pregnancy and breastfeeding:** Many peel acids are not recommended during pregnancy. Discuss this with your practitioner.",
        "**History of cold sores (HSV-1):** Medium and deep peels can trigger a herpes simplex outbreak. Prophylactic antiviral medication is standard practice before deeper peels.",
        "**Fitzpatrick IV-VI, melasma, or a history of PIH:** These warrant a conservative, step-up approach starting at the superficial tier.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Chemical peels and darker skin tones",
    },
    {
      type: "paragraph",
      text: "This deserves its own section, because it is where the most important decisions get made - and where careful matching of depth to skin tone matters most. Skin on Fitzpatrick scale IV-VI has more active melanocytes (the cells that produce pigment). Any trauma to the skin, including a peel that goes too deep or is not followed by adequate sun protection, can trigger PIH - dark patches that can take months to fade and may, in some cases, be persistent.[^1]",
    },
    {
      type: "paragraph",
      text: "This does not mean peels are off-limits for darker skin tones. It means the selection criteria are more specific. If [pigmentation](/concerns/pigmentation) is your primary concern, the depth and acid choice matter even more than they do for texture alone.",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Superficial peels are generally the safest starting point** for Fitzpatrick IV-VI - particularly mandelic acid (a larger-molecule AHA that penetrates more slowly) and salicylic acid (which has a strong safety record across skin tones).[^2]",
        "**Lactic acid** is another lower-irritation option often used as an entry-level peel for hyperpigmentation concerns on darker skin.",
        "**Medium peels on darker skin tones require significant practitioner experience** with this skin type. Jessner's solution followed by low-percentage TCA, used carefully, has evidence for improving pigmentation on Fitzpatrick IV-VI - but the margin for error is narrower.",
        "**Deep phenol peels are generally contraindicated for darker skin tones** due to the high risk of permanent depigmentation (skin lightening) and PIH.",
        "**Pre-treatment priming** - typically 4-6 weeks of a topical regimen including agents like hydroquinone, kojic acid, or azelaic acid - is standard practice before any peel on darker skin, to suppress melanocyte reactivity.[^2]",
        "**Strict sun protection after treatment is non-negotiable.** In Dubai's climate, where UV index regularly exceeds 10-11, even incidental sun exposure in the post-peel window can trigger PIH regardless of skin tone.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Ask about skin tone experience specifically",
      text: "When you consult a practitioner, ask directly: how many clients with your Fitzpatrick type have they treated with this specific peel? What pre-treatment protocol do they use? What is their protocol if PIH occurs? A practitioner experienced with diverse skin tones will answer these comfortably.",
    },
    {
      type: "heading",
      level: 2,
      text: "What to expect: consultation to recovery",
    },
    {
      type: "heading",
      level: 3,
      text: "At consultation",
    },
    {
      type: "paragraph",
      text: "A thorough consultation reviews your skin concerns, current skincare routine, medical history, and any active skin conditions. The practitioner should assess your skin tone and discuss realistic outcomes for your specific concern - not a generic 'before and after'. This is the moment to ask all the questions in the checklist below.",
    },
    {
      type: "heading",
      level: 3,
      text: "During the treatment",
    },
    {
      type: "paragraph",
      text: "The skin is cleansed and degreased. The acid is applied evenly, often in layers for medium peels. You will feel tingling, stinging, or warmth - the sensation varies by acid type and depth. Superficial peels often have a fan or neutralising rinse to stop the reaction. Medium peels may be timed and then neutralised. The whole session typically takes 30-60 minutes.",
    },
    {
      type: "heading",
      level: 3,
      text: "Aftercare",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Keep skin moisturised and do not pick.** If you pull off peeling skin before it is ready, you risk scarring and PIH.",
        "**Avoid active ingredients** (retinol, vitamin C serums, AHAs/BHAs) until your practitioner clears you - typically 1-2 weeks post-peel.",
        "**SPF 50+ every morning without exception,** applied generously and reapplied if you are outdoors. This is the single most important step in protecting your results.",
        "**Avoid heat, saunas, and heavy exercise** for the first 48-72 hours after medium or deep peels - heat increases inflammation and PIH risk.",
        "**No active makeup** on peeling skin - it can trap bacteria and irritate the healing barrier.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "When you will see results - and how long they last",
    },
    {
      type: "paragraph",
      text: "For superficial peels, skin looks brighter and feels smoother within a few days once the mild flaking settles - but a series of 4-6 sessions spaced 2-4 weeks apart typically delivers the most noticeable improvement in texture and tone.[^1] Medium peels produce visible change after a single session, with results continuing to improve over 4-8 weeks as collagen remodels. Deep peels have the most dramatic one-time impact, with skin continuing to improve for up to six months.",
    },
    {
      type: "paragraph",
      text: "No peel result is permanent. Sun exposure, natural skin ageing, and hormonal changes (especially relevant for melasma) can return the concern over time. Maintenance - whether ongoing SPF discipline, a home retinoid routine, or periodic superficial peels - is part of the long-term picture.",
    },
    {
      type: "heading",
      level: 2,
      text: "What chemical peels cost in the UAE",
    },
    {
      type: "table",
      headers: ["Peel tier", "Typical AED range per session", "What drives the higher end"],
      rows: [
        ["Superficial (glycolic, salicylic, lactic)", "AED 250 - 700", "Higher-concentration formulations, specialist clinics, premium areas of Dubai"],
        ["Medium (TCA, Jessner's combination)", "AED 800 - 2,500", "Practitioner seniority, depth of treatment, pre-treatment priming included"],
        ["Deep (phenol)", "AED 3,000 - 8,000+", "Often performed under sedation, significant aftercare support, specialist setting"],
      ],
    },
    {
      type: "paragraph",
      text: "Superficial peels are sometimes packaged in series (e.g., 4-6 sessions) at a discount versus individual session pricing - worth asking about if your concern requires a course of treatment rather than a one-off.",
    },
    {
      type: "callout",
      variant: "context",
      title: "Price as a signal - but not the only one",
      text: "Medium and deep peels involve significant practitioner skill; a notably low price is worth exploring with your practitioner to understand what is included. Price alone is not a reliable indicator of expertise, in either direction - ask the questions below regardless.",
    },
    {
      type: "heading",
      level: 2,
      text: "Questions to ask at your consultation",
    },
    {
      type: "checklist",
      title: "Peel consultation checklist",
      items: [
        "Which acid and which concentration are you recommending for my concern, and why?",
        "What depth will this peel reach, and how did you decide that was appropriate for my skin tone?",
        "How many clients with my Fitzpatrick skin type have you treated with this peel?",
        "What pre-treatment priming protocol do you recommend for my skin tone, and for how long?",
        "What does my aftercare routine look like, day by day?",
        "What is your protocol if I develop PIH or an unexpected reaction?",
        "How many sessions will I likely need to see the result I want?",
        "What are the contraindications that would change your recommendation?",
        "Is the price quoted per session, or does it include a series and aftercare products?",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "How to evaluate what you read about peels",
    },
    {
      type: "paragraph",
      text: "A few patterns are worth knowing when you are comparing options:",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**'No downtime peel' is a description of depth, not a guarantee.** Superficial peels genuinely do have minimal downtime. If you see a medium-depth TCA marketed as 'no downtime', ask the practitioner to clarify exactly what percentage and contact time they use - the label and the clinical reality should match.",
        "**Before-and-after photos should show your skin tone.** Results on Fitzpatrick I-II skin do not tell you how the same peel performs on Fitzpatrick V. Ask to see comparable cases.",
        "**'Medical-grade' on a peel label means higher concentration, not better outcomes.** A higher-concentration acid applied without the right skill and assessment produces worse results than a lower-concentration one applied precisely.",
        "**Series pricing commitments should come with a clear policy on what happens if you react.** Ask before you pay upfront for a course.",
      ],
    },
  ],
  faqs: [
    {
      question: "Can I get a chemical peel if I have dark skin?",
      answer: "Yes - but the depth tier and acid choice matter significantly. Fitzpatrick IV-VI skin has a higher risk of post-inflammatory hyperpigmentation (PIH) from deeper peels. Superficial peels using mandelic acid, salicylic acid, or lactic acid are generally the safest starting point. A pre-treatment priming regimen and strict post-peel sun protection are both important. Look for a practitioner with documented experience treating your skin tone specifically.",
    },
    {
      question: "How is a chemical peel different from microneedling?",
      answer: "Peels use acid to remove damaged skin layers and drive cell turnover. Microneedling uses fine needles to create micro-injuries that stimulate collagen without removing the surface layer. Peels tend to perform better for pigmentation and superficial texture; microneedling tends to perform better for atrophic acne scars and skin laxity. They are also sometimes combined in a treatment plan, but not at the same session.",
    },
    {
      question: "How often can I have a chemical peel?",
      answer: "Superficial peels can typically be repeated every 2-4 weeks as part of a series. Medium peels are usually spaced 6-12 months apart. Deep peels are generally a one-time procedure. Your practitioner will set the schedule based on how your skin responds, not a fixed calendar.",
    },
    {
      question: "Will a chemical peel help with melasma?",
      answer: "Peels can improve melasma, but with caution. Melasma is driven partly by hormonal factors and is highly sun-sensitive, which means a peel that goes too deep - or is not followed by rigorous sun protection - can temporarily worsen pigmentation. Superficial peels, used alongside a topical regimen and SPF discipline, are the more conservative and evidence-supported approach. Results vary and melasma can return, especially with sun exposure.",
    },
    {
      question: "Is there downtime after a glycolic or salicylic peel?",
      answer: "Usually very little. Superficial peels may cause mild redness for a few hours and light flaking over 2-5 days. Most people return to normal activities immediately or the next day. The skin may look slightly dull before the flaking phase - this is the treated layer beginning to shed. Avoid heavy exercise, saunas, and active skincare ingredients for 24-48 hours.",
    },
    {
      question: "Can I wear makeup after a chemical peel?",
      answer: "After a superficial peel, most practitioners clear you for lightweight, non-comedogenic makeup after 24 hours. After medium or deep peels, you should wait until active peeling and crusting has resolved - typically 7-14 days - before applying makeup. Applying product to skin that is still actively shedding can irritate the healing barrier and slow recovery.",
    },
  ],
  sources: [
    {
      title: "Chemical peels",
      publisher: "American Academy of Dermatology",
      url: "https://www.aad.org/",
      type: "guideline",
    },
    {
      title: "Chemical peeling in darker skin phototypes",
      publisher: "Journal of the American Academy of Dermatology",
      type: "study",
    },
    {
      title: "Isotretinoin and wound healing: clinical considerations",
      publisher: "Dermatologic Surgery",
      type: "study",
    },
  ],
  relatedArticleSlugs: ["what-is-pigmentation", "peels-vs-microneedling"],
  published: true,
});
