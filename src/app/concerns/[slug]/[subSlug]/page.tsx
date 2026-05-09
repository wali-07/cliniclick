import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConcernBySlug, getPublishedConcerns } from "@/lib/content/concerns";
import {
  getArticleBySlug,
  getArticlesForParent,
} from "@/lib/content/articles";
import { ArticlePage } from "@/components/site/article-page";

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
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.dek,
    alternates: { canonical: `/concerns/${slug}/${subSlug}` },
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
  if (!article || !article.published) notFound();

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
