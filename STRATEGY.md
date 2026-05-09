# CliniClick — Strategy

_Version 3.1 · 2026-05-08_
_Owner: Abdullah Wali · Solo founder, AI-first operator_

> Living document. All material changes are versioned at the top.
> Detailed memory underlying each section lives in `~/.claude/projects/.../memory/` and is the single source of truth that all AI agents read from.

---

## 1. What we are building

**CliniClick** is the trusted, English-language one-stop shop for aesthetic medicine in the UAE. We help every UAE consumer understand their concerns, discover the treatments and machines used to deliver them, decode the pricing and marketing they encounter — and eventually find and book the right clinic.

We start as a content site. We become a directory. We become a marketplace. We end as the operating system for clinic management.

### Mission

Be the place every UAE consumer trusts for honest, evidence-based information about aesthetic treatments — and the place clinics most want to be discovered through.

### The brand verb: EMPOWER

Not "inform." Not "educate." *Empower.* The site succeeds when a UAE consumer leaves understanding the aesthetic-medicine game well enough to play it on their own terms.

### Brand positioning: the smart, honest friend who happens to know aesthetic medicine

Voice: warm, plain-spoken, opinionated where the evidence allows. Visitor's first emotion target: *"Finally, someone is being honest with me."*

### The moat

Trust + topical authority + structured taxonomy + a self-improving AI operating stack. All four compound. None can be bought quickly.

---

## 2. Phasing

| Phase | Timing | What ships | Why |
|---|---|---|---|
| **1 — Content** | Months 0–9 | Editorial site covering full UAE aesthetic concern/treatment/machine taxonomy. No bookings. No directory. | Build domain authority and brand trust before introducing transactional friction. |
| **1.5 — Arabic** | Month 6+ | Arabic translation of top-ranking content. | Capture the ~40% of UAE search demand that is in Arabic. |
| **2 — Directory** | Months 9–14 | Clinic profiles, search by treatment + location, reviews. Free + Verified + paid placement. | Become the discovery layer; build supply-side; first revenue. |
| **3 — Bookings** | Months 14–20 | Booking flow, payments, clinic dashboards, commission monetisation. | Capture the transaction. |
| **4 — Native app** | Year 2 | iOS + Android. | After web product-market fit. |
| **5 — Clinic SaaS / ERP** | Year 2–3+ | Full clinic operating system: ERP, ops, marketing, finance, online bookings, scheduling. | Highest-margin long-term revenue. Locks in supply. |

Each phase exists because the previous phase has earned it.

---

## 3. Operating principles

- **AI-first, solo-operator.** Every operational function that would otherwise require an employee is owned by a defined AI agent. No function is "uncovered." See §11.
- **Trust over conversion.** The moat is trust. Never trade it for short-term conversion.
- **Comprehensive taxonomy from day one.** Every concern, treatment, machine has a typed entity in code. Pages publish only when content is publish-ready. Empty stubs hurt SEO.
- **Evidence over opinion.** Every medical claim sourced. Every article cites authoritative bodies. Every article carries a "last reviewed" date.
- **Structural SEO over volume SEO.** Two great cluster-anchored articles beat ten standalone ones. Topical graphs, not blogs.
- **Free until paid is justified.** Phase 1 runs at near-zero recurring cost. Two named exceptions: cliniclick.ae one-time domain (~AED 100–200 for permanent SEO benefit) and ~$30–80/mo Claude API for the AI agent stack (replaces a ~$3k/mo junior team).
- **Criteria mode + no naming.** Articles describe categories and criteria, never specific clinics or doctors. We empower by framework, not by judgment.
- **Tech-debt prevention is a first-class principle.** Three-environment pipeline (dev → UAT → prod) with engineering agent gates. 20% of build capacity quarterly to debt paydown. Without this, AI-first becomes AI-fragile at scale.

---

## 4. Phase 1 founding constraints

| Constraint | Implication |
|---|---|
| Solo founder | No internal handoffs. One person + AI. |
| Near-zero monthly spend | Free tiers only; two named paid exceptions |
| English only at launch | i18n designed in. Arabic added Phase 1.5 without rework. |
| Domain: cliniclick.ae primary | `.ae` is strongest UAE geo-signal. cliniclick.ai 301-redirects to .ae and is held for brand defense. |
| AI-authored content | Heavy citation, transparent framing, Editorial Team byline, no personalised advice, planned medical-advisor recruitment. |
| Comprehensive coverage | Full UAE aesthetic concerns in scope; taxonomy first, content phased. |
| **No naming rule** | No clinic, no doctor, no practitioner is ever named in any article. Single exception: the named medical advisor on "Reviewed by Dr. X, DHA license #Y" basis once onboarded. |
| Local-only first | When build resumes, deploy locally before any external hosting. No GitHub yet. |

