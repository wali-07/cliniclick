import { defineArticle } from "@/lib/content/types";

export const whatIsAcne = defineArticle({
  slug: "what-is-acne",
  parentType: "concern",
  parentSlug: "acne",
  kind: "overview",
  title: "What is acne",
  dek: "The skin condition almost everyone deals with at some point - what is actually happening, why it varies so much from person to person, and how to think about your options.",
  eyebrow: "Concern overview",
  lastReviewed: "2026-05-09",
  metaTitle: "What is acne? Causes, types, and what actually works",
  metaDescription:
    "Acne explained from first principles: what is happening on your skin, the types you will encounter, what changes for darker skin tones, and how to evaluate your options.",
  keywords: [
    "what is acne",
    "acne explained",
    "types of acne",
    "what causes acne",
    "acne in dark skin",
    "acne treatment options",
  ],
  body: [
    {
      type: "paragraph",
      text: "Acne is the most common skin condition in the world. Most people meet it as a teenager, but plenty meet it for the first time in their twenties, thirties, or later. It can show up as a single stubborn spot or as inflamed cysts that linger for months. The frustrating part is how personal it is: two people with the same diet, climate, and skincare routine can have completely different skin, and the same treatment can work brilliantly for one and do nothing for the other.[^1]",
    },
    {
      type: "paragraph",
      text: "This article walks through what acne actually is, the types you will run into, what to expect at different ages, what changes for darker skin tones, and how to think about your options without getting overwhelmed.",
    },

    {
      type: "heading",
      level: 2,
      text: "What is actually happening on your skin",
    },
    {
      type: "paragraph",
      text: "Acne starts inside a hair follicle - the tiny tube each hair grows out of. Four things go wrong at once, and the combination is what creates a spot.[^2]",
    },
    {
      type: "list",
      style: "number",
      items: [
        "**Oil production rises.** Sebaceous glands attached to each follicle produce sebum, an oil that normally keeps skin healthy. Hormones (especially androgens) crank that production up.",
        "**Dead skin cells stick together.** They shed too slowly and clump inside the follicle instead of falling away cleanly.",
        "**The follicle clogs.** The mix of extra oil and stuck cells blocks the opening, forming a comedone - a whitehead if closed, a blackhead if open and oxidised.",
        "**Bacteria multiply, and your immune system reacts.** A normal skin bacterium called *Cutibacterium acnes* feeds on the trapped oil. Your immune response to it is what turns a quiet clog into a red, swollen, painful spot.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Worth knowing",
      text: "The bacterium itself is not the villain - it lives on healthy skin too. The problem is the closed environment plus the inflammation your body mounts against it. That is why treatments target oil, shedding, the bacteria, and inflammation in different combinations rather than trying to sterilise your skin.",
    },

    {
      type: "heading",
      level: 2,
      text: "Why it is not just hormones, oil, or hygiene",
    },
    {
      type: "paragraph",
      text: "A few myths get in the way of treating acne well. Cleaning your face harder does not fix it - over-washing strips your barrier and often makes things worse.[^1] Diet is a smaller factor than the internet suggests, although high-glycaemic foods and skim dairy show modest links in some studies.[^3] Hormones matter, but blaming \"hormones\" alone misses the picture - hormonal shifts are a *trigger*, not a complete explanation. Genetics and how your immune system responds to inflammation are doing a lot of the work in the background.",
    },

    {
      type: "heading",
      level: 2,
      text: "The types you will encounter",
    },
    {
      type: "paragraph",
      text: "Different acne types respond to different things. Knowing which kind you have is the first step in deciding what to try.",
    },
    {
      type: "table",
      headers: ["Type", "What it looks like", "What is going on underneath"],
      rows: [
        [
          "Comedonal",
          "Whiteheads and blackheads, no redness",
          "Clogged follicles with no inflammation yet",
        ],
        [
          "Inflammatory",
          "Red papules and pustules ('whitehead' bumps)",
          "Clog plus immune response - bacteria triggering inflammation",
        ],
        [
          "Cystic / nodular",
          "Deep, painful lumps that last weeks",
          "Inflammation deep in the dermis - high scarring risk",
        ],
        [
          "Hormonal (adult)",
          "Jawline and chin, flares with cycle",
          "Androgen-driven oil surges, often in adult women",
        ],
        [
          "Post-inflammatory marks",
          "Dark or red spots after a pimple heals",
          "Pigment or vessel response - often confused with scarring",
        ],
        [
          "Scarring",
          "Pitted, raised, or atrophic texture changes",
          "Permanent dermal damage from severe inflammation",
        ],
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Marks vs scars",
      text: "Most of what people call \"acne scars\" are actually post-inflammatory marks - flat dark or red spots that fade on their own over months. True scars are textural changes you can feel. The two need very different treatments, so identifying which one you have matters before spending on procedures.",
    },

    {
      type: "heading",
      level: 2,
      text: "Who tends to get it, and when",
    },
    {
      type: "paragraph",
      text: "Acne is not just a teenage problem. Adult-onset and persistent acne are increasingly common, particularly in women.[^3]",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Teen acne** typically starts around puberty and often eases by the early twenties. Forehead, nose, and chin are usual sites.",
        "**Adult acne** in women often clusters on the lower face - jawline, chin, neck - and tracks the menstrual cycle.",
        "**Late-onset adult acne** can appear for the first time in your thirties or forties. Stress, hormonal shifts, and changes in skincare or medication are common triggers.",
        "**Adult male acne** tends to concentrate on the trunk - back, chest, shoulders - and can be persistent.",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "What changes for darker skin tones",
    },
    {
      type: "paragraph",
      text: "Skin types IV-VI on the Fitzpatrick scale (which covers most South Asian, Middle Eastern, and African skin) behave differently when acne flares. The risk of post-inflammatory hyperpigmentation - the dark marks left behind after a spot heals - is much higher, and those marks can take months or longer to fade.[^2] That changes the calculus: aggressive treatments that work on lighter skin can sometimes leave darker marks that outlast the original acne.",
    },
    {
      type: "callout",
      variant: "context",
      title: "Why this matters when picking a treatment",
      text: "If you have darker skin, the right question is not just \"will this clear my acne\" but \"will this clear my acne without leaving marks that take six months to fade.\" Treatment selection, laser settings, peel strengths, and the experience of the practitioner with your skin tone all matter more than they would on lighter skin.",
    },

    {
      type: "heading",
      level: 2,
      text: "When it is worth seeing a clinician",
    },
    {
      type: "paragraph",
      text: "Mild acne can often be managed with consistent over-the-counter routines and patience. The signs you should not wait through are:",
    },
    {
      type: "checklist",
      items: [
        "Painful, deep cysts or nodules - these scar without prescription treatment",
        "Acne that has not improved after 8-12 weeks of a consistent routine",
        "Acne leaving scars or persistent dark marks",
        "Acne affecting your sleep, mood, or willingness to leave the house",
        "Sudden severe acne in adulthood, especially with other hormonal symptoms",
      ],
    },
    {
      type: "paragraph",
      text: "These cases benefit from a DHA-licensed clinician who can prescribe topical or oral treatments that work on the underlying drivers, not just the surface.",
    },

    {
      type: "heading",
      level: 2,
      text: "What evidence-based options actually exist",
    },
    {
      type: "paragraph",
      text: "Treatment options fall into three broad categories. The right combination depends on your acne type, severity, skin tone, and how your skin has reacted to past treatments.[^4]",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Over-the-counter topicals.** Salicylic acid, benzoyl peroxide, adapalene (now OTC in many countries), and azelaic acid. Cheap, widely available, and effective for mild comedonal and inflammatory acne if used consistently.",
        "**Prescription topicals and oral medication.** Stronger retinoids, topical antibiotics, hormonal options for women, oral antibiotics for short courses, and isotretinoin for severe cases. These need a licensed clinician.",
        "**In-clinic procedures.** Chemical peels, microneedling, light and laser-based treatments, and extractions. These complement medical treatment rather than replace it - particularly useful for marks, scars, and texture.",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "What to ask in your consultation",
    },
    {
      type: "paragraph",
      text: "If you are seeing a clinician about acne, the questions below will help you compare answers and feel confident about your treatment plan.",
    },
    {
      type: "checklist",
      items: [
        "Which type of acne do I have, and what is driving it?",
        "What is the goal of this treatment - clearing active spots, preventing new ones, or treating marks and scars?",
        "How long should I expect to wait before seeing a difference?",
        "What side effects are common with this approach, and which ones should make me call you?",
        "What does this cost over a full course, not just one session?",
        "Has this treatment been used on skin like mine, and what was the outcome?",
        "What is the plan if this is not working in 8-12 weeks?",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "A note on cost",
    },
    {
      type: "paragraph",
      text: "Acne treatment in the UAE ranges enormously - from under AED 100 for a tube of OTC retinoid to several thousand dirhams for a course of laser sessions or a guided isotretinoin programme. The variation is rarely about quality alone. It tracks with the type of treatment, whether it is a single session or a course, who is delivering it, and what is included (consultations, follow-ups, products). When you compare prices, compare full courses, not single sessions.",
    },

    {
      type: "heading",
      level: 2,
      text: "How to read a marketing claim",
    },
    {
      type: "paragraph",
      text: "Acne is a high-noise category. Claims like \"clears acne in one session,\" \"permanent results,\" or \"no side effects\" are flags that something is being oversold. Real evidence-based treatment is honest about timelines (weeks to months), about side effects (almost every effective option has them), and about the reality that maintenance is usually part of the picture. The clinics, products, and routines worth your time are the ones that explain what you are paying for and what you should expect at each stage.",
    },
  ],
  faqs: [
    {
      question: "Can I get rid of acne permanently?",
      answer:
        "For most people, acne is something you manage rather than cure. Many find their acne ease with age or with the right treatment plan, but maintenance is usually part of staying clear. Isotretinoin can produce long remissions in severe cases, but it is a serious medication that requires a licensed clinician.",
    },
    {
      question: "Does diet cause acne?",
      answer:
        "Diet plays a smaller role than the internet suggests. The clearest evidence points to high-glycaemic foods (sugar, refined carbs) and skim dairy as modest triggers in some people. Eliminating these is worth trying if you suspect a connection, but it is not a substitute for treating the acne itself.",
    },
    {
      question: "How long does acne treatment take to work?",
      answer:
        "Most acne treatments need 8-12 weeks to show meaningful improvement, and some take longer. Expect skin to sometimes look worse before it looks better - retinoids in particular often cause an initial flare. If you have seen no improvement after 12 weeks of consistent use, it is reasonable to revisit your plan.",
    },
    {
      question: "Should I pop my pimples?",
      answer:
        "No. Squeezing pimples pushes inflammation deeper, increases scarring risk, and can spread bacteria. If you have a deep, painful cyst, a clinician can drain or inject it safely - that is a different and much lower-risk procedure than self-extraction.",
    },
    {
      question: "What is the difference between acne and rosacea?",
      answer:
        "Both can produce red bumps, but rosacea typically also causes flushing, visible blood vessels, and a burning or stinging sensation, usually centred on the cheeks and nose. Treatments differ - retinoids and benzoyl peroxide that work for acne can make rosacea worse. If your treatments are not working or your skin reacts badly to them, ask a clinician to rule out rosacea.",
    },
  ],
  sources: [
    {
      title: "Acne",
      publisher: "NHS",
      url: "https://www.nhs.uk/conditions/acne/",
      type: "guideline",
    },
    {
      title: "Acne: Overview",
      publisher: "American Academy of Dermatology",
      url: "https://www.aad.org/public/diseases/acne/really-acne/overview",
      type: "guideline",
    },
    {
      title: "Adult acne",
      publisher: "American Academy of Dermatology",
      url: "https://www.aad.org/public/diseases/acne/really-acne/adult-acne",
      type: "guideline",
    },
    {
      title:
        "Topical and systemic pharmacological treatments for acne: a Cochrane overview of systematic reviews",
      publisher: "Cochrane Database of Systematic Reviews",
      url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD011154.pub2/full",
      type: "review",
    },
  ],
  relatedArticleSlugs: [],
  published: true,
});
