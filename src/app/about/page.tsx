import Link from "next/link";
import { Compass, BookOpen, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About CliniClick",
  description:
    "We make aesthetics easy to understand. Here's why we built CliniClick, and what we promise you.",
};

const values = [
  {
    icon: Compass,
    title: "We help you discover",
    body: "Concerns, treatments, devices - all the options worth knowing about before you decide.",
  },
  {
    icon: BookOpen,
    title: "We make it easy to understand",
    body: "Medical evidence, translated for you in clear, everyday language.",
  },
  {
    icon: ShieldCheck,
    title: "We stay on your side",
    body: "No paid editorial. We work for you, not for any clinic.",
  },
];

export default function AboutPage() {
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
            About
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl md:text-6xl">
            We&apos;re here to make aesthetics{" "}
            <span className="text-purple-600">easy to understand</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
            CliniClick is here to help you learn about aesthetic concerns, discover the treatments
            and devices that address them, and walk into any clinic informed.
          </p>
        </div>
      </section>

      {/* WHAT WE ARE / WHAT WE ARE NOT - side by side */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-purple-50/40 via-purple-50/60 to-purple-100/30">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-ink-100 bg-white p-7 shadow-[0_1px_0_rgba(0,20,53,0.04)] sm:p-9">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
                What we are
              </span>
              <p className="mt-4 text-lg leading-relaxed text-navy-900 sm:text-xl">
                A guide built to help you understand your concerns, explore your options, and
                walk into any consultation prepared.
              </p>
            </article>
            <article className="rounded-2xl border border-ink-100 bg-white p-7 shadow-[0_1px_0_rgba(0,20,53,0.04)] sm:p-9">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
                What we are not
              </span>
              <p className="mt-4 text-lg leading-relaxed text-navy-900 sm:text-xl">
                Not a clinic. Not selling treatments. We don&apos;t take payment for editorial
                coverage and we don&apos;t give you personalised medical advice.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
              What we stand for
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
              Three things we hold to
            </h2>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
            {values.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-purple-700 shadow-[0_4px_16px_rgba(167,92,255,0.12)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA - single, focused */}
      <section className="bg-gradient-to-b from-purple-100/40 via-purple-50/60 to-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                The detail
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl">
                Want the full picture of how we work
              </h2>
              <p className="mt-4 max-w-xl text-base text-ink-600">
                Our editorial policy lays out the six commitments we hold to on every article.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="/editorial-policy"
                className="inline-flex rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Read our editorial policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
