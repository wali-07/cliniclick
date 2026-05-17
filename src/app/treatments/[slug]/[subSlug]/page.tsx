import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getTreatmentBySlug,
  getPublishedTreatments,
} from "@/lib/content/treatments";
import {
  getArticleBySlug,
  getArticlesForParent,
} from "@/lib/content/articles";
import {
  getExpectedArticleSlugs,
  titleFromSlug,
} from "@/lib/content/expected-articles";
import { ArticlePage } from "@/components/site/article-page";
import { ArticleComingSoon } from "@/components/site/article-coming-soon";
import { buildArticleMetadata } from "@/lib/seo/article-metadata";

export async function generateStaticParams() {
  const params: { slug: string; subSlug: string }[] = [];
  for (const treatment of getPublishedTreatments()) {
    for (const article of getArticlesForParent({
      parentType: "treatment",
      parentSlug: treatment.slug,
    })) {
      params.push({ slug: treatment.slug, subSlug: article.slug });
    }
  }
  return params;
}

function eyebrowForSlug(subSlug: string): string {
  if (subSlug.startsWith("what-is-")) return "Overview";
  if (subSlug.startsWith("vs-")) return "Comparison";
  return "Explainer";
}

function comingSoonTitle(treatmentSlug: string, subSlug: string): string {
  const treatment = getTreatmentBySlug(treatmentSlug);
  const sub = treatment?.subTreatments.find((s) => s.slug === subSlug);
  return sub?.name ?? titleFromSlug(subSlug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const article = getArticleBySlug({
    parentType: "treatment",
    parentSlug: slug,
    slug: subSlug,
  });
  if (article && article.published) {
    return buildArticleMetadata({
      article,
      canonicalPath: `/treatments/${slug}/${subSlug}`,
    });
  }
  return {
    title: `${comingSoonTitle(slug, subSlug)} - coming soon`,
    robots: { index: false, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = await params;
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) notFound();

  const article = getArticleBySlug({
    parentType: "treatment",
    parentSlug: slug,
    slug: subSlug,
  });

  if (!article || !article.published) {
    if (!getExpectedArticleSlugs("treatment", slug).has(subSlug)) notFound();
    return (
      <ArticleComingSoon
        title={comingSoonTitle(slug, subSlug)}
        eyebrow={eyebrowForSlug(subSlug)}
        parent={{
          displayName: treatment.name,
          hubHref: `/treatments/${treatment.slug}`,
          hubLabel: "Treatments",
          hubBaseHref: "/treatments",
        }}
        surface={`coming-soon-treatment-${slug}-${subSlug}`}
      />
    );
  }

  const related = getArticlesForParent({
    parentType: "treatment",
    parentSlug: slug,
  })
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      dek: a.dek,
      kind: a.kind,
      href: `/treatments/${treatment.slug}/${a.slug}`,
    }));

  return (
    <ArticlePage
      article={article}
      parent={{
        displayName: treatment.name,
        hubHref: `/treatments/${treatment.slug}`,
        hubLabel: "Treatments",
        hubBaseHref: "/treatments",
      }}
      related={related}
    />
  );
}
