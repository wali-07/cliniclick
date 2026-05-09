import Link from "next/link";
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { HeroSearch } from "@/components/site/hero-search";
import { ArticlePreviewMock } from "@/components/site/article-preview-mock";
import { FloatingPreviewCards } from "@/components/site/floating-preview-cards";
import { MobilePreviewRail } from "@/components/site/mobile-preview-rail";
import { TrustPanelMock } from "@/components/site/trust-panel-mock";
import { getPublishedConcerns } from "@/lib/content/concerns";
import { getPublishedTreatments } from "@/lib/content/treatments";
import { getPublishedMachines } from "@/lib/content/machines";

const steps = [
  { n: "01", icon: Search, title: "Search or browse", body: "Look up any aesthetic concern, treatment, or device on CliniClick." },
  { n: "02", icon: BookOpen, title: "Read the honest explainer", body: "We explain it clearly, citing trusted medical sources." },
  { n: "03", icon: Sparkles, title: "Walk in informed", body: "Bring the right questions. Soon, book directly through CliniClick." },
];

const ways = [
  { n: "01", eyebrow: "Concern", title: "Start with what bothers you", body: "Acne, hair loss, dark circles, body fat, more.", href: "/concerns", cta: "Browse concerns" },
  { n: "02", eyebrow: "Treatment", title: "Already heard of a treatment?", body: "What it does, what it costs, what to expect.", href: "/treatments", cta: "Browse treatments" },
  { n: "03", eyebrow: "Device", title: "Curious which device they'd use?", body: "We go a layer deeper than most.", href: "/machines", cta: "Browse devices" },
  { n: "04", eyebrow: "Guide", title: "Want to understand the game?", body: "Pricing, licensing, claim-reading - the practical reads.", href: "/learn", cta: "Read the guides" },
];

const popularQuestions = [
  { type: "CONCERN", question: "Is laser hair removal safe for darker skin tones?", topic: "Unwanted hair", href: "/concerns/unwanted-hair" },
  { type: "TREATMENT", question: "How much does Botox actually cost in Dubai?", topic: "Botox", href: "/treatments/botox" },
  { type: "DEVICE", question: "What's the difference between Soprano and Candela lasers?", topic: "Soprano Ice Platinum", href: "/machines/soprano-ice-platinum" },
  { type: "CONCERN", question: "Why do my dark circles keep coming back?", topic: "Under-eye concerns", href: "/concerns/under-eye-concerns" },
];

// Tailwind-only mobile rail / desktop grid pattern.
// No -mx-6 — the rail stays within the same px-6 content margin as other sections,
// so cards align with section text instead of bleeding to the screen edge.
const mobileRail =
  "scrollbar-none flex gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] md:overflow-visible md:pb-0 md:[scroll-snap-type:none]";
const mobileRailItem =
  "w-[280px] flex-shrink-0 [scroll-snap-align:start] md:w-auto md:flex-shrink";

