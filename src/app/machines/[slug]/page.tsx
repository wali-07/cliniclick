import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getMachineBySlug, getPublishedMachines } from "@/lib/content/machines";
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
  return getPublishedMachines().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const machine = getMachineBySlug(slug);
  if (!machine) return {};
  const articles = getArticlesForParent({
    parentType: "machine",
    parentSlug: slug,
  });
  if (articles.length > 0) {
    return {
      title: `${machine.name} - what it is and how it differs`,
      description: machine.metaDescription ?? machine.shortDescription,
      alternates: { canonical: `/machines/${machine.slug}` },
    };
  }
  return {
    title: `${machine.name} - coming soon`,
    description: `Our in-depth guide to the ${machine.name} is being researched and written.`,
    robots: { index: false, follow: true },
  };
}

export default async function MachinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const machine = getMachineBySlug(slug);
  if (!machine) notFound();

  const articles = getArticlesForParent({
    parentType: "machine",
    parentSlug: slug,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <nav className="text-sm text-ink-500">
        <Link href="/machines" className="hover:text-ink-800">Devices</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">{machine.name}</span>
      </nav>

      <Eyebrow axis="machine" className="mt-8 block" />
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        {machine.name}
      </h1>
      {machine.manufacturer && (
        <p className="mt-2 text-sm uppercase tracking-wider text-ink-500">
          {machine.manufacturer}
        </p>
      )}
      <p className="mt-6 text-lg text-ink-600">{machine.shortDescription}</p>

      {articles.length > 0 ? (
        <section className="mt-12">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
            Reads on {machine.name}
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-navy-900 sm:text-3xl">
            Start here
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/machines/${machine.slug}/${a.slug}`}
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
              More reads on {machine.name} are on the way. Join the Brief and
              we&apos;ll email you when they go live.
            </p>
            <div className="mt-6">
              <NewsletterSignup
                surface={`machine-${machine.slug}`}
                variant="inline"
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          <p className="mt-4 text-sm text-ink-500">
            Our in-depth, independent explainer on {machine.name} is being
            researched and written. It&apos;ll cover what the machine actually
            is, how it differs from comparable devices, who it suits (skin tone,
            treatment area), the evidence base, and the questions to ask if a
            clinic offers it. Sign up below and we&apos;ll email you the moment
            it&apos;s live.
          </p>
          <div className="mt-10">
            <NewsletterSignup
              surface={`machine-${machine.slug}`}
              variant="inline"
            />
          </div>
          <div className="mt-12 border-t border-ink-100 pt-8 text-sm text-ink-600">
            <p>Meanwhile:</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <li>
                <Link href="/machines" className="text-purple-700 hover:underline">
                  Browse all machines &rarr;
                </Link>
              </li>
              <li>
                <Link href="/concerns" className="text-purple-700 hover:underline">
                  Browse concerns &rarr;
                </Link>
              </li>
              <li>
                <Link href="/treatments" className="text-purple-700 hover:underline">
                  Browse treatments &rarr;
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
