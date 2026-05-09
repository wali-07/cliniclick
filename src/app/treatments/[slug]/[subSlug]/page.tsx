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
import { ArticlePage } from "@/components/site/article-page";

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
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.dek,
    alternates: { canonical: `/treatments/${slug}/${subSlug}` },
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
  if (!article || !article.published) notFound();

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
