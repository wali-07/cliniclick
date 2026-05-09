import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Scale,
  Globe2,
  MessageCircle,
  Heart,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Editorial policy",
  description:
    "Six commitments we hold to on every article we publish, plus how we handle naming, corrections, and feedback.",
};

const commitments = [
  {
    n: "01",
    icon: ShieldCheck,
    title: "No paid editorial",
    body: "Clinics cannot pay to be covered, ranked, or excluded from our content. Editorial coverage is independent of any commercial relationship.",
  },
  {
    n: "02",
    icon: FileText,
    title: "Source-cited claims",
    body: "Every medical claim links to a primary source you can read yourself - NHS, Mayo Clinic, AAD, BAD, peer-reviewed journals, or official UAE health authorities. If a claim can't be tied to a credible source, it doesn't ship.",
  },
  {
    n: "03",
    icon: Scale,
    title: "Where evidence is mixed, we say so",
    body: "Medicine doesn't always give clean answers. Where the published evidence is divided, we present both sides and tell you what's still uncertain. We don't pretend certainty we don't have.",
  },
  {
    n: "04",
    icon: Globe2,
    title: "Locally relevant context",
    body: "Local pricing, considerations for all skin tones, and real-world context built into every article that needs it. DHA-licensed clinicians as the standard.",
  },
  {
    n: "05",
    icon: MessageCircle,
    title: "Easy to understand",
    body: "Medical terms are explained on first use. We translate jargon, not perform it. If a sentence reads like a textbook, it gets rewritten.",
  },
  {
    n: "06",
    icon: Heart,
    title: "No fear marketing",
    body: "We never make you feel ashamed of an aesthetic concern in order to sell you on a solution. Concerns are concerns; how you address them - or don't - is up to you.",
  },
];

export default function EditorialPolicyPage() {
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
            Editorial policy
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl md:text-6xl">
            Six commitments we{" "}
            <span className="text-purple-600">hold to</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
            These aren&apos;t marketing language. They&apos;re the editorial system every article you read passes through, before it ever reaches you.
          </p>
        </div>
      </section>

      {/* SIX COMMITMENTS - 2x3 grid of visual cards */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-50/40 via-purple-50/60 to-purple-100/30">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {commitments.map(({ n, icon: Icon, title, body }) => (
              <li
                key={n}
                className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-7 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-ink-300">
                    {n}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-purple-600">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-semibold tracking-tight text-navy-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* NO NAMING + CORRECTIONS - side by side */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-ink-100 bg-white p-7 shadow-[0_1px_0_rgba(0,20,53,0.04)] sm:p-9">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
                No naming
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-navy-900">
                We don&apos;t name clinics or doctors
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                We describe categories, criteria, and questions, and let you do the evaluating yourself. The only exception is naming a medical reviewer who has formally reviewed an article.
              </p>
            </article>
            <article className="rounded-2xl border border-ink-100 bg-white p-7 shadow-[0_1px_0_rgba(0,20,53,0.04)] sm:p-9">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
                Corrections
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-navy-900">
                When we get something wrong, we say so
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                We publish a visible correction on the article. Spotted an error? Email{" "}
                <a href="mailto:feedback@cliniclick.ai" className="text-purple-700 hover:underline">
                  feedback@cliniclick.ai
                </a>{" "}
                or use the &ldquo;Report an error&rdquo; link on any article.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-purple-100/40 via-purple-50/60 to-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                The methodology
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl">
                See how every article is written, reviewed, and shipped
              </h2>
              <p className="mt-4 max-w-xl text-base text-ink-600">
                Source canon, the seven-step publish flow, update cadence, and what we&apos;re honest about not knowing.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="/how-we-write-our-content"
                className="inline-flex rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                How we write our content
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer footer note */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-500" aria-hidden />
            <p className="text-xs text-ink-600">
              Information on CliniClick is for educational purposes only and is not medical advice. Always consult a DHA-licensed clinician before starting any treatment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
