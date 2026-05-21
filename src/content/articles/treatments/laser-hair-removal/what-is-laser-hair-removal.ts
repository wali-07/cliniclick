import { defineArticle } from "@/lib/content/types";

export const whatIsLaserHairRemoval = defineArticle({
  heroImage: {
    "src": "/article-images/what-is-laser-hair-removal.webp",
    "alt": "A whole fuzzy brown kiwi fruit with a small bright pink plastic razor resting flat on its surface, against a solid soft purple background.",
    "width": 1344,
    "height": 768,
    "prompt": "Premium editorial still-life photograph, real photography, soft natural studio light, crisp focus. A single whole, intact, uncut fuzzy brown kiwi fruit sitting centred in the frame, modest in size (roughly one-third of the frame), surrounded by generous empty space. Resting gently flat on the kiwi's surface — not stuck into it, not pierced, not inserted — is one small, clearly recognisable plastic razor with a bright candy-pink or electric-yellow handle and a slim razor head, toy-like and friendly in colour, lying naturally on top. The kiwi is fresh, complete, undamaged, with its characteristic fuzzy brown skin fully intact. The entire background is a single flat solid soft lavender-to-brand-purple colour (approximately #C4A0FF), seamless with no gradient, no vignette, no second colour, no surface line, no horizon. A soft natural drop shadow beneath the kiwi is expected and fine. The mood is whimsical, playful, and magazine-fresh — like a premium beauty editorial prop shot. NOT an illustration, NOT a 3D or CGI render, NOT a diagram. No people, no hands, no body parts, no text, no numbers, no logos, no brand packaging, no medical devices, no clinical objects, no second fruit, no additional props.",
    "generatedBy": "recraft:recraftv4"
  }, // @generated-hero
  slug: "what-is-laser-hair-removal",
  parentType: "treatment",
  parentSlug: "laser-hair-removal",
  kind: "overview",
  title: "What is laser hair removal",
  dek: "How lasers target hair follicles, which laser suits your skin tone, and what to realistically expect from sessions",
  eyebrow: "Treatment overview",
  lastReviewed: "2026-05-10",
  metaTitle: "What is laser hair removal? A guide for Dubai",
  metaDescription: "Learn how laser hair removal works, which laser types suit different skin tones including Fitzpatrick IV-VI, and what to expect from sessions in Dubai.",
  keywords: [
    "what is laser hair removal",
    "how laser hair removal works",
    "laser hair removal side effects",
    "laser hair removal dark skin",
    "laser hair removal sessions",
    "laser hair removal Fitzpatrick",
    "laser hair removal Dubai",
  ],
  body: [
    {
      type: "paragraph",
      text: "Laser hair removal is a medical procedure that uses targeted light energy to damage hair follicles and significantly reduce hair growth long-term. If you have spent years shaving, waxing, or threading, that probably sounds too good to be true - but it is genuinely effective when the right laser is matched to the right skin tone. This article walks you through exactly how it works as part of a full [laser hair removal](/treatments/laser-hair-removal) course, what the different laser types mean for you, and the questions worth asking before you book.",
    },
    {
      type: "heading",
      level: 2,
      text: "How laser hair removal works",
    },
    {
      type: "paragraph",
      text: "The mechanism behind laser hair removal is called **selective photothermolysis**. In plain terms: the laser emits a specific wavelength of light that is absorbed by the pigment (melanin) inside the hair follicle. That absorbed energy converts to heat, which damages the follicle enough to significantly slow or stop future hair growth.[^1]",
    },
    {
      type: "list",
      style: "number",
      items: [
        "A laser emits a focused beam of light at a wavelength chosen to target melanin.",
        "The melanin in the hair shaft absorbs the light and converts it to heat.",
        "The heat travels down the shaft to the follicle, damaging the cells responsible for regrowth.",
        "Surrounding skin tissue is largely spared because the wavelength and pulse duration are tuned to the follicle, not the skin surface.",
        "Follicles in the active growth phase (anagen) are most vulnerable - which is why multiple sessions are needed to catch all follicles as they cycle through that phase.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Reduction, not removal",
      text: "Laser hair removal is clinically described as long-term hair reduction, not permanent removal. Most people see 70-90% reduction after a full course of sessions, with some hairs potentially returning finer over time.[^1] The AAD notes that touch-up sessions every 6-12 months may be needed to maintain results.[^2]",
    },
    {
      type: "heading",
      level: 2,
      text: "Laser types and skin tones",
    },
    {
      type: "paragraph",
      text: "Not all lasers are the same, and this distinction matters enormously - especially in the UAE where a wide range of skin tones is the norm, not the exception. The key variable is wavelength: longer wavelengths penetrate deeper and are absorbed less by surface melanin, making them safer for darker skin.[^2]",
    },
    {
      type: "table",
      headers: ["Laser type", "Wavelength", "Best suited for", "Notes on darker skin"],
      rows: [
        ["Alexandrite", "755 nm", "Fitzpatrick I-III (fair to medium)", "Higher melanin absorption - risk of burns on darker skin"],
        ["Diode", "800-810 nm", "Fitzpatrick I-IV (fair to medium-dark)", "Some diode systems (e.g. Soprano Ice) use lower fluence and longer pulses to extend suitability"],
        ["Nd:YAG", "1064 nm", "Fitzpatrick I-VI (all skin tones)", "Longest wavelength, least melanin absorption - the gold standard for skin tones IV-VI"],
        ["IPL (Intense Pulsed Light)", "Broad spectrum", "Fitzpatrick I-III only", "Not a true laser; generally not appropriate for darker skin tones"],
      ],
    },
    {
      type: "paragraph",
      text: "IPL is often marketed alongside laser treatments but works differently - it emits multiple wavelengths rather than a single coherent beam. For lighter skin tones it can reduce hair, but it carries a higher risk of burns, hyperpigmentation, and inconsistent results on skin tones IV and above.[^2]",
    },
    {
      type: "heading",
      level: 2,
      text: "Laser hair removal on darker skin tones (Fitzpatrick IV-VI)",
    },
    {
      type: "paragraph",
      text: "This is one of the most searched questions about laser hair removal in the UAE - and for good reason. The same melanin that the laser targets in the hair follicle is also present in the skin itself. On deeper skin tones, a poorly chosen laser or an undertrained practitioner can cause burns, blistering, or lasting hyperpigmentation (dark patches).[^2]",
    },
    {
      type: "paragraph",
      text: "The good news: when the right technology and protocols are used, laser hair removal is safe and effective on dark skin. Here is what to look for.",
    },
    {
      type: "checklist",
      title: "What safe treatment on darker skin looks like",
      items: [
        "Nd:YAG 1064 nm laser is the evidence-backed choice for Fitzpatrick IV-VI - ask which machine and wavelength will be used before you book",
        "Lower fluence (energy per area) combined with longer pulse durations protects the skin surface while still reaching the follicle",
        "A patch test 24-48 hours before your first full session is standard practice for darker skin tones - it should not be optional",
        "Cooling systems (contact cooling, cold air, or cold gel) are used throughout treatment to protect the skin surface",
        "The practitioner should have documented experience treating Fitzpatrick IV-VI skin, not just general laser experience",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Ask specifically about your skin tone",
      text: "When you call or message a clinic, ask: 'What laser do you use for Fitzpatrick V skin?' If the answer is vague or they lead with the brand name without specifying wavelength, that is a cue to ask further questions. The wavelength is what determines safety - not the brand name alone.",
    },
    {
      type: "heading",
      level: 2,
      text: "Who is a good candidate",
    },
    {
      type: "paragraph",
      text: "Laser hair removal works best when there is sufficient contrast between hair colour and skin tone - meaning dark hair responds better than light, grey, or red hair, regardless of skin tone. Fine, vellus (peach fuzz) hair also responds poorly because it contains very little melanin.[^1]",
    },
    {
      type: "table",
      headers: ["Likely to respond well", "Less likely to respond well"],
      rows: [
        ["Dark (black or brown) coarse hair", "Blonde, red, grey, or white hair"],
        ["Stable skin tone without active tan", "Actively tanned skin (raises burn risk)"],
        ["Fitzpatrick I-VI with appropriate laser choice", "Hormonal conditions causing ongoing hair growth (PCOS) - treatment still works but more maintenance sessions may be needed"],
        ["Adult skin (18+, most clinics require)", "Skin with active infection, open wounds, or inflammation in the treatment area"],
      ],
    },
    {
      type: "paragraph",
      text: "Certain medications can increase photosensitivity and make laser treatment unsafe. These include some antibiotics (particularly tetracyclines), isotretinoin (Accutane), and topical retinoids. Always disclose your full medication list at your consultation.[^2]",
    },
    {
      type: "heading",
      level: 2,
      text: "What to expect from your sessions",
    },
    {
      type: "heading",
      level: 3,
      text: "Before your first session",
    },
    {
      type: "paragraph",
      text: "A thorough consultation should cover your skin tone and hair type, medical history, and current medications. Expect a practitioner to assess your Fitzpatrick type and recommend a specific laser accordingly. You will typically be asked to shave the area 24 hours before your session (so the laser targets the follicle, not the hair above the skin) and to avoid sun exposure, tanning products, and waxing or plucking for at least two weeks beforehand.",
    },
    {
      type: "heading",
      level: 3,
      text: "During the session",
    },
    {
      type: "paragraph",
      text: "Sessions range from a few minutes (upper lip) to around 45 minutes (full legs or back). Most people describe the sensation as a rubber band snap or a brief sting, usually paired with a cooling system that reduces discomfort. Protective eyewear is worn throughout. You will likely smell a faint singed-hair odour - this is normal.",
    },
    {
      type: "heading",
      level: 3,
      text: "After your session",
    },
    {
      type: "paragraph",
      text: "Some redness and mild swelling around the follicles is normal for 24-48 hours after treatment. Applying a gentle moisturiser and avoiding heat (saunas, hot showers, direct sun) for 48 hours helps the skin recover. Hairs in the treated area will shed over the following 1-3 weeks - this is not regrowth, it is the treated hairs pushing out.",
    },
    {
      type: "heading",
      level: 2,
      text: "How many sessions will you need",
    },
    {
      type: "paragraph",
      text: "Because lasers only damage follicles in the active growth phase, and not all follicles are active at the same time, multiple sessions are needed. Most people need **6-8 sessions** spaced 4-8 weeks apart to see significant reduction.[^2] Body areas (legs, back, underarms) and hormonal areas (face, bikini line) differ in how they respond - hormonal areas may require more sessions and ongoing maintenance.",
    },
    {
      type: "callout",
      variant: "context",
      title: "Dubai's climate and sun exposure",
      text: "High UV exposure between sessions raises the risk of post-inflammatory hyperpigmentation, especially on Fitzpatrick IV-VI skin. Daily SPF 30 or higher on treated areas is not optional during a course of treatment - it directly affects your results and your safety.",
    },
    {
      type: "heading",
      level: 2,
      text: "Side effects and contraindications",
    },
    {
      type: "paragraph",
      text: "Most side effects are mild and temporary. More serious effects are uncommon but not impossible - they are most often linked to mismatched laser choice for skin tone or insufficient practitioner training.[^2]",
    },
    {
      type: "table",
      headers: ["Side effect", "How common", "Typically resolves"],
      rows: [
        ["Redness and swelling at follicles", "Very common", "24-48 hours"],
        ["Mild skin irritation", "Common", "1-3 days"],
        ["Temporary pigment changes (lightening or darkening)", "Uncommon - higher risk on IV-VI with wrong laser", "Weeks to months"],
        ["Burns or blistering", "Rare with appropriate equipment and training", "Variable - seek follow-up if this occurs"],
        ["Scarring", "Very rare", "Seek medical review immediately"],
      ],
    },
    {
      type: "paragraph",
      text: "Contraindications - reasons to delay or avoid treatment - include active skin infections or cold sores in the treatment area, pregnancy, use of photosensitising medications, and very recent sun exposure or active tan. These are questions your practitioner should raise in your consultation, not ones you have to volunteer unprompted.",
    },
    {
      type: "heading",
      level: 2,
      text: "What it costs in the UAE",
    },
    {
      type: "paragraph",
      text: "Prices in Dubai vary considerably depending on the body area, the laser technology used, whether you are buying a single session or a package, and the type of clinic. Indicative ranges per session:",
    },
    {
      type: "table",
      headers: ["Area", "Approximate AED range per session"],
      rows: [
        ["Upper lip or chin", "AED 100 - 350"],
        ["Underarms", "AED 150 - 500"],
        ["Bikini line (standard)", "AED 200 - 600"],
        ["Full legs", "AED 600 - 2,000"],
        ["Full back", "AED 700 - 2,200"],
        ["Full body", "AED 1,800 - 5,000+"],
      ],
    },
    {
      type: "paragraph",
      text: "Package deals typically reduce per-session cost by 20-40%. The two biggest price drivers are the technology used (Nd:YAG sessions for darker skin tones are sometimes priced higher than alexandrite because of the equipment cost) and the clinic setting - a medical dermatology clinic will generally price differently to a beauty chain. For a full breakdown - course and package costs, what drives the price differences, and how to compare quotes - see our [cost of laser hair removal in Dubai](/treatments/laser-hair-removal/cost-in-dubai) guide.",
    },
    {
      type: "callout",
      variant: "note",
      title: "What a lower price might mean",
      text: "A very low price is not automatically a red flag, but it is worth asking what it includes. Key questions: which laser machine, what training does the operator have, is a consultation included, and what is the policy if you experience a side effect? Transparency on these points matters more than the headline price.",
    },
    {
      type: "heading",
      level: 2,
      text: "Questions to ask before you book",
    },
    {
      type: "checklist",
      title: "Questions for your consultation",
      items: [
        "What laser machine will be used, and what is the wavelength?",
        "Is Nd:YAG 1064 nm available if I have a deeper skin tone (Fitzpatrick IV or above)?",
        "Will a patch test be done before my first full session?",
        "What qualifications does the person performing the treatment hold? Are they DHA-licensed?",
        "What cooling system is used during treatment?",
        "What is your protocol if I experience a burn or adverse reaction?",
        "What should I avoid before and after each session?",
        "How many sessions are you estimating for my area and hair type, and why?",
        "What does the package include - consultations, follow-ups, touch-ups?",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "How to read marketing claims",
    },
    {
      type: "paragraph",
      text: "A few claims come up repeatedly in laser hair removal marketing, and it helps to know what they actually mean before you book.",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**'Permanent hair removal'** - The clinical evidence supports long-term reduction, not permanent removal for everyone. Expect significant reduction with possible fine regrowth over time, particularly in hormonally active areas.[^2]",
        "**'Pain-free laser'** - This usually refers to specific low-fluence diode systems (such as Soprano-type machines) that use a gradual heating approach rather than high-energy pulses. They are generally more comfortable, but comfort depends on the area and your sensitivity - 'pain-free' is a marketing shorthand, not an absolute guarantee.",
        "**'Suitable for all skin tones'** - This should prompt a follow-up question: which machine? If the answer is a diode-only system at standard settings, it may not be the safest option for very dark skin. Nd:YAG remains the most evidence-supported choice for Fitzpatrick V-VI.[^2]",
        "**'Results in 3 sessions'** - Individual responses vary. Three sessions may reduce hair noticeably for some people, but 6-8 sessions is the typical evidence-based range for significant reduction. Be cautious of guarantees tied to a specific number of sessions.",
      ],
    },
  ],
  faqs: [
    {
      question: "Is laser hair removal safe for dark skin in Dubai?",
      answer: "Yes - when the right technology is used. Nd:YAG 1064 nm is the evidence-backed laser for Fitzpatrick IV-VI skin tones because its longer wavelength is less absorbed by surface melanin, reducing the risk of burns or hyperpigmentation. Always confirm which laser and wavelength the clinic uses, and ask for a patch test before your first full session.",
    },
    {
      question: "How many laser hair removal sessions will I need?",
      answer: "Most people need 6-8 sessions spaced 4-8 weeks apart to achieve significant hair reduction. This is because the laser only targets follicles in their active growth phase, and not all follicles are in that phase at the same time. Hormonal areas like the face or bikini line may need more sessions, and annual touch-ups help maintain results long-term.",
    },
    {
      question: "Does laser hair removal hurt?",
      answer: "Most people describe the sensation as a rubber band snap or brief sting with each pulse, combined with cooling from the machine. The level of discomfort varies by area - bony or sensitive areas tend to feel more intense. Some newer diode systems use a gradual heating approach that many find significantly more comfortable, though individual experiences differ.",
    },
    {
      question: "Can I have laser hair removal if I have PCOS or a hormonal condition?",
      answer: "Yes, laser hair removal can still reduce hair effectively if you have PCOS or another hormonal condition driving excess hair growth. However, because the underlying hormonal driver remains active, you may need more sessions and more frequent maintenance treatments than someone without a hormonal condition. Discuss this at your consultation so expectations are calibrated correctly.",
    },
    {
      question: "How long before I see results?",
      answer: "After each session, treated hairs will shed over 1-3 weeks. Noticeable thinning and reduction usually becomes clear after your 2nd or 3rd session. The full result of a treatment course is typically visible around 6-8 weeks after your final session, once all treated follicles have completed their cycle.",
    },
    {
      question: "What should I avoid between sessions?",
      answer: "Avoid sun exposure and tanning products on treated areas, as tanned skin increases the risk of burns and pigment changes. Skip waxing, plucking, or epilating between sessions - these remove the hair root that the laser needs to target. Shaving is fine. Use SPF 30 or higher daily on treated areas, particularly important given Dubai's sun exposure levels.",
    },
  ],
  sources: [
    {
      title: "Laser hair removal",
      publisher: "Mayo Clinic",
      type: "explainer",
    },
    {
      title: "Laser hair removal: FAQs",
      publisher: "AAD (American Academy of Dermatology)",
      type: "guideline",
    },
    {
      title: "Photosensitivity and drug interactions with laser treatment",
      publisher: "Cleveland Clinic",
      type: "explainer",
    },
  ],
  relatedArticleSlugs: [],
  published: true,
});