---

## 5. Audience

**Five UAE consumer archetypes (Phase 1 weighting):**

| # | Archetype | Weight |
|---|---|---|
| 1 | Western/European expat woman, 28–45 | 35% |
| 2 | South Asian / Arab expat woman, 25–40 | 30% |
| 3 | Local Emirati woman, 22–45 | 10% |
| 4 | Expat man, 30–50 | 20% |
| 5 | Medical tourist + GCC visitor | 5% |

**Content approach: hybrid.** Broad concern/treatment topics with audience-specific "considerations" sections inside each article. One article, multiple entry doors.

**Four UAE-specific contextual factors hard-wired into every relevant article:**
1. **Halal / ingredient considerations.**
2. **Climate-specific skin considerations** (sun, humidity, AC, dust).
3. **Modesty / privacy in clinic experience** (women-only days, female practitioners, prayer rooms).
4. **Ramadan / fasting considerations** for treatment timing.

---

## 6. Competitive landscape

- **Clinic-owned blogs** — promotional; can't say what we say. Structural ceiling.
- **Local listicle media** — pay-to-play, shallow.
- **Booking aggregators** (Vezeeta, Okadoc, Doctoruna) — thin content, no editorial.
- **Global aesthetic publishers** (RealSelf, Allure, Byrdie) — Western defaults, no UAE.
- **Authoritative medical** (NHS, Mayo, AAD) — we cite, not compete.
- **Instagram + TikTok** — biggest force in discovery; we don't compete head-on. We become the second screen.
- **Forums / WhatsApp** — the position we want is "check what CliniClick says about it."

**White space we own:** independent + UAE-specific + comprehensive (concerns + treatments + **machines** + decoders) + Arabic-strong (Phase 1.5+) + structured cross-axis graph + AI-driven operating model that compounds.

**Counter-positioning to Instagram (locked):** Phase 1 builds no Instagram presence. CliniClick is the sober alternative — "what to read after the Instagram clinic ad got your attention." Revisit social in Phase 2.

---

## 7. Trust commitments (the spine of editorial)

**Six public trust commitments** displayed on /editorial-policy:

1. **No paid editorial.** Clinics cannot pay to be covered, ranked, or excluded. Paid placement (Phase 2) is clearly labelled and never affects editorial.
2. **Source-cited claims.** Every medical claim links to a primary source the reader can verify.
3. **Where evidence is mixed, we present both sides.**
4. **UAE-specific context.** Prices in AED, Fitzpatrick skin tone considerations, climate factors, DHA-licensed clinicians.
5. **Plain-English first.**
6. **No fear marketing.**

**Editorial posture: criteria mode + no naming (locked).** No critique of clinics/machines/brands/doctors. **No naming of clinics/doctors/practitioners ever in articles** (single exception: named medical advisor). Articles describe categories ("a chain clinic," "a board-certified dermatologist"). The "which clinic uses X machine" question lives in the Phase 2 directory — never in editorial.

**Authorship: "CliniClick Editorial Team" byline.** No named individual editor at launch. Operationalise E-E-A-T via /how-we-write-our-content (transparent methodology + source canon) plus a public commitment to onboard a named medical advisor by month 6.

**Source canon (the editorial gate):**
- **Tier 1 (always preferred):** NHS, Mayo Clinic, AAD, BAD, Cleveland Clinic, Johns Hopkins, WHO, DHA / MOHAP / Emirates Health Services
- **Tier 2 (specific evidence claims):** JAAD, British Journal of Dermatology, Lasers in Surgery and Medicine, Plastic and Reconstructive Surgery, Dermatologic Surgery, Cochrane Reviews
- **Tier 3 (product/regulatory facts only):** FDA / EMA approvals, manufacturer documentation
- **Tier 4 (only when nothing above covers):** Healthline (cautiously), WebMD, reputable aesthetic societies
- **Never cited:** clinic blogs, beauty publications for medical claims, Reddit/forums/social, AI content from other sites, press releases as evidence, influencer claims

If a claim can't tie to a Tier 1–3 source, the claim doesn't ship.

**Citation style:** light inline + sources block at end (Wirecutter / NYT health-section feel).

**Update cadence:** every article displays `Last reviewed`; minimum review every 12 months; earlier triggers on regulatory/source/market changes; visible `Updated [date]: [what changed]` notes.

**Mistakes:** public corrections policy. Visible correction notes. `feedback@cliniclick.ai` and "Report an error" link on every article.

