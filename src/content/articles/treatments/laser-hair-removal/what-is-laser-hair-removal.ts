import { defineArticle } from "@/lib/content/types";

export const whatIsLaserHairRemoval = defineArticle({
  slug: "what-is-laser-hair-removal",
  parentType: "treatment",
  parentSlug: "laser-hair-removal",
  kind: "overview",
  title: "What is laser hair removal",
  dek: "How lasers target hair at the root, which types suit which skin tones, and what to expect from your first session to your last",
  eyebrow: "Treatment overview",
  lastReviewed: "2026-05-10",
  metaTitle: "What is laser hair removal? How it works, explained",
  metaDescription: "Learn how laser hair removal works, which lasers suit darker skin tones, what sessions feel like, and what results to realistically expect in the UAE.",
  keywords: [
    "what is laser hair removal",
    "how laser hair removal works",
    "laser hair removal explained",
    "laser hair removal for dark skin in Dubai",
    "laser hair removal sessions",
    "is laser hair removal safe for brown skin",
    "laser hair removal UAE",
  ],
  body: [
    {
      type: "paragraph",
      text: "**Laser hair removal is a medical procedure that uses concentrated light to destroy hair follicles, reducing or stopping hair growth long-term.** If you have spent years waxing, threading, or shaving, it probably sits somewhere on your radar - but between the marketing promises and the confusing machine names, it can be hard to know what actually happens, whether it is safe for your skin tone, and how many sessions you genuinely need. This article gives you the full picture. For a broader look at the treatment, visit our [laser hair removal](/treatments/laser-hair-removal) overview.",
    },
    {
      type: "heading",
      level: 2,
      text: "How laser hair removal works",
    },
    {
      type: "paragraph",
      text: "The process relies on a principle called **selective photothermolysis** - using a specific wavelength of light to heat one target (melanin in the hair) while leaving the surrounding tissue largely unaffected.[^1] Here is the mechanism, step by step:",
    },
    {
      type: "list",
      style: "number",
      items: [
        "The laser emits a pulse of light at a wavelength absorbed strongly by melanin, the pigment that gives hair its colour.",
        "Melanin in the hair shaft and follicle absorbs that energy and converts it to heat.",
        "The heat travels down the hair shaft into the follicle bulb and bulge - the cells responsible for regrowth.",
        "Sufficient heat damages those cells, reducing or stopping their ability to produce a new hair.",
        "The surrounding skin absorbs far less energy at the chosen wavelength, so damage to tissue outside the follicle is minimised when the correct settings are used.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Why multiple sessions are required",
      text: "Laser light only affects hairs in the active growth phase (anagen). At any given moment, only a portion of your hair follicles are in anagen - the rest are resting or shedding. Multiple sessions spaced weeks apart are needed to catch each follicle during its active phase.[^1]",
    },
    {
      type: "heading",
      level: 2,
      text: "Laser types and which suit which skin tone",
    },
    {
      type: "paragraph",
      text: "Not all lasers are the same. Wavelength is the key variable: longer wavelengths penetrate deeper into the skin and are absorbed less by surface melanin, making them safer for darker skin. The **Fitzpatrick scale** (I-VI) is the standard tool clinicians use to classify skin tone and match it to an appropriate laser.[^2]",
    },
    {
      type: "table",
      headers: ["Laser type", "Wavelength", "Fitzpatrick range", "Key notes"],
      rows: [
        [
          "Alexandrite",
          "755 nm",
          "I-III (some IV)",
          "Fast, effective on fine hair. High melanin absorption - higher risk on darker tones.",
        ],
        [
          "Diode",
          "800-810 nm",
          "I-IV (some V with adjusted settings)",
          "Versatile mid-range option. Suitable for a broader range than Alexandrite. Common in UAE clinics.",
        ],
        [
          "Nd:YAG",
          "1064 nm",
          "III-VI",
          "Longest wavelength; safest for darker skin tones. Lower melanin absorption means more passes may be needed.",
        ],
        [
          "IPL (Intense Pulsed Light)",
          "515-1200 nm (broad spectrum)",
          "I-III",
          "Not a laser - uses multiple wavelengths. Less precise; generally not recommended for darker tones or fine hair.",
        ],
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "IPL is not laser hair removal",
      text: "Intense Pulsed Light (IPL) devices emit a broad spectrum of light rather than a single precise wavelength. They are less targeted than true lasers and carry a higher risk of pigmentation changes on medium-to-dark skin tones. The two technologies are often conflated in marketing - worth clarifying when you enquire.[^2]",
    },
    {
      type: "heading",
      level: 2,
      text: "Laser hair removal for darker skin tones (Fitzpatrick IV-VI)",
    },
    {
      type: "paragraph",
      text: "This is one of the most searched questions in the UAE - and for good reason. Many people with medium-to-deep skin tones have been told laser hair removal is not for them, or have experienced burns or post-inflammatory hyperpigmentation (PIH) after a bad experience. The honest answer is: it can be done safely, but the laser type, settings, and practitioner experience matter enormously.[^3]",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Nd:YAG (1064 nm) is the gold-standard laser for Fitzpatrick IV-VI.** Its longer wavelength bypasses surface melanin and targets the follicle more selectively, dramatically reducing burn and PIH risk.[^3]",
        "**Diode lasers with appropriate settings** can also be used on Fitzpatrick IV-V skin by experienced practitioners - longer pulse durations and lower fluence (energy) spread heat more safely.",
        "**Alexandrite and IPL carry meaningful risk on darker tones** and should generally be avoided unless a highly experienced clinician has assessed you individually.",
        "**A test patch is non-negotiable.** A responsible practitioner will test a small area at least 24-48 hours before a full session to check your skin's response.",
        "**Tanned skin raises the risk** for all tones. Active sun exposure or recent tanning - including self-tanner - increases surface melanin and should be avoided before sessions.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "What to watch for after treatment on darker skin",
      text: "Some redness and mild swelling immediately after a session is normal. If you notice blistering, persistent dark patches, or lightening of the skin in treated areas, contact your clinic promptly. Post-inflammatory hyperpigmentation (PIH) - temporary darkening - can occur but is usually treatable. Hypopigmentation (lightening) is rarer but more difficult to reverse.",
    },
    {
      type: "heading",
      level: 2,
      text: "Who is a good candidate",
    },
    {
      type: "paragraph",
      text: "Laser hair removal works best when there is good contrast between hair colour and skin tone - the laser targets melanin in the hair, so it needs melanin to be present.[^1] A few factors that affect suitability:",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Hair colour matters.** Dark brown and black hair respond best. Red and dark blonde hair can respond with the right laser. Grey, white, and very light blonde hair have little or no melanin for the laser to target - results are minimal.",
        "**Hormonal conditions** such as polycystic ovary syndrome (PCOS) can cause hair to regrow due to ongoing hormonal stimulation, meaning maintenance sessions are more likely to be needed long-term.",
        "**Pregnancy.** Laser hair removal is generally not recommended during pregnancy due to a lack of safety data.[^1]",
        "**Active skin conditions** in the treatment area (such as eczema flares, active acne, or open wounds) require the area to be cleared before treatment.",
        "**Certain medications** - including isotretinoin (for acne) and some photosensitising drugs - may require a waiting period before treatment is safe. Always disclose your full medication list at consultation.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "What a course of treatment looks like",
    },
    {
      type: "heading",
      level: 3,
      text: "Number of sessions",
    },
    {
      type: "paragraph",
      text: "Most people require **6-8 sessions** to achieve significant, long-lasting hair reduction.[^1] Some areas or hair types may need more. Sessions are typically spaced 4-6 weeks apart for the face (where hair cycles faster) and 6-8 weeks apart for the body.",
    },
    {
      type: "heading",
      level: 3,
      text: "Before your session",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "Shave the area 24 hours before (shaving keeps the follicle intact; waxing or plucking removes the hair shaft the laser needs to conduct heat, and should be avoided for 4-6 weeks before treatment).",
        "Avoid sun exposure and tanning products for at least 2 weeks before each session.",
        "Arrive with clean, product-free skin in the treatment area.",
        "Discuss any new medications, skincare actives (such as retinoids), or skin changes with your practitioner before each session.",
      ],
    },
    {
      type: "heading",
      level: 3,
      text: "During the session",
    },
    {
      type: "paragraph",
      text: "Most modern devices include a built-in cooling system to protect the skin surface and reduce discomfort. Sensation is commonly described as a warm snap or flick against the skin. Treatment time varies from a few minutes (upper lip) to 45-60 minutes (full legs or back). You will be given protective eyewear for the duration.",
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
        "Expect redness and mild swelling for a few hours to a day. A cool compress can help.",
        "Avoid sun exposure, saunas, steam rooms, and intense exercise for 24-48 hours after each session.",
        "Apply SPF 30+ daily to any treated areas exposed to the sun.",
        "Do not wax, tweeze, or use depilatory creams between sessions - shaving is fine.",
        "Hairs will shed (not regrow) over the 1-3 weeks following each session. This is normal.",
      ],
    },
    {
      type: "heading",
      level: 3,
      text: "Maintenance",
    },
    {
      type: "paragraph",
      text: "Laser hair removal produces **permanent hair reduction**, not guaranteed permanent removal.[^1] Most people see an 80-90% reduction after a full course, but some follicles can become active again over time - particularly with hormonal changes. One or two top-up sessions per year are common for long-term maintenance.",
    },
    {
      type: "heading",
      level: 2,
      text: "What it costs in the UAE",
    },
    {
      type: "paragraph",
      text: "Prices vary considerably depending on the body area, laser type, clinic setting, and whether you buy single sessions or a package. Broad ranges you will typically encounter:",
    },
    {
      type: "table",
      headers: ["Area", "Typical range per session (AED)"],
      rows: [
        ["Upper lip", "100 - 350"],
        ["Underarms", "150 - 500"],
        ["Bikini / Brazilian", "300 - 900"],
        ["Half legs", "400 - 1,200"],
        ["Full legs", "700 - 2,000"],
        ["Back or chest (male)", "600 - 2,500"],
        ["Full body", "1,500 - 5,000"],
      ],
    },
    {
      type: "paragraph",
      text: "What drives the range: the laser technology used (Nd:YAG sessions often cost more than older diode setups), practitioner credentials (a DHA-licensed dermatologist or laser technician commands a different rate than an unverified operator), clinic location, and whether you are buying a pre-paid package versus pay-per-session. Packages typically offer a lower per-session cost but commit you upfront - check the cancellation and transfer policy before paying.",
    },
    {
      type: "heading",
      level: 2,
      text: "Questions to ask at your consultation",
    },
    {
      type: "checklist",
      title: "Before committing to a course of treatment, ask:",
      items: [
        "Which laser will be used on me, and what wavelength is it?",
        "Why is that laser appropriate for my skin tone and hair colour?",
        "Will you do a test patch, and how long will you wait before the first full session?",
        "What are the practitioner's qualifications and DHA licensing status?",
        "How many sessions do you recommend for my specific area, and why?",
        "What is the clinic's protocol if I experience a reaction - burns, blistering, or significant pigment change?",
        "What does the package cancellation or pause policy look like if I need to stop mid-course?",
        "Should I avoid any skincare products or medications before each session?",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "How to read the marketing claims",
    },
    {
      type: "paragraph",
      text: "Laser hair removal marketing can be optimistic. A few things worth knowing when you see bold claims:",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        '**"Permanent hair removal" vs "permanent hair reduction"** - the latter is the accurate term. Clinically, the evidence supports long-term, significant reduction, not guaranteed 100% removal for every follicle in every person.[^1]',
        '**"Painless" claims** - cooling technology has improved comfort considerably, but tolerance varies. Expect some sensation, especially in sensitive areas.',
        '**"Suitable for all skin tones" without specifying which laser** - ask which machine and wavelength they plan to use. "Suitable for all" is meaningless without knowing the technology behind it.',
        '**"Only 3 sessions needed"** - this is possible for some people and areas, but most require 6-8. Low session count claims often undersell how many top-ups you will realistically need.',
        '**Package "discounts" with upfront payment** - calculate the per-session cost and compare it to pay-as-you-go options elsewhere before committing.',
      ],
    },
  ],
  faqs: [
    {
      question: "How many sessions does laser hair removal take?",
      answer: "Most people need 6-8 sessions to achieve significant, lasting hair reduction. Sessions are spaced 4-8 weeks apart depending on the area. Some people need fewer; those with hormonal conditions affecting hair growth may need more. After a full course, occasional maintenance sessions (usually once or twice a year) help sustain results.",
    },
    {
      question: "Is laser hair removal safe for dark skin tones?",
      answer: "Yes, with the right laser. Nd:YAG (1064 nm) is the recommended choice for Fitzpatrick IV-VI skin tones because its longer wavelength bypasses surface melanin and targets the follicle more precisely. The key questions to ask are which laser will be used and whether the practitioner has documented experience with darker skin tones. A test patch before the first full session is essential.",
    },
    {
      question: "Does laser hair removal work on blonde, red, or grey hair?",
      answer: "Results are limited for light-coloured hair. The laser targets melanin in the hair shaft, so hair with little pigment - very light blonde, grey, or white - gives the laser less to work with. Dark brown and black hair respond best. Some red and dark blonde hair can respond partially. A realistic consultation with a test patch will tell you what to expect for your specific hair colour.",
    },
    {
      question: "Can I get laser hair removal if I have PCOS or a hormonal condition?",
      answer: "You can, but manage your expectations. Hormonal conditions like PCOS can continuously stimulate new follicles to produce hair, meaning regrowth over time is more likely. Laser hair removal can still reduce hair significantly, but ongoing maintenance sessions are generally needed more frequently than for someone without a hormonal factor driving hair growth.",
    },
    {
      question: "How long after laser hair removal do hairs fall out?",
      answer: "After each session, treated hairs shed gradually over 1-3 weeks. They do not fall out immediately - they are pushed out as the damaged follicle releases them. This is normal and does not mean the treatment is not working. Avoid waxing or tweezing during this period; shaving is fine.",
    },
    {
      question: "Can I shave between laser hair removal sessions?",
      answer: "Yes. Shaving between sessions is not only allowed but encouraged - it removes surface hair without disturbing the follicle the laser needs to target. What you must avoid between sessions is waxing, threading, or plucking, because these remove the hair shaft from the follicle, leaving the laser with less to work with at your next appointment.",
    },
  ],
  sources: [
    {
      title: "Laser hair removal",
      publisher: "American Academy of Dermatology",
      type: "guideline",
    },
    {
      title: "Fitzpatrick skin type",
      publisher: "Mayo Clinic",
      type: "explainer",
    },
    {
      title: "Laser hair removal in patients with skin of color",
      publisher: "Journal of the American Academy of Dermatology",
      type: "study",
    },
  ],
  relatedArticleSlugs: [],
  published: true,
});
