import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConcernBySlug, getPublishedConcerns } from "@/lib/content/concerns";
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
  for (const concern of getPublishedConcerns()) {
    for (const article of getArticlesForParent({
      parentType: "concern",
      parentSlug: concern.slug,
    })) {
      params.push({ slug: concern.slug, subSlug: article.slug });
    }
  }
  return params;
}

function eyebrowForSlug(subSlug: string): string {
  if (subSlug.startsWith("what-is-")) return "Overview";
  if (subSlug.startsWith("vs-")) return "Comparison";
  return "Explainer";
}

function comingSoonTitle(concernSlug: string, subSlug: string): string {
  const concern = getConcernBySlug(concernSlug);
  const sub = concern?.subConcerns.find((s) => s.slug === subSlug);
  return sub?.name ?? titleFromSlug(subSlug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const article = getArticleBySlug({
    parentType: "concern",
    parentSlug: slug,
    slug: subSlug,
  });
  if (article && article.published) {
    return buildArticleMetadata({
      article,
      canonicalPath: `/concerns/${slug}/${subSlug}`,
    });
  }
  // Expected-but-unwritten: a coming-soon page. Never index thin pages.
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
  const concern = getConcernBySlug(slug);
  if (!concern) notFound();

  const article = getArticleBySlug({
    parentType: "concern",
    parentSlug: slug,
    slug: subSlug,
  });

  if (!article || !article.published) {
    // Render coming-soon for slugs the site legitimately links to;
    // genuine 404 for anything else so we never index junk URLs.
    if (!getExpectedArticleSlugs("concern", slug).has(subSlug)) notFound();
    return (
      <ArticleComingSoon
        title={comingSoonTitle(slug, subSlug)}
        eyebrow={eyebrowForSlug(subSlug)}
        parent={{
          displayName: concern.name,
          hubHref: `/concerns/${concern.slug}`,
          hubLabel: "Concerns",
          hubBaseHref: "/concerns",
        }}
        surface={`coming-soon-concern-${slug}-${subSlug}`}
      />
    );
  }

  const related = getArticlesForParent({
    parentType: "concern",
    parentSlug: slug,
  })
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      dek: a.dek,
      kind: a.kind,
      href: `/concerns/${concern.slug}/${a.slug}`,
    }));

  return (
    <ArticlePage
      article={article}
      parent={{
        displayName: concern.name,
        hubHref: `/concerns/${concern.slug}`,
        hubLabel: "Concerns",
        hubBaseHref: "/concerns",
      }}
      related={related}
    />
  );
}