**Visual direction: approachable medical, with restraint.** Warm, modern, friendly weight. Sans-serif throughout. Brand color confidently but not loudly. Soft callouts for UAE-context blocks. Differentiated from clinical-cold (NHS/AAD) and from beauty-magazine-warm (Refinery29/Byrdie).

**Visuals required on every article (Visuals Agent generates per type):**
- Concern pillar: hero + body-area diagram + cause-mechanism infographic + sub-type comparison
- Treatment pillar: hero + mechanism diagram + timeline + realistic-results visual
- Machine page: device illustration + mechanism diagram + comparison visual
- Decoder: concept hero + 1–2 in-article infographics
- Comparison: side-by-side + mechanism contrast
- Cost guide: cost-breakdown infographic

Free production stack: Unsplash/Pexels/Wikimedia (filtered against clinic-stock cliche), Bing Image Creator / Ideogram / DALL-E / Firefly free tiers (medical-illustration style; never photorealistic faces), Canva free tier, Excalidraw/Mermaid for diagrams, custom React components for interactive visuals.

**Trust components rendered on every content page:**
1. Hand-tuned title + meta description
2. `Last reviewed: [date]` prominently below title
3. `Edited by the CliniClick Editorial Team` byline (link to /how-we-write-our-content)
4. Reading time + scroll progress
5. Article body with light inline citations
6. UAE-context callouts where relevant
7. Sources block at end
8. Standardised disclaimer block
9. "Report an error" link
10. Booking-readiness "next step" component slot (Phase 1: "notify me when bookings launch")
11. Related Concerns / Treatments / Machines (cross-axis links)
12. Newsletter signup

---

## 8. Tech strategy

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router) | Free |
| Hosting | Cloudflare Pages | Free |
| Content store | MDX in repo + TypeScript content models | Free |
| Structured spine | TS objects for `Concern`, `Treatment`, `Machine`, (later) `Clinic` | Free |
| Styling | Tailwind CSS + shadcn/ui | Free |
| On-site search | Pagefind | Free |
| Analytics | GA4 + GTM + Search Console + Microsoft Clarity + PostHog | Free |
| Email | Resend / Buttondown / ConvertKit free tiers | Free |
| Imagery | next/image + Unsplash/Pexels + AI-generated | Free |
| SEO meta + schema | next-seo + custom JSON-LD | Free |
| Sitemap / robots | next-sitemap | Free |
| Agent runtime | Claude API with prompt caching | ~$30–80/mo Phase 1 |
| Agent orchestration | Claude Agent SDK / TypeScript via Cloudflare Workers Cron | Free |

### Information architecture

```
/                                       Home — concern finder + featured guides
/concerns/                              Concern hub
/concerns/[concern]/                    Concern pillar
/concerns/[concern]/[subconcern]/       Sub-concern
/treatments/                            Treatment hub
/treatments/[treatment]/                Treatment pillar
/treatments/[treatment]/cost-in-dubai/  High-intent commercial spoke
/treatments/[treatment]/vs/[other]/     Comparison spoke
/machines/                              Machine/brand hub
/machines/[machine]/                    Machine pillar
/learn/                                 Editorial / decoder articles
/learn/[slug]/                          Individual decoder
/glossary/                              Glossary (hover definitions across the site)
/quiz/                                  Concern → treatment finder
/calculator/                            Cost calculator (per treatment)
/about/, /editorial-policy/, /how-we-write-our-content/, /privacy/, /terms/, /contact/
/clinics/                               [Phase 2 — route reserved]
/book/                                  [Phase 3 — route reserved]
/partners/                              [Phase 2 — clinic-facing pitch]
```

**Two-axis cross-linking enforced by template** — every Concern auto-links to relevant Treatments + Machines; every Treatment auto-links to Concerns it addresses + Machines used; every Machine auto-links to Treatments it powers. Bidirectional graph, generated, never hand-coded.

**Booking-readiness layer (designed in now, activated in Phase 3):** every Treatment, Machine, Concern, Comparison, Quiz-result, and Cost-calculator-output page has a designated "next step" component slot rendering different content per phase: Phase 1 = "Coming soon: clinics in the UAE offering [X]" + email capture; Phase 2 = live filterable clinic list; Phase 3 = booking action. Visual real-estate, position, and reader expectation stay stable across phases. The TypeScript `Clinic` type is designed alongside `Concern`/`Treatment`/`Machine` from day one.

---

## 9. Engineering, deployment & tech-debt prevention

**Three environments:**
- **LOCAL DEV** — Abdullah's machine + AI agents on feature branches.
- **UAT** — `staging.cliniclick.ae`, full mirror of prod, `noindex` + `robots.txt` blocked + access-gated. Every change goes here first.
- **PRODUCTION** — `cliniclick.ae`. Promotion requires: all UAT tests green + Performance Agent confirms no regressions + Security Agent confirms no new vulnerabilities + Abdullah's approval click. Rollback automated for every release.

