import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getMachineBySlug,
  getPublishedMachines,
} from "@/lib/content/machines";
import {
  getArticleBySlug,
  getArticlesForParent,
} from "@/lib/content/articles";
import { ArticlePage } from "@/components/site/article-page";

export async function generateStaticParams() {
  const params: { slug: string; subSlug: string }[] = [];
  for (const machine of getPublishedMachines()) {
    for (const article of getArticlesForParent({
      parentType: "machine",
      parentSlug: machine.slug,
    })) {
      params.push({ slug: machine.slug, subSlug: article.slug });
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
    parentType: "machine",
    parentSlug: slug,
    slug: subSlug,
  });
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.dek,
    alternates: { canonical: `/machines/${slug}/${subSlug}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = await params;
  const machine = getMachineBySlug(slug);
  if (!machine) notFound();
  const article = getArticleBySlug({
    parentType: "machine",
    parentSlug: slug,
    slug: subSlug,
  });
  if (!article || !article.published) notFound();

  const related = getArticlesForParent({
    parentType: "machine",
    parentSlug: slug,
  })
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      dek: a.dek,
      kind: a.kind,
      href: `/machines/${machine.slug}/${a.slug}`,
    }));

  return (
    <ArticlePage
      article={article}
      parent={{
        displayName: machine.name,
        hubHref: `/machines/${machine.slug}`,
        hubLabel: "Devices",
        hubBaseHref: "/machines",
      }}
      related={related}
    />
  );
}
