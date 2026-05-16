import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  ChevronRight,
  Info,
  Layers,
  Stethoscope,
  GitCompareArrows,
  Cpu,
} from "lucide-react";
import {
  getConcernBySlug,
  getPublishedConcerns,
} from "@/lib/content/concerns";
import { getTreatmentsForConcern, getTreatmentBySlug } from "@/lib/content/treatments";
import { getPublishedMachines } from "@/lib/content/machines";
import { resolveComparisonHref } from "@/lib/content/expected-articles";
import { ConcernOverviewMock } from "@/components/site/concern-overview-mock";
import { NotifyForm } from "@/components/site/notify-form";

export async function generateStaticParams() {
  return getPublishedConcerns().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concern = getConcernBySlug(slug);
  if (!concern) return {};
  return {
    title: concern.metaTitle ?? concern.name,
    description: concern.metaDescription ?? concern.shortDescription,
    alternates: { canonical: `/concerns/${concern.slug}` },
  };
}

export default async function ConcernPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concern = getConcernBySlug(slug);
  if (!concern) notFound();

  const treatments = getTreatmentsForConcern(concern.slug);
  const machines = getPublishedMachines().filter((m) =>
    m.treatmentSlugs.some((t) => concern.treatmentSlugs.includes(t))
  );

  const comparisons: Array<{ a: string; b: string; slugA: string; slugB: string }> = [];
  treatments.forEach((t) => {
    t.comparisonSlugs.forEach((other) => {
      const otherT = getTreatmentBySlug(other);
      if (!otherT || otherT.slug === t.slug) return;
      const pairKey = [t.slug, other].sort().join("__");
      if (!comparisons.find((c) => [c.slugA, c.slugB].sort().join("__") === pairKey)) {
        comparisons.push({ a: t.name, b: otherT.name, slugA: t.slug, slugB: otherT.slug });
      }
    });
  });

  return (
    <div className="relative bg-gradient-to-b from-purple-100/40 via-purple-50/40 to-purple-100/30">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-200/40 to-transparent blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tl from-purple-300/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[440px] w-[440px] rounded-full bg-gradient-to-tr from-purple-200/30 to-transparent blur-3xl" />
      </div>

      {/* HERO - tightened, no disclaimer pill */}
      <section className="relative border-b border-purple-100/60">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-10 sm:pt-12 sm:pb-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-500">
            <Link href="/concerns" className="transition hover:text-navy-900">
              Concerns
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />
            <span className="font-medium text-navy-900">{concern.name}</span>
          </nav>

          <div className="mt-5 max-w-3xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
              Concern
            </span>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl md:text-6xl">
              {concern.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
              {concern.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* UNDERSTAND - side-by-side with article preview mockup */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-16 sm:pt-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                Start here
              </span>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
                Understand{" "}
                <span className="text-purple-600">{concern.name.toLowerCase()}</span>
              </h2>
              <p className="mt-5 text-base text-ink-600 sm:text-lg">
                The plain explanation before anything else. What it actually is, what
                causes it, and how to recognise it - all in everyday language with
                cited sources.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-ink-700">
                {[
                  "What it is and why it happens",
                  "How to recognise your specific type",
                  "When it warrants seeing a clinician",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Link
                  href={`/concerns/${concern.slug}/what-is-${concern.slug}`}
                  className="inline-flex rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700"
                >
                  Read the overview
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <ConcernOverviewMock concernName={concern.name} />
            </div>
          </div>
        </div>
      </section>

      {/* SUB-TOPICS */}
      {concern.subConcerns.length > 0 && (
        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28">
            <div className="flex items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                  Different types
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl">
                  Find the type that matches you
                </h2>
              </div>
              {concern.subConcerns.length > 3 && (
                <Link
                  href={`/learn?topic=${concern.slug}`}
                  className="hidden flex-shrink-0 items-center gap-1.5 text-sm font-medium text-navy-900 transition hover:text-purple-700 sm:inline-flex"
                >
                  See all types
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {concern.subConcerns.slice(0, 3).map((sub) => (
                <li key={sub.slug}>
                  <Link
                    href={`/concerns/${concern.slug}/${sub.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                        <Layers className="h-5 w-5" aria-hidden />
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 text-ink-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-700"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy-900">
                      {sub.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                      {sub.shortDescription}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* TREATMENTS */}
      {treatments.length > 0 && (
        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28">
            <div className="flex items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                  Your options
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl">
                  Treatments that address {concern.name.toLowerCase()}
                </h2>
              </div>
              {treatments.length > 3 && (
                <Link
                  href="/treatments"
                  className="hidden flex-shrink-0 items-center gap-1.5 text-sm font-medium text-navy-900 transition hover:text-purple-700 sm:inline-flex"
                >
                  All treatments
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {treatments.slice(0, 3).map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/treatments/${t.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                        <Stethoscope className="h-5 w-5" aria-hidden />
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 text-ink-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-700"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy-900">
                      {t.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                      {t.shortDescription}
                    </p>
                    <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-500">
                      {t.downtime && (
                        <div>
                          <dt className="inline">Downtime: </dt>
                          <dd className="inline font-medium text-navy-900">{t.downtime}</dd>
                        </div>
                      )}
                      {t.sessionsTypical && (
                        <div className="truncate">
                          <dt className="inline">Sessions: </dt>
                          <dd className="inline font-medium text-navy-900">{t.sessionsTypical}</dd>
                        </div>
                      )}
                    </dl>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* COMPARE */}
      {comparisons.length > 0 && (
        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28">
            <div className="flex items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                  Decide between options
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl">
                  Side-by-side comparisons
                </h2>
              </div>
              {comparisons.length > 3 && (
                <Link
                  href={`/learn?topic=${concern.slug}&type=comparisons`}
                  className="hidden flex-shrink-0 items-center gap-1.5 text-sm font-medium text-navy-900 transition hover:text-purple-700 sm:inline-flex"
                >
                  See all comparisons
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comparisons.slice(0, 3).map((c) => (
                <li key={`${c.slugA}-${c.slugB}`}>
                  <Link
                    href={resolveComparisonHref(c.slugA, c.slugB)}
                    className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                        <GitCompareArrows className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-700">
                          Comparison
                        </span>
                        <h3 className="mt-1 text-base font-semibold tracking-tight text-navy-900 sm:text-lg">
                          {c.a} <span className="text-ink-400">vs</span> {c.b}
                        </h3>
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 text-ink-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-700"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* DEVICES */}
      {machines.length > 0 && (
        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28">
            <div className="flex items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                  Behind the treatment
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl">
                  Devices commonly used
                </h2>
              </div>
              {machines.length > 3 && (
                <Link
                  href="/machines"
                  className="hidden flex-shrink-0 items-center gap-1.5 text-sm font-medium text-navy-900 transition hover:text-purple-700 sm:inline-flex"
                >
                  All devices
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {machines.slice(0, 3).map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/machines/${m.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                        <Cpu className="h-5 w-5" aria-hidden />
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 text-ink-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-700"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy-900">{m.name}</h3>
                    {m.manufacturer && (
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-500">{m.manufacturer}</p>
                    )}
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{m.shortDescription}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FIND A CLINIC - bold centered hero CTA, myejari-style "Ready to..." moment */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-50 via-white to-purple-100/60 px-8 py-16 sm:px-12 sm:py-24">
            {/* Decorative gradient blobs */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/4 h-[320px] w-[320px] rounded-full bg-gradient-to-br from-purple-300/40 to-transparent blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-purple-400/30 to-transparent blur-3xl"
            />

            <div className="relative mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-700 shadow-[0_2px_8px_rgba(167,92,255,0.15)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" aria-hidden />
                Coming soon
              </span>
              <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl md:text-6xl">
                Ready to find your clinic for{" "}
                <span className="text-purple-600">{concern.name.toLowerCase()}</span>?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base text-ink-600 sm:text-lg">
                Our independent directory launches soon. Be first to compare verified providers, prices, and practitioners - then book in a click.
              </p>
              <NotifyForm surface={`concern-${concern.slug}`} />
              <p className="mt-4 text-xs text-ink-500">
                We&apos;ll only email you when the directory is live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SLIM FOOTER DISCLAIMER - single line, low-key, info on the side */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pb-24">
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-ink-100 bg-white/70 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-xs text-ink-600">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-600" aria-hidden />
              <span>
                <span className="font-medium text-navy-900">Not medical advice.</span> For learning only - always consult a DHA-licensed clinician.
              </span>
            </p>
            <p className="text-xs text-ink-500">
              {concern.lastReviewed && <>Last reviewed: {concern.lastReviewed} · </>}
              <Link href="/editorial-policy" className="text-purple-700 hover:underline">
                Editorial policy
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