**Engineering & DevOps agents:**
- **Deployment Agent** — owns dev → UAT → prod pipeline. Branches, deploy scripts, promotions, rollbacks.
- **QA / Testing Agent** — full test suite in UAT before promotion: unit, integration, end-to-end user flows (concern → treatment → quiz → email-capture, booking-readiness slot, search, glossary), accessibility (axe-core), schema validation.
- **Code Quality Agent** — pre-merge review on every change: code smells, missing tests, dead code, type-safety regressions, complexity, dependency bloat.
- **Architecture Agent** — quarterly review. Identifies tech debt; proposes refactors with priority/effort scoring.
- **Security Agent** — every merge: dependency vulnerability scanning, secret-leak detection, exposure-surface review for new public routes, OWASP top-10 sanity.
- **Performance Agent** — Core Web Vitals, bundle sizes, render benchmarks. Regressions block promotion. Weekly digest.
- **Observability Agent** (early Phase 2) — logs, traces, errors. Triages prod issues before reaching Abdullah.

**Tech-debt prevention rules (enforced at write-time):**
- TypeScript strict — no `any`, no `@ts-ignore` without comment + ticket
- No code without a test
- No deploy without UAT pass
- No PR > 500 lines without explicit architecture justification
- Quarterly debt budget — 20% of build capacity to refactor identified by Architecture Agent
- No "temporary" solutions without ticket + expiration date
- Monthly dependency audit

**Phase 1 deferral:** GitHub PR workflow defers until Abdullah is ready to use external git. Until then, local-only with workflow that simulates the gates. Engineering agents work locally + against local dev/UAT setup. When external git resumes, agents plug into GitHub workflow without redesign.

---

## 10. Content strategy

### The four content axes (all first-class from day one)

1. **Concerns** — the "what's bothering me" door.
2. **Treatments** — the "I've heard of this thing" door.
3. **Machines & brands** — the "what's actually being used on me" door. **Strategic differentiator.** Clinic-owned sites won't write this.
4. **Decoders** — cross-cutting empowerment articles. Pricing decoded, DHA licensing, FDA-approved meanings, marketing-claim reading, consultation checklists, why-treatments-vary-by-person, halal across treatments, Ramadan timing, Gulf-climate skin, Fitzpatrick basics. **Moat material.**

### Concern coverage (taxonomy day-one, content phased)

**Tier 1 — first:** Acne · Unwanted hair · Under-eye concerns · Pigmentation · Hair loss · Wrinkles & fine lines · Body fat / contouring

**Tier 2 — next:** Nose · Lips · Jawline & chin · Cheeks · Skin texture & pores · Skin laxity · Stretch marks · Cellulite

**Tier 3 — as authority grows:** Rosacea · Bridal/event prep · Men's aesthetics · Teen acne · Pregnancy/postpartum skin · Scar revision · Tattoo removal · Eyebrow/lash · Hyperhidrosis · Intimate aesthetics

### Treatment coverage (initial)

Botox · Dermal fillers · Laser hair removal · Laser skin resurfacing · Chemical peels · Microneedling · PRP/PRF · HIFU · Radiofrequency · Thread lifts · CoolSculpting / fat reduction · Hair transplant · Non-surgical rhinoplasty · Subcision · Mesotherapy · Skin boosters · LED therapy · HydraFacial · Carbon laser facial · EmSculpt

### Publishing roadmap

- **Months 0–1** — foundation only. 5 launch articles (mix of 2 decoders + 3 cluster pillars showing the bidirectional pattern) + trust pages.
- **Months 2–4** — 7 Tier-1 concern pillars + 8–10 core treatment pillars + 5–6 high-volume comparisons + 3–4 more decoders. ~25–30 articles.
- **Months 5–8** — Tier 2 concerns + 10–15 machine pages + cost-guide spokes + Arabic translation begins. ~70–80 articles.
- **Months 9–12** — Tier 3 + machine depth + glossary at scale + interactive tools at depth + directory infrastructure. ~150 by year 1.

### Six interactive formats (all locked for Phase 1)

1. Newsletter — "The CliniClick Brief," bi-weekly
2. Concern Finder Quiz (Phase 3 becomes matchmaking engine)
3. Save-your-concerns (localStorage now → account-backed Phase 2)
4. Cost calculator per treatment
5. Treatment timeline visualiser
6. Glossary with hover definitions

---

## 11. SEO strategy

