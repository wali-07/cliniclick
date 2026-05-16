import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import {
  getTreatmentBySlug,
  getPublishedTreatments,
} from "@/lib/content/treatments";
import { getArticlesForParent } from "@/lib/content/articles";
import { Eyebrow } from "@/components/content/eyebrow";
import { NewsletterSignup } from "@/components/content/newsletter-signup";

const eyebrowFromKind: Record<string, string> = {
  overview: "Overview",
  explainer: "Explainer",
  comparison: "Comparison",
  "cost-guide": "Cost guide",
  questions: "What to ask",
};

export async function generateStaticParams() {
  return getPublishedTreatments().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) return {};
  const articles = getArticlesForParent({
    parentType: "treatment",
    parentSlug: slug,
  });
  // Once real reads exist this is a legitimate, indexable category page.
  if (articles.length > 0) {
    return {
      title: `${treatment.name} - what it is, how it works, what it costs`,
      description:
        treatment.metaDescription ?? treatment.shortDescription,
      alternates: { canonical: `/treatments/${treatment.slug}` },
    };
  }
  return {
    title: `${treatment.name} - coming soon`,
    description: `Our in-depth guide to ${treatment.name.toLowerCase()} in the UAE is being researched and written.`,
    robots: { index: false, follow: true },
  };
}

export default async function TreatmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) notFound();

  const articles = getArticlesForParent({
    parentType: "treatment",
    parentSlug: slug,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <nav className="text-sm text-ink-500">
        <Link href="/treatments" className="hover:text-ink-800">Treatments</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">{treatment.name}</span>
      </nav>

      <Eyebrow axis="treatment" className="mt-8 block" />
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        {treatment.name}
      </h1>
      <p className="mt-6 text-lg text-ink-600">{treatment.shortDescription}</p>

      {articles.length > 0 ? (
        <section className="mt-12">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
            Reads on {treatment.name.toLowerCase()}
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-navy-900 sm:text-3xl">
            Start here
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/treatments/${treatment.slug}/${a.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                    {a.eyebrow ?? eyebrowFromKind[a.kind] ?? "Read"}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-navy-900">
                    {a.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-600">
                    {a.dek}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 transition group-hover:gap-2">
                    Read article
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-12 border-t border-ink-100 pt-8">
            <p className="text-sm text-ink-600">
              More reads on {treatment.name.toLowerCase()} are on the way. Join
              the Brief and we&apos;ll email you when they go live.
            </p>
            <div className="mt-6">
              <NewsletterSignup
                surface={`treatment-${treatment.slug}`}
                variant="inline"
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          <p className="mt-4 text-sm text-ink-500">
            Our in-depth, evidence-based guide to{" "}
            {treatment.name.toLowerCase()} is being researched and written.
            It&apos;ll cover how it actually works, what concerns it addresses,
            the procedure journey, sessions, results timelines, risks, what it
            costs in AED, the machines clinics typically use, and the questions
            to ask. Sign up below and we&apos;ll email you the moment it&apos;s
            live.
          </p>
          <div className="mt-10">
            <NewsletterSignup
              surface={`treatment-${treatment.slug}`}
              variant="inline"
            />
          </div>
          <div className="mt-12 border-t border-ink-100 pt-8 text-sm text-ink-600">
            <p>Meanwhile:</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <li>
                <Link href="/treatments" className="text-purple-700 hover:underline">
                  Browse all treatments &rarr;
                </Link>
              </li>
              <li>
                <Link href="/concerns" className="text-purple-700 hover:underline">
                  Browse concerns &rarr;
                </Link>
              </li>
              <li>
                <Link href="/machines" className="text-purple-700 hover:underline">
                  Browse machines &rarr;
                </Link>
              </li>
              <li>
                <Link href="/how-we-write-our-content" className="text-purple-700 hover:underline">
                  How we write our content &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
