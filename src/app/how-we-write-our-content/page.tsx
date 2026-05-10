import Link from "next/link";
import {
  FileText,
  PenTool,
  Eye,
  ShieldCheck,
  Search,
  CheckCircle,
  Send,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "How we write our content",
  description:
    "The methodology behind every CliniClick article: source canon, the seven-step publish flow, update cadence, and what we're honest about not knowing.",
};

const sourceTiers = [
  {
    tier: "Tier 1",
    label: "Primary medical authorities (always preferred)",
    items: ["NHS", "Mayo Clinic", "AAD", "BAD", "Cleveland Clinic", "Johns Hopkins", "WHO", "DHA / MOHAP"],
  },
  {
    tier: "Tier 2",
    label: "Peer-reviewed journals (specific evidence claims)",
    items: ["JAAD", "British Journal of Dermatology", "Lasers in Surgery and Medicine", "Plastic and Reconstructive Surgery", "Cochrane Reviews"],
  },
  {
    tier: "Tier 3",
    label: "Regulatory & manufacturer documentation",
    items: ["FDA approvals", "EMA approvals", "Manufacturer specs (for product facts only)"],
  },
  {
    tier: "Tier 4",
    label: "Reputable secondary (only when nothing above covers it)",
    items: ["Healthline (with caution)", "WebMD", "Aesthetic society publications"],
  },
];

const neverCited = [
  "Clinic blogs",
  "Beauty magazines for medical claims",
  "Social media",
  "AI content from other sites",
  "Press releases as evidence",
  "Influencer claims",
];

const steps = [
  { n: "01", icon: FileText, title: "Brief", body: "An editor defines the article's purpose, target reader, source canon, and structure." },
  { n: "02", icon: PenTool, title: "Drafting", body: "A first draft is produced using AI assistance, grounded in the brief and the source canon." },
  { n: "03", icon: Eye, title: "Editorial review", body: "A human editor reviews against the six commitments, the no-naming rule, and our voice standards." },
  { n: "04", icon: ShieldCheck, title: "Compliance & legal review", body: "Each draft is checked against UAE healthcare-advertising rules and our editorial standards." },
  { n: "05", icon: Search, title: "SEO & accessibility review", body: "Title, description, headings, image alt text, and schema are validated against publication standards." },
  { n: "06", icon: CheckCircle, title: "Source verification", body: "Every cited claim is checked against its source before the article ships." },
  { n: "07", icon: Send, title: "Publish", body: "The article goes live with a visible \"Last reviewed\" date and a link to our editorial policy." },
];

export default function HowWeWriteOurContentPage() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-100">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-100/60 via-white to-white blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
            Methodology
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl md:text-6xl">
            How we write{" "}
            <span className="text-purple-600">what you read</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
            Our source canon, the seven-step publish flow every article passes through, our update cadence, and what we&apos;re honest about not knowing.
          </p>
        </div>
      </section>

      {/* SOURCE CANON */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-50/40 via-purple-50/60 to-purple-100/30">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
              Source canon
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
              Where every claim comes from
            </h2>
            <p className="mt-4 text-base text-ink-600 sm:text-lg">
              We draw from a tiered set of authoritative sources. If a claim can&apos;t be tied to one of these, it doesn&apos;t ship.
            </p>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {sourceTiers.map(({ tier, label, items }) => (
              <li key={tier} className="rounded-2xl border border-ink-100 bg-white p-7">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
                  {tier}
                </span>
                <p className="mt-2 text-sm font-medium text-navy-900">{label}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] font-medium text-ink-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* Never cited callout */}
          <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-7">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
              Never cited
            </span>
            <p className="mt-2 text-sm text-ink-600">
              No matter how convenient or popular the claim:
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {neverCited.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[11px] font-medium text-ink-500 line-through decoration-ink-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SEVEN-STEP PUBLISH FLOW */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
              The publish flow
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
              Seven gates every article passes
            </h2>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ n, icon: Icon, title, body }) => (
              <li
                key={n}
                className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold tracking-tight text-ink-300">
                    {n}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-purple-50 text-purple-600">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight text-navy-900">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* UPDATES + LIMITATIONS - side by side */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-50/30 via-purple-50/40 to-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-ink-100 bg-white p-7 shadow-[0_1px_0_rgba(0,20,53,0.04)] sm:p-9">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-purple-600">
                <RefreshCw className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-navy-900">
                Updates
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Every article is reviewed at least once every 12 months, earlier if a major source publishes new evidence, a regulator changes the rules, or the market shifts. When we update, you&apos;ll see an &ldquo;Updated&rdquo; line with a brief note on what changed.
              </p>
            </article>
            <article className="rounded-2xl border border-ink-100 bg-white p-7 shadow-[0_1px_0_rgba(0,20,53,0.04)] sm:p-9">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-100 text-ink-700">
                <AlertCircle className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-navy-900">
                What we&apos;re honest about
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                We&apos;re not licensed medical practitioners. We summarise published medical evidence; we don&apos;t give personalised medical advice. For anything specific to your situation, always consult a DHA-licensed clinician.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FEEDBACK CTA */}
      <section className="bg-gradient-to-b from-white via-purple-50/40 to-purple-100/30">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                Get in touch
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl">
                Spotted an error or a missing source
              </h2>
              <p className="mt-4 max-w-xl text-base text-ink-600">
                Visible corrections are part of how we keep your trust. Tell us when something needs fixing.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="mailto:feedback@cliniclick.ae"
                className="inline-flex rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                feedback@cliniclick.ae
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
