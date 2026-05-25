import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
} from "lucide-react";
import type { Article } from "@/lib/content/types";
import { ArticleBlocks } from "@/components/site/article-blocks";
import { ArticleToc } from "@/components/site/article-toc";
import { NotifyForm } from "@/components/site/notify-form";
import { JsonLd } from "@/components/seo/json-ld";
import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/seo/schemas";
import { estimateReadingMinutes } from "@/lib/content/articles";
import { siteConfig } from "@/lib/site-config";

const eyebrowFromKind: Record<Article["kind"], string> = {
  overview: "Overview",
  explainer: "Explainer",
  comparison: "Comparison",
  "cost-guide": "Cost guide",
  questions: "What to ask",
  "treatment-guide": "Treatment guide",
  "safety-guide": "Safety guide",
};

type ParentInfo = {
  /** "Acne" / "Botox" / "Soprano Ice Platinum" */
  displayName: string;
  /** "/concerns/acne" - link back to the parent hub */
  hubHref: string;
  /** "Concerns" / "Treatments" / "Devices" - top-level breadcrumb label */
  hubLabel: string;
  /** "/concerns" - link to the top-level hub */
  hubBaseHref: string;
};

export function ArticlePage({
  article,
  parent,
  related,
}: {
  article: Article;
  parent: ParentInfo;
  /** Sibling articles under the same parent for the "Keep reading" rail. */
  related: Array<{ slug: string; title: string; dek: string; kind: Article["kind"]; href: string }>;
}) {
  const readingMinutes = estimateReadingMinutes(article);
  const eyebrow = article.eyebrow ?? eyebrowFromKind[article.kind];

  const canonicalPath = `${parent.hubHref}/${article.slug}`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const heroImageUrl = article.heroImage
    ? `${siteConfig.url}${article.heroImage.src}`
    : undefined;

  const jsonLd = [
    articleSchema({
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.dek,
      url: canonicalUrl,
      datePublished: article.lastReviewed,
      dateModified: article.lastReviewed,
      image: heroImageUrl,
      imageWidth: article.heroImage?.width,
      imageHeight: article.heroImage?.height,
    }),
    breadcrumbSchema([
      { name: parent.hubLabel, url: parent.hubBaseHref },
      { name: parent.displayName, url: parent.hubHref },
      { name: article.title, url: canonicalPath },
    ]),
    faqPageSchema(article.faqs),
  ];

  return (
    <article className="relative bg-gradient-to-b from-purple-100/30 via-white to-purple-50/40">
      {jsonLd.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      {/* HERO */}
      <header className="relative border-b border-purple-100/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-purple-200/40 to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500"
          >
            <Link href={parent.hubBaseHref} className="transition hover:text-navy-900">
              {parent.hubLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />
            <Link href={parent.hubHref} className="transition hover:text-navy-900">
              {parent.displayName}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />
            <span className="font-medium text-navy-900">{article.title}</span>
          </nav>

          <div className="mt-6">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
              {eyebrow}
            </span>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl md:text-[56px]">
              {article.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
              {article.dek}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {readingMinutes} min read
            </span>
            <span aria-hidden className="text-ink-300">·</span>
            <span>Last reviewed: {article.lastReviewed}</span>
            {article.sources.length > 0 && (
              <>
                <span aria-hidden className="text-ink-300">·</span>
                <a
                  href="#sources"
                  className="text-purple-700 transition hover:text-purple-900"
                >
                  {article.sources.length} sources cited
                </a>
              </>
            )}
          </div>

          {article.heroImage && (
            <figure className="mt-9 overflow-hidden rounded-2xl border border-ink-100 bg-white">
              <div className="relative aspect-[16/9] w-full bg-purple-50/40">
                <Image
                  src={article.heroImage.src}
                  alt={article.heroImage.alt}
                  fill
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover"
                />
              </div>
              {article.heroImage.caption && (
                <figcaption className="border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
                  {article.heroImage.caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </header>

      {/* BODY + STICKY TOC */}
      <div className="relative">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-28">
                <ArticleToc blocks={article.body} />
              </div>
            </aside>

            <div className="lg:col-span-9">
              <div className="max-w-[68ch]">
                <ArticleBlocks blocks={article.body} />

                {article.faqs.length > 0 && (
                  <section className="mt-16">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                      Common questions
                    </span>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-navy-900 sm:text-3xl">
                      Frequently asked
                    </h2>
                    <dl className="mt-8 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white">
                      {article.faqs.map((faq, i) => (
                        <div key={i} className="p-6 sm:p-7">
                          <dt className="text-base font-semibold tracking-tight text-navy-900 sm:text-lg">
                            {faq.question}
                          </dt>
                          <dd className="mt-2.5 text-[15px] leading-relaxed text-ink-700 sm:text-base">
                            {faq.answer}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                {article.sources.length > 0 && (
                  <section id="sources" className="mt-16 scroll-mt-28">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                      Sources
                    </span>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-navy-900 sm:text-3xl">
                      What we cited
                    </h2>
                    <ol className="mt-8 space-y-4">
                      {article.sources.map((source, i) => {
                        const n = i + 1;
                        return (
                          <li
                            key={n}
                            id={`source-${n}`}
                            className="scroll-mt-28 rounded-2xl border border-ink-200 bg-white p-5"
                          >
                            <div className="flex gap-4">
                              <span
                                aria-hidden
                                className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-purple-100 text-[12px] font-semibold text-purple-700"
                              >
                                {n}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                                  {source.type} · {source.publisher}
                                </p>
                                {source.url ? (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-flex items-start gap-1.5 text-[15px] font-medium leading-snug text-navy-900 transition hover:text-purple-700"
                                  >
                                    <span>{source.title}</span>
                                    <ExternalLink
                                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ink-400"
                                      aria-hidden
                                    />
                                  </a>
                                ) : (
                                  <p className="mt-1 text-[15px] font-medium leading-snug text-navy-900">
                                    {source.title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                )}

                <aside className="mt-12 flex items-start gap-3 rounded-2xl border-l-4 border-purple-300 bg-white px-5 py-4">
                  <Info
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                    aria-hidden
                  />
                  <p className="text-xs leading-relaxed text-ink-600">
                    <span className="font-medium text-navy-900">
                      Information only - not medical advice.
                    </span>{" "}
                    This article is for learning. For guidance about your own
                    skin or treatment plan, always consult a DHA-licensed
                    clinician. See our{" "}
                    <Link
                      href="/editorial-policy"
                      className="text-purple-700 hover:underline"
                    >
                      editorial policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href={siteConfig.editorial.url}
                      className="text-purple-700 hover:underline"
                    >
                      how we write our content
                    </Link>
                    .
                  </p>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="relative border-t border-ink-100 bg-gradient-to-b from-white to-purple-50/40">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="max-w-2xl">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                Keep reading
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl">
                More on {parent.displayName.toLowerCase()}
              </h2>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={a.href}
                    className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                      {eyebrowFromKind[a.kind]}
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
          </div>
        </section>
      )}

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pb-32">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-50 via-white to-purple-100/60 px-8 py-16 sm:px-12 sm:py-20">
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
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500"
                />
                Coming soon
              </span>
              <h2 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-navy-900 sm:text-4xl md:text-5xl">
                Ready to find your clinic for{" "}
                <span className="text-purple-600">
                  {parent.displayName.toLowerCase()}
                </span>
                ?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-ink-600 sm:text-lg">
                Our independent directory launches soon. Be first to compare
                verified providers, prices, and practitioners - then book in a
                click.
              </p>
              <NotifyForm surface={`article-${article.slug}`} />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
