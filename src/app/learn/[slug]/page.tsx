import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getPublishedArticles,
} from "@/lib/content/articles";
import { ArticlePage } from "@/components/site/article-page";

export async function generateStaticParams() {
  return getPublishedArticles()
    .filter((a) => a.parentType === "guide")
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findGuide(slug);
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.dek,
    alternates: { canonical: `/learn/${slug}` },
  };
}

function findGuide(slug: string) {
  // parentSlug for guides is a category tag (e.g., "pricing", "regulation"),
  // not a real entity slug, so we have to scan rather than lookup-by-key.
  return getPublishedArticles().find(
    (a) => a.parentType === "guide" && a.slug === slug
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findGuide(slug);
  if (!article) notFound();

  // Sibling guides for the "Keep reading" section. Show other guides
  // regardless of category - they all live under the same /learn hub.
  const related = getPublishedArticles()
    .filter((a) => a.parentType === "guide" && a.slug !== article.slug)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      dek: a.dek,
      kind: a.kind,
      href: `/learn/${a.slug}`,
    }));

  return (
    <ArticlePage
      article={article}
      parent={{
        // Guides have no real "hub" entity - the closest concept is the
        // /learn index, which we use as both the breadcrumb base AND the
        // "back to parent" link.
        displayName: "Guides",
        hubHref: "/learn",
        hubLabel: "Learn",
        hubBaseHref: "/learn",
      }}
      related={related}
    />
  );
}
