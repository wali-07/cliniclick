import { defineArticle } from "@/lib/content/types";

export const whatIsHairLoss = defineArticle({
  slug: "what-is-hair-loss",
  parentType: "concern",
  parentSlug: "hair-loss",
  kind: "overview",
  title: "What is hair loss",
  dek: "Thinning and shedding take many forms, and they are not all the same problem - what is actually happening at the follicle, which kinds reverse on their own, and how to think about your options.",
  eyebrow: "Concern overview",
  lastReviewed: "2026-05-16",
  metaTitle: "What is hair loss? Types, causes, and what actually works",
  metaDescription:
    "The difference between shedding and balding, the main types of hair loss, what changes for darker skin and tight styles, and how to weigh your options.",
  keywords: [
    "what is hair loss",
    "hair loss explained",
    "types of hair loss",
    "what causes hair loss",
    "hair thinning",
    "hair loss treatment options",
  ],
  body: [
    {
      type: "paragraph",
      text: "Almost everyone notices more hair in the shower drain or on the pillow at some point. Some of that is normal - shedding around 50 to 100 hairs a day is just the hair cycle working. The worry starts when shedding does not stop, when the parting widens, or when the hairline moves back. The hard part is that several very different problems all look the same in the mirror, and they do not respond to the same things. The same product can regrow a friend's hair and do nothing for yours, because you may not have the same condition at all.[^1]",
    },
    {
      type: "paragraph",
      text: "This article walks through what hair loss actually is, the main types you will run into, which ones reverse on their own and which do not, what changes for darker skin tones and tightly styled hair, and how to think about your options without getting talked into something you do not need.",
    },

    {
      type: "heading",
      level: 2,
      text: "What is actually happening on your scalp",
    },
    {
      type: "paragraph",
      text: "Every hair on your head is on its own clock. Each follicle moves through a repeating cycle, and hair loss is almost always a story about that cycle being disrupted or the follicle itself shrinking.[^3]",
    },
    {
      type: "list",
      style: "number",
      items: [
        "**Growth (anagen).** The follicle actively grows a hair for around three to six years. At any time, most of your hairs are in this phase.",
        "**Transition (catagen).** Over a couple of weeks the follicle stops growing and detaches from its blood supply.",
        "**Rest (telogen).** The hair sits in place for around three months while a new hair starts forming underneath.",
        "**Shedding (exogen).** The old hair falls out and the cycle restarts. Losing these is normal - the question is whether they are being replaced.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Worth knowing",
      text: "There are two broad ways this goes wrong. In shedding-type loss, too many hairs are pushed into the resting phase at once, so you lose a lot but the follicles are healthy and can recover. In pattern-type loss, the follicles themselves shrink over years (miniaturisation), producing finer, shorter hairs until they stop. One is mostly about a trigger; the other is mostly about genetics and hormones. Telling them apart is the whole game.",
    },

    {
      type: "heading",
      level: 2,
      text: "Why it is not just stress, washing, or one bad product",
    },
    {
      type: "paragraph",
      text: "A few myths get in the way of treating hair loss well. Washing your hair does not cause it to fall out - the hairs you see in the shower were already shed and were going to come out anyway. Cutting back on washing only delays the moment you notice them. Stress is real but it is usually a trigger for a temporary type of shedding, not the whole explanation for a receding hairline. And there is no single shampoo, oil, or supplement that reverses genetic hair loss; if there were, it would not be a category with this much marketing noise. For most lasting thinning, genetics and how your follicles respond to hormones are doing the heavy lifting in the background.[^1]",
    },

    {
      type: "heading",
      level: 2,
      text: "The types you will encounter",
    },
    {
      type: "paragraph",
      text: "Different types of hair loss have completely different causes and outlooks. The single most useful split is whether the follicle is still alive (most loss) or has been destroyed and scarred over (a minority, but urgent). Knowing which kind you have is the first step in deciding what, if anything, to do.",
    },
    {
      type: "table",
      headers: ["Type", "What it looks like", "Underlying cause", "Reversibility"],
      rows: [
        [
          "Androgenetic (pattern)",
          "Men: receding hairline, thinning crown. Women: widening parting, diffuse thinning on top",
          "Inherited follicle sensitivity to DHT; follicles miniaturise over years",
          "Slowly progressive; treatment slows or partly reverses, but not a cure",
        ],
        [
          "Telogen effluvium",
          "Diffuse, all-over shedding 2 to 4 months after a trigger",
          "Illness, surgery, childbirth, crash diets, iron deficiency, major stress",
          "Usually reverses once the trigger resolves, often within 6 to 9 months",
        ],
        [
          "Alopecia areata",
          "Sudden well-defined round or oval bald patches",
          "Autoimmune - the immune system attacks healthy follicles",
          "Unpredictable; often regrows, but can relapse or extend",
        ],
        [
          "Traction alopecia",
          "Thinning at the hairline, edges, or wherever hair is pulled",
          "Repeated tension from tight styles, braids, weaves, extensions, tight buns",
          "Reversible early; becomes permanent if tension continues for years",
        ],
        [
          "Scarring (cicatricial)",
          "Smooth shiny patches, sometimes itch, redness, or tenderness",
          "Inflammation destroys the follicle and replaces it with scar tissue",
          "Permanent where follicles are destroyed - early treatment limits spread",
        ],
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Scarring vs non-scarring",
      text: "This is the distinction that matters most. In non-scarring loss (pattern, telogen effluvium, alopecia areata, early traction) the follicle survives, so regrowth is at least possible. In scarring loss the follicle is gone and replaced by scar tissue, so no treatment regrows hair there - the goal becomes stopping further loss. Smooth patches with no visible follicle openings, especially with itch, redness, or tenderness, are a reason to see a clinician sooner rather than later.",
    },

    {
      type: "heading",
      level: 2,
      text: "Who tends to get it, and when",
    },
    {
      type: "paragraph",
      text: "Hair loss is not only an older man's problem, and it is not rare in women. The type tends to track with age and life events.[^2]",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Male pattern loss** can begin any time after puberty. Around half of men show some degree by their fifties, and it usually progresses gradually over years rather than suddenly.",
        "**Female pattern loss** often becomes noticeable after a hormonal shift - after pregnancy, around menopause, or after stopping certain contraception. It usually shows as a widening parting rather than a receding hairline.",
        "**Telogen effluvium** can affect anyone a few months after a major physical or emotional event. Postpartum shedding is the most common version and is expected to settle on its own.",
        "**Alopecia areata** often first appears in childhood or early adulthood, though it can start at any age, and its course is hard to predict.",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "What changes for darker skin tones",
    },
    {
      type: "paragraph",
      text: "Skin types IV-VI on the Fitzpatrick scale, which covers most South Asian, Middle Eastern, and African scalps, do not change the genetics of pattern hair loss, but two things matter more in practice. First, traction alopecia is strongly linked to styles common in this audience - tight braids, weaves, extensions, very tight buns, and prolonged tension at the hairline. Caught early, the hair recovers; left for years, the follicles scar and the loss becomes permanent.[^2] Second, a group of scarring conditions that destroy follicles is more common in textured and Afro-textured hair, and these need a clinician early because lost ground does not come back.",
    },
    {
      type: "callout",
      variant: "context",
      title: "Why this matters before you change anything",
      text: "If your thinning is at the hairline or edges and you regularly wear tight styles, the single most useful step is often loosening the tension, not buying a product. Reducing pull early can let traction loss recover on its own. If patches are smooth and shiny with no visible follicle openings, that points toward scarring loss, where the priority is seeing a clinician quickly to limit how far it spreads - not waiting to see if it improves.",
    },

    {
      type: "heading",
      level: 2,
      text: "When it is worth seeing a clinician",
    },
    {
      type: "paragraph",
      text: "Some shedding settles on its own, and gradual pattern thinning can be watched for a while if you are comfortable with it. The signs you should not just wait through are:",
    },
    {
      type: "checklist",
      items: [
        "Sudden or patchy hair loss, rather than slow, even thinning",
        "Bald patches that are smooth and shiny, or scalp that itches, burns, is red, or is tender",
        "Shedding that has not settled after about 6 to 9 months",
        "Hair loss with other symptoms - fatigue, weight change, irregular periods, or after starting a new medication",
        "Loss that is affecting your mood, sleep, or confidence enough that it matters to you",
      ],
    },
    {
      type: "paragraph",
      text: "These cases benefit from a DHA-licensed clinician who can examine the scalp, run blood tests where relevant, and tell you which type of loss you actually have before anyone sells you a treatment for it.",
    },

    {
      type: "heading",
      level: 2,
      text: "What evidence-based options actually exist",
    },
    {
      type: "paragraph",
      text: "Options depend entirely on the diagnosis, so this is not a menu to pick from before you know your type. Broadly, the evidence looks like this.[^3]",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "**Topical minoxidil.** The best-evidenced over-the-counter option for pattern hair loss in both men and women. It can slow loss and partly thicken hair, but it works only while you keep using it, and early shedding in the first weeks is common before improvement.",
        "**Finasteride and related medicines.** Prescription tablets that lower DHT, used mainly for male pattern loss. There is good evidence they slow loss and can regrow some hair, but they need a clinician, can have side effects, and stop working once stopped.",
        "**Treating the trigger (telogen effluvium).** No special hair product is needed - the focus is correcting the underlying cause, such as iron deficiency or thyroid problems, after which hair usually recovers over months.",
        "**Corticosteroids and immune-targeting drugs (alopecia areata).** Steroid injections or creams for limited patches; newer oral drugs (JAK inhibitors) for severe disease under specialist care. Response is variable and relapse is possible.",
        "**Hair transplantation.** Moves your own resistant follicles to thinning areas. It redistributes hair rather than creating more, suits stable pattern loss, and is generally not appropriate for active scarring or autoimmune loss.",
        "**PRP and low-level laser.** Sometimes offered as add-ons for pattern loss. The evidence is weaker and less consistent than for minoxidil and finasteride, protocols are not standardised, and results vary - treat strong claims here with caution.",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "What to ask in your consultation",
    },
    {
      type: "paragraph",
      text: "If you are seeing a clinician about hair loss, the questions below help you compare answers and tell a careful assessment from a sales pitch.",
    },
    {
      type: "checklist",
      items: [
        "Which type of hair loss do I have, and how did you determine that?",
        "Is this the scarring or non-scarring kind, and is regrowth realistically possible for me?",
        "Is the goal to regrow hair, slow further loss, or both?",
        "How long before I would expect to see any change, and what happens if I stop?",
        "What side effects are common with this, and which ones should make me call you?",
        "What does this cost over a full course or year, not just one session?",
        "Has this approach been used for my type of loss and on hair like mine, and what was the outcome?",
        "What is the plan if this is not working in 6 to 12 months?",
      ],
    },

    {
      type: "heading",
      level: 2,
      text: "A note on cost",
    },
    {
      type: "paragraph",
      text: "Hair loss treatment in the UAE ranges enormously - from under AED 100 for a bottle of topical minoxidil, to a few hundred dirhams a month for prescription tablets plus follow-up, to several thousand dirhams for a course of PRP, up to tens of thousands of dirhams for a hair transplant depending on the number of grafts. Price does not reliably signal effectiveness. It tracks the type of treatment, whether it is ongoing or one-off, who delivers it, and what is included (consultation, blood tests, follow-up, products). The cheapest evidence-based options are often the medical ones, and the most expensive procedure is not automatically the right one for your diagnosis. When you compare, compare the full course or a year of treatment, not a single session.",
    },

    {
      type: "heading",
      level: 2,
      text: "How to read a marketing claim",
    },
    {
      type: "paragraph",
      text: "Hair loss is one of the noisiest categories in aesthetics. Claims like \"regrows hair permanently,\" \"guaranteed results,\" \"reverses baldness in weeks,\" or \"no side effects\" are flags that something is being oversold. Honest, evidence-based care is upfront about a few uncomfortable truths: most pattern loss is managed, not cured; results take months, not weeks; almost every effective treatment has trade-offs; benefits usually fade if you stop; and nothing regrows a follicle that has scarred over. The clinics, products, and routines worth your time are the ones that diagnose first, explain what you are paying for, and tell you honestly what to expect at each stage.",
    },
  ],
  faqs: [
    {
      question: "How much hair loss is normal?",
      answer:
        "Shedding roughly 50 to 100 hairs a day is normal and just part of the hair cycle. What is not normal is shedding that does not settle, a parting that keeps widening, a hairline that moves back, or sudden patchy loss. If shedding has not eased after about 6 to 9 months, or it is patchy or sudden, it is worth having it assessed rather than waiting.",
    },
    {
      question: "Will my hair grow back?",
      answer:
        "It depends on the type. Telogen effluvium usually recovers once the trigger is resolved, and alopecia areata often regrows although unpredictably. Pattern loss can be slowed and partly improved with treatment but is not curable. Scarring loss is permanent where follicles have been destroyed, which is why an early diagnosis matters so much.",
    },
    {
      question: "Does stress cause hair loss?",
      answer:
        "Significant physical or emotional stress can trigger telogen effluvium - a diffuse shedding that usually shows up two to four months after the event and then recovers over several months. Stress is not the main driver of pattern (genetic) hair loss, so a receding hairline or widening parting that builds gradually over years is unlikely to be a stress problem alone.",
    },
    {
      question: "Do minoxidil and finasteride work, and do I have to use them forever?",
      answer:
        "For pattern hair loss, both have good evidence: minoxidil (topical, over the counter) for men and women, and finasteride (prescription tablet) mainly for men. Both slow loss and can regrow some hair, but the benefit lasts only while you keep using them - stopping generally returns you to where you would have been. Finasteride needs a clinician and can have side effects worth discussing.",
    },
    {
      question: "Is a hair transplant a permanent fix?",
      answer:
        "A transplant moves your own DHT-resistant follicles into thinning areas; it redistributes hair rather than making more. It can give lasting results for stable pattern loss, but surrounding untreated hair can keep thinning, so people often still need medical treatment to maintain the overall look. It is generally not appropriate for active scarring or autoimmune hair loss.",
    },
  ],
  sources: [
    {
      title: "Hair loss",
      publisher: "NHS",
      url: "https://www.nhs.uk/conditions/hair-loss/",
      type: "guideline",
    },
    {
      title: "Hair loss: who gets and causes",
      publisher: "American Academy of Dermatology",
      url: "https://www.aad.org/public/diseases/hair-loss/causes/18-causes",
      type: "guideline",
    },
    {
      title: "Male pattern hair loss (androgenetic alopecia)",
      publisher: "DermNet NZ",
      url: "https://dermnetnz.org/topics/male-pattern-hair-loss",
      type: "explainer",
    },
    {
      title: "Alopecia areata: causes, diagnosis, and treatment",
      publisher: "DermNet NZ",
      url: "https://dermnetnz.org/topics/alopecia-areata",
      type: "explainer",
    },
  ],
  relatedArticleSlugs: [],
  published: true,
});