export default function HomePage() {
  const searchItems = [
    ...getPublishedConcerns().map((c) => ({ type: "concern" as const, slug: c.slug, name: c.name, shortDescription: c.shortDescription })),
    ...getPublishedTreatments().map((t) => ({ type: "treatment" as const, slug: t.slug, name: t.name, shortDescription: t.shortDescription, alternateNames: t.alternateNames })),
    ...getPublishedMachines().map((m) => ({ type: "machine" as const, slug: m.slug, name: m.name, shortDescription: m.shortDescription, alternateNames: m.alternateNames })),
  ];

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-100">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[480px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-100/60 via-white to-white blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,20,53,0.08) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-32 lg:pb-36">
          <h1 className="mx-auto max-w-5xl text-center text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-6xl md:text-7xl lg:text-[5rem]">
            <span className="text-purple-600">Discover and learn</span> about aesthetic treatments in the UAE
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-ink-600 sm:text-lg">
            We make aesthetics easy to understand. Explore concerns, treatments, and devices, so you can decide what&apos;s right for you.
          </p>
          <div className="relative mt-10">
            <HeroSearch items={searchItems} />
          </div>
          <div className="mt-12">
            <MobilePreviewRail />
          </div>
        </div>
        <FloatingPreviewCards />
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-50/40 via-purple-50/60 to-purple-100/30">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">How CliniClick works</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
              From curiosity to clarity, in three steps
            </h2>
          </div>
          <ol className={`mt-12 ${mobileRail} md:grid md:grid-cols-3 md:items-stretch md:gap-4`}>
            {steps.map(({ n, icon: Icon, title, body }) => (
              <li key={n} className={`${mobileRailItem} group relative flex h-full min-h-[260px] flex-col rounded-2xl border border-ink-100 bg-white p-7 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.08)]`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-ink-300">{n}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-purple-600">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHY CLINICLICK EXISTS */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-100/30 via-white to-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">Why CliniClick exists</span>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
                A place to learn,{" "}
                <span className="text-purple-600">discover</span>, and one day book
              </h2>
              <p className="mt-5 text-base text-ink-600 sm:text-lg">
                CliniClick is here to empower you to learn about your concerns, discover the
                treatments and devices that address them, and walk into any clinic informed.
                Soon, you&apos;ll also be able to find, compare, and book with the right practitioner.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-ink-700">
                {[
                  "Discover and understand every major concern, treatment, and device",
                  "Clear pricing ranges and real-world context built in",
                  "Independent. No paid editorial, no clinic ads.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Link href="/about" className="inline-flex rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700">
                  About CliniClick
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <ArticlePreviewMock />
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR QUESTIONS */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-white via-purple-50/40 to-purple-100/40">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">Common questions</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
                Asked and<br className="hidden sm:block" /> answered
              </h2>
            </div>
            <Link href="/learn" className="mt-2 inline-flex items-center text-sm font-medium text-navy-900 transition hover:text-purple-700 sm:mt-0">
              See all guides
              <span aria-hidden className="ml-1.5">→</span>
            </Link>
          </div>
          {/* Flat list with dividers (not cards) - distinct from the card grids elsewhere on the page. */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[0_8px_28px_rgba(0,20,53,0.04)]">
            <ul className="divide-y divide-ink-100">
              {popularQuestions.map((q, i) => (
                <li key={i}>
                  <Link
                    href={q.href}
                    className="group flex items-center gap-4 px-5 py-5 transition hover:bg-purple-50/40 sm:gap-5 sm:px-7 sm:py-6"
                  >
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-purple-50 text-purple-600 transition group-hover:bg-purple-100 sm:h-10 sm:w-10">
                      <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium leading-snug text-navy-900 sm:text-base">
                        &ldquo;{q.question}&rdquo;
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                        <span className="inline-flex items-center rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
                          {q.type}
                        </span>
                        <span>
                          Read about <span className="font-medium text-navy-900">{q.topic}</span>
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 text-ink-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-700"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FOUR WAYS IN */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-100/40 via-purple-200/40 to-purple-200/50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">Where to start</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">Four ways in</h2>
          </div>
          <ul className={`mt-12 ${mobileRail} sm:grid sm:grid-cols-2 sm:gap-4`}>
            {ways.map((w) => (
              <li key={w.n} className={mobileRailItem}>
                <Link href={w.href} className="group flex h-full flex-col justify-between rounded-2xl border border-ink-100 bg-white p-7 transition hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-[0_12px_40px_rgba(167,92,255,0.08)] sm:p-9">
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-3xl font-semibold tracking-tight text-ink-200 sm:text-4xl">{w.n}</span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">{w.eyebrow}</span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight text-navy-900 sm:text-xl">{w.title}</h3>
                    <p className="mt-2 text-sm text-ink-600">{w.body}</p>
                  </div>
                  <p className="mt-7 inline-flex items-center text-sm font-medium text-navy-900 transition group-hover:text-purple-700">
                    {w.cta}
                    <span aria-hidden className="ml-2 transition group-hover:translate-x-1">→</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OUR PROMISES - side-by-side mirroring "Why exists" pattern.
          Text on left, visual trust-panel mockup on right. */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-100/40 via-purple-50/60 to-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">Our promises</span>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
                Trust,{" "}
                <span className="text-purple-600">by design</span>
              </h2>
              <p className="mt-5 text-base text-ink-600 sm:text-lg">
                Every article you read runs through four gates - independence,
                evidence, real-world context, and an empowerment frame. They
                aren&apos;t marketing language; they&apos;re the editorial system
                we operate by.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-ink-700">
                {[
                  "Independent. No paid editorial, no clinic ads.",
                  "Evidence-cited. Every claim links to a primary source.",
                  "Locally relevant. Local pricing, all skin tones, practical context.",
                  "Empowering. Criteria and questions, never commands.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Link href="/editorial-policy" className="inline-flex rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700">
                  Read our editorial policy
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <TrustPanelMock />
            </div>
          </div>
        </div>
      </section>

      {/* THE BRIEF - rich dark fade ending */}
      <section className="bg-gradient-to-b from-navy-50/40 via-navy-100/40 to-navy-200/30">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">The bi-weekly Brief</span>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
                Honest aesthetic explainers,
                <br className="hidden sm:block" /> every two weeks
              </h2>
              <p className="mt-5 max-w-xl text-base text-ink-600">
                One short read. One piece of marketing language explained. One question to ask at your next consultation.
              </p>
            </div>
            <div className="lg:col-span-5">
              <form action="/api/subscribe" method="post" className="flex flex-col gap-3" data-capture-surface="home-brief">
                <input type="hidden" name="surface" value="home-brief" />
                <label htmlFor="brief-home" className="sr-only">Your email</label>
                <input id="brief-home" type="email" name="email" required autoComplete="email" placeholder="you@example.com" className="w-full rounded-full border border-ink-200 bg-white px-6 py-4 text-base text-navy-900 placeholder-ink-400 focus:border-navy-900 focus:outline-none" />
                <button type="submit" className="w-full rounded-full bg-navy-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-navy-700">
                  Subscribe. It&apos;s free.
                </button>
                <p className="text-xs text-ink-500">Unsubscribe anytime. Your email stays with us only.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