**Structural advantages:** underserved UAE category; 4-axis content graph builds topical authority; decoder content owns near-uncontested SERPs; **cliniclick.ae primary domain eliminates the .ai geo handicap**.

**Technical SEO non-negotiables (built into Next.js):** SSR/SSG, clean URL structure, canonicals, auto sitemap, clean robots.txt, mobile-first, Core Web Vitals all green, next/image, HTTPS, semantic heading hierarchy, schema per page type, Open Graph + Twitter cards.

**Geo-targeting:** Search Console country = UAE; hreflang en-AE (ar-AE Phase 1.5); UAE on-page signals woven naturally; UAE address in Organization schema.

**Keyword strategy by query type:**
- **Head-term informational:** target via pillars + tight clusters. 9–18 months to page 1.
- **Long-tail informational:** aggressive coverage in spokes. 2–6 months.
- **Decoder/empowerment queries:** weeks to rank — moat content.

**Pace: mixed (locked).** Patient on pillars, aggressive on long-tails and decoders.

**On-page rules (enforced by SEO QA Agent):** hand-written titles + metas, keyword early, H1 matches title, first paragraph addresses intent within 100 words, question-form subheadings, internal linking enforced by template, image alt text required, content depth bands, `Last reviewed` visible.

**Off-page: organic-only forever (locked).** No paid links, schemes, PBNs, guest farms. Free playbook: digital PR to UAE publications (Khaleej Times, The National, Time Out Dubai, Cosmopolitan ME, Vogue Arabia, Esquire ME); HARO / Qwoted / SourceBottle as expert source; glossary + pricing data + annual-report content as link bait; sparing community presence; outbound links to authority sources.

**Plausible trajectory:** Month 1: <100 sessions. Month 3: 500–2k. Month 6: 5k–15k. Month 9: 15k–40k. Month 12: 40k–100k. Month 18: 100k+.

---

## 12. AI operating model — agents as employees

**Operating principle:** every operational function that would otherwise require an employee is owned by a defined AI agent. Each has a job description, named inputs/outputs, schedule/trigger, escalation path, and quality bar.

**Four architectural rules:**
1. One job, one owner.
2. Every agent escalates somewhere — to another agent or to Abdullah. No autonomous publish/send-critical actions until graduation earned.
3. Every agent reads from the strategy memory as source of truth. Strategy drift is the failure mode we most need to prevent.
4. **Every customer-facing or partner-facing agent has a paired Performance Monitor Agent** that observes interactions, scores against a rubric, identifies failure patterns, and proposes prompt/knowledge updates for approval. Agents improve over months.

### Agent org chart (8 departments)

```
                                                Abdullah (founder / strategic lead / final approver)
                                                                        │
   ┌──────────────┬────────────────┬───────────────────────┬─────────────────────┬──────────────────┬─────────────────────────┬──────────────────┬──────────────────┐
   EDITORIAL  ENGINEERING    DATA & ANALYTICS    MARKETING       BRAND & QUALITY  CUSTOMER & TRUST       MARKETPLACE (P2+)    OPS & FINANCE
        │                  │                       │                                     │                            │                            │                                       │                                  │
   Drafter         Deployment      Data Analytics       Marketing       Brand Agent     Customer Inquiry      Clinic Outreach          Finance
   Editor          QA/Testing       Conversion             Strategy           UX Agent           & Wayfinding             Clinic Onboarding   Compliance
   SEO QA          Code Quality     Cohort/Retention   Brand/PR        UI Agent            Reader Mail                 Clinic CSM                 Legal Triage
   Refresh         Architecture    Anomaly Detector   Social Strategy                          Corrections                  Verification
   Visuals          Security             A/B Test                       Social Content                              Feedback Triage          Clinic Currency
   Compliance     Performance                                          Social Schedule                          Customer Perf Monitor  Clinic Day-to-Day
   Editor             Observability(P2)                            Performance Mkt                                                                  Review Moderation
   Legal Agent                                                                  Creative                                                                        Partner Perf Monitor
                                                                                                                                                                                Booking Ops (P3)
                                                                                                                                                                                Booking Match (P3)
                                                                                                                                                                                Booking Perf Monitor (P3)
   Distribution sub-cluster (could sit under Editorial or Marketing depending on view):
   Newsletter, Email Ops, Drip Sequences, SEO Distribution
```

### Pre-publish flow (the editorial production line)

```
Brief → Drafter → Editor → SEO QA → Compliance Editor → Legal Agent → Brand Agent → Visuals → Publish
                                                                                                       (Abdullah approval throughout)
```

Each agent has veto power. Legal/Compliance flags block publish. Brand/UX flags must be addressed before ship.

### Self-improving Performance Monitor pattern

Every customer-facing or partner-facing agent is paired with a Performance Monitor Agent that:
1. **Observes** every interaction (conversation logs, response times, escalations, follow-on behaviour)
2. **Scores** against a multi-dimensional rubric (resolution rate, satisfaction signals, on-brand voice, adherence to safety rules — e.g., "no medical advice")
3. **Identifies patterns** in failure modes
4. **Proposes prompt/knowledge updates** to address gaps
5. **Routes to Abdullah for approval** — never updates autonomously
6. **Tracks outcomes** of approved updates against baseline — closes the learning loop

Specific monitors: **Customer Agent Performance Monitor** (Customer Inquiry & Reader Mail), **Partner Agent Performance Monitor** (Clinic CSM, Onboarding, Day-to-Day), **Booking Agent Performance Monitor** (P3 — Booking Match, Booking Ops).

This is also a competitive moat — competitors copying our agent prompts get *today's* prompts; they don't get the months of learning that have shaped them.

### Phase 1 agent build order

- **Month 1:** Drafter, Editor, SEO QA, Compliance Editor, **Legal Agent**, Visuals (publish gate must include Legal day one)
- **Month 1 (parallel):** Engineering & DevOps department — Deployment, QA/Testing, Code Quality, Architecture, Security, Performance (must precede Phase 1 build resumption to ensure proper deployment hygiene)
- **Month 2:** Newsletter, Refresh, Data Analytics, Marketing Strategy, Brand/PR Agent
- **Month 3:** Email Ops, Brand Agent (consistency police across everything)
- **Month 4–5:** Conversion, Cohort/Retention, Anomaly Detector, UX Agent, UI Agent
- **Month 6+:** Reader Mail, Corrections — audience scale warrants
- **Month 9+:** Clinic Outreach, Clinic Onboarding, Verification, Clinic Currency, Social Strategy/Content/Schedule, Creative — Phase 2 prep + social activation
- **Phase 2 launch:** Customer Concierge Agent (self-improving via paired Performance Monitor), Clinic Day-to-Day, Review Moderation, Customer + Partner Performance Monitors, Operational Security Agent (runtime threats — distinct from Engineering Security)
- **Phase 2.5+:** Performance Marketing Agent (only when there's a funnel to spend against)
- **Phase 3 launch:** Booking Operations, Booking Match, Booking Performance Monitor

### Implementation

- LLM: Claude API + aggressive prompt caching. Long system prompts (style guide, source canon, brand commitments, strategy memory) cached. ~$30–80/mo Phase 1.
- Orchestration: Claude Agent SDK or TypeScript scripts via Cloudflare Workers Cron — free.
- State: repo for editorial state; tiny Supabase free-tier or JSON files for operational state.
- Human-in-the-loop: every publish/send gated on Abdullah approval. Autonomy graduates with demonstrated quality.
- Observability: every agent run logged. Read like a manager reading weekly check-ins.

---

## 13. Marketing department

(This is the org-chart "Marketing" column above; called out in detail because of its strategic importance for clinic acquisition and Phase 2+ growth.)

**Agents:** Marketing Strategy (CMO equivalent) · Brand/PR · Social Strategy · Social Content · Social Scheduling & Publishing · Performance Marketing (gated) · Creative (distinct from Editorial Visuals).

**Activation gates:**
- Phase 1: organic + content only. Marketing Strategy + Brand/PR active.
- Phase 2 launch: Social Strategy / Content / Scheduling activate per counter-position posture (revisited in Phase 2). Creative Agent activates for marketing/social/ad creative.
- Phase 2.5+: Performance Marketing Agent activates only when (a) directory has live clinic supply, (b) booking-readiness email captures are converting, (c) clear funnel to spend against.

**Phase 1 NOs:** No Instagram/TikTok presence. No paid acquisition. No influencer marketing.

**Coordination:** every Marketing agent reads strategy memory. No marketing initiative deviates from positioning, trust commitments, or criteria-mode posture. Performance Marketing has hard spend caps; never autonomous budget escalation.

---

## 14. Engagement & retention

**Why before bookings exist:** email captures = the demand pool that lights up Phase 3; repeat visits and branded search are positive Google signals; word-of-mouth needs a returning audience.

**Six retention hooks (all locked for Phase 1):**

1. Newsletter — bi-weekly Brief
2. Concern Finder Quiz — Phase 3 becomes matchmaking
3. Save-your-concerns — localStorage Phase 1 → account Phase 2
4. Cost calculator per treatment
5. Treatment timeline visualiser
6. Glossary with hover definitions

**Email capture component on every page** with phase-aware copy. Every capture segmented by surface from birth.

**Phase 1 KPIs:** 1.5%+ email subs / monthly uniques · 60%+ quiz completion · 25%+ quiz → email · 10%+ "save to list" / session · 35%+ newsletter open · 10%+ newsletter CTR · 25%+ returning visitors after month 6 · branded search growing MoM.

**Deliberately NOT in Phase 1:** accounts/login, comments/community, push/PWA prompts, gamification, live chat.

---

## 15. Reader → booker funnel

**Five-rung intent ladder:**

| Rung | Reader signal | What we offer | Phase 3 lead value |
|---|---|---|---|
| 1 Curiosity | First visit, single article | Soft newsletter pitch | Cold |
| 2 Exploration | 3+ pages, 2+ axes | Newsletter pitch + glossary | Warming |
| 3 Specific intent | Treatment + comparison + cost calc | "Notify me for [treatment]" | Warm |
| 4 Decision-mode | Quiz completed + result emailed + saved list | "We'll match you to clinics for [your treatments]" | Hot |
| 5 Active intent | Repeated same treatment + cost calc + saved list ≥3 | Direct outreach + early access | Pre-qualified |

**Phase 3 launch mechanic:** Day 0 → highest-intent segment ("Clinics for [your treatments] are now live"); Day 3 → broader; Day 7 → full base. Continuous match recommendations as new clinics join. Booking Match Agent takes over individual matchmaking.

If Phase 1 executes well, the demand-pool launch alone produces the first hundreds of bookings without paid acquisition.

---

## 16. Marketplace economics

### Model: hybrid (locked)

- **Open / comprehensive base:** every DHA-licensed clinic offering covered treatments has a free basic listing.
- **Verified tier on top:** clinics meeting additional criteria earn the badge with richer profile, prioritised non-sponsored sort, inquiry inbox access.

### Verified tier criteria

- DHA / MOHAP / MOH license confirmed and current
- Min 2 years operating in UAE
- Lead clinician credentials verifiable
- Pricing transparency commitment
- Response-time SLA
- Standardised post-booking review consent
- Adherence to clinic code of conduct
- Annual re-verification

### Five-stream revenue model

| Stream | Phase | Pricing |
|---|---|---|
| Free basic listing | 2 | $0 — builds supply |
| Featured / sponsored placement | 2 | Monthly per category, ~AED 500–2,000, capped slots, "Sponsored" labelled |
| Verified subscription | 2 | Annual, ~AED 3,000–8,000 |
| **Booking commission** | 3 | **~15% on first booking with a clinic; ~5–7% on repeat with same clinic** |
| Clinic SaaS / ERP | 4+ (year 2–3+) | Tiered subscription — highest-margin long-term revenue |
| Aggregate market data | 5+ (year 3+) | Per-report or subscription — anonymous, opt-in |

### Supply acquisition

- **Months 6–9 (still Phase 1):** quiet outreach to 30–50 hand-picked clinics; pitch on Phase 1 traffic + roadmap.
- **Months 9–14 (Phase 2 launch):** open self-service onboarding via Clinic Outreach + Onboarding agents.
- **Months 14+:** demand creates pull; agents shift outbound → inbound triage.

---

## 17. The clinic-side value proposition (for Phase 2+ pitch)

**Two pillars, both built in Phase 1:**

1. **Demand.** Real traffic and segmented warm leads. Quantified live from Phase 1 work: "X monthly UAE consumers researching aesthetic treatments; Y specifically researching [your treatments]; Z in our pre-booking demand pool for [your treatments]."

2. **AI-driven tech sophistication.** The full agent operating stack as differentiator. Onboarding by AI, profile currency by AI, bookings managed by AI, customer matchmaking by AI driven by intent signals, continuous self-improvement via Performance Monitor agents. Signals efficiency, precision, scale — and a roadmap clinics would benefit from (the eventual clinic SaaS).

**Pitch artifacts (Phase 1 builds, Phase 2 exposes):**
- Live traffic dashboard segmented by concern/treatment + demand-pool counts
- Transparent AI-stack tour for clinic audience
- Editorial brand reception (citations, traffic, audience proof)
- Clinic SaaS roadmap signal

**In product:** the clinic dashboard (Phase 2) visibly demonstrates AI sophistication. Every screen has AI-generated insights. Onboarding flow is itself the demo. /partners landing page tells the demand + tech story with live numbers updated by Data Analytics Agent.

**Differentiation:**
- vs Vezeeta / Okadoc / Doctoruna: same booking utility + content-led brand consumers trust + AI-driven operations
- vs clinic-owned content sites: independent brand consumers trust + booking infra they can plug into
- vs Instagram / influencer marketing: traceable, trackable, ROI-measurable supply of intent-qualified consumers

**Three things must be true BEFORE we start pitching (non-negotiable):**
1. Real, demonstrable traffic (40k+ monthly sessions by month 12)
2. Real working AI agent stack producing visible weekly outputs across departments
3. Public proof — /how-we-write-our-content (editorial AI methodology) + /partners or /how-we-build-this (operational AI for clinic audience)

**Phase 1 success measure expanded:** not just "did we publish content" but "did we build the assets the Phase 2 clinic pitch needs."

---

## 18. Risks & defenses

| # | Risk | Mitigation | Early-warning |
|---|---|---|---|
| 1 | Google algorithm penalty (YMYL/Helpful Content) | Trust architecture; medical-advisor recruitment; criteria mode + no naming; diversified content axes; strategy memory as agent source | GSC index drop, multi-query rank drops |
| 2 | AI content perception backlash | Transparent /how-we-write-our-content; Editor + Compliance Editor catch AI tells; no AI photorealistic faces; sourced claims; voice consistency | Reader feedback, bounce spikes |
| 3 | Regulatory letter (DHA/MOHAP) | Compliance Editor + Compliance Agent + Legal Triage; one-time AED 2–4k legal review of /editorial-policy | Any regulator letterhead → P0 |
| 4 | Defamation / clinic complaint | Criteria mode + no naming; sourced facts only; safe-harbor positioning for reviews | Threat from clinic/lawyer → P0 |
| 5 | Health liability | Disclaimer on every article; criteria mode; source attribution; /terms; named medical advisor | Adverse outcome reported → P0 |
| 6 | Competitive entry | Moat is time × authority × trust × graph density × agent learning; first-mover; demand-pool email list | Competitor SERP appearances |
| 7 | Founder concentration / SPOF | Agents do most ops; strategy memory + agent prompts in repo; cross-train trusted person on basic admin | Self-aware |
| 8 | Burnout | Agent autonomy graduations; realistic cadence; bi-weekly newsletter; "what we don't build" lists | Missed publishing; quality drift |
| 9 | Marketplace bootstrap failure | Phase 1 audience-building solves this; quiet-outreach playbook months 6–9; consumer side launches first | Month 7: traffic off trajectory → shift Phase 2 |
| 10 | Tech debt from solo speed | Three-environment pipeline; engineering agent gates; 20% quarterly debt budget; Architecture Agent reviews | Adding axis/template takes >1 day |

**Trades we accept (deliberate):** slower initial growth vs paid acquisition; English-only at launch; no critique vs viral exposé; AI-authored vs human-only; cliniclick.ae one-time spend; ~$30–80/mo Claude API.

**P0 triage rule:** any communication from a regulator, lawyer, or individual describing a treatment-decision-related adverse outcome is automatically P0. Legal Triage Agent does first-pass structuring; Abdullah responds personally after consulting actual UAE counsel. Never respond informally.

---

## 19. Year 1 mission, on a page

> Become the most comprehensive English-language consumer source in the UAE for aesthetic concerns, treatments, and machines — by publishing structurally-rich, evidence-cited, criteria-mode, no-naming content across the full taxonomy — built on a near-zero-cost, AI-agent-operated, file-based stack that one person + a documented org of AI agents can run, that earns trust as its moat, and that extends without rework into a clinic directory (month 9), bookings (month 15), and eventually a clinic operating system (year 2+).

---

## 20. Build sequence (paused — strategy first, build second)

When we resume building:

1. Acquire cliniclick.ae; configure DNS; configure 301 redirect from cliniclick.ai (one-time spend, permanent SEO benefit).
2. Establish three environments locally first (dev / UAT / prod definitions; UAT and prod live when we deploy externally; until then simulate the gates locally).
3. Scaffold Next.js 15 project (already partially started — see existing `src/`; will resume with .ae primary domain config and the four-axes architecture including Machines).
4. Define `Concern`, `Treatment`, `Machine`, `Clinic` (designed-for) TypeScript models with Zod validation; stub the full taxonomy with `published: false` for unwritten entries.
5. Build the page templates with all 12 trust components and the booking-readiness slot.
6. Wire GA4 + GTM + Search Console + Clarity + PostHog with the locked event taxonomy.
7. Build the Phase 1 editorial agents and the Engineering & DevOps agents in parallel — editorial production line cannot run safely without deployment gates in place.
8. Write the first 5 articles end-to-end through the agent pipeline (mix: 2 decoders + 3 cluster pillars).
9. Local QA. Then external deploy when ready (UAT first, prod after gate-pass).

---

_End of v3.0._
_All decisions backed by detailed memory files in `~/.claude/projects/.../memory/`. Agents read from memory, not from this doc. This doc is for human review and reference._
