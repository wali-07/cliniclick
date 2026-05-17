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
import {
  getExpectedArticleSlugs,
  titleFromSlug,
} from "@/lib/content/expected-articles";
import { ArticlePage } from "@/components/site/article-page";
import { ArticleComingSoon } from "@/components/site/article-coming-soon";
import { buildArticleMetadata } from "@/lib/seo/article-metadata";

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

function eyebrowForSlug(subSlug: string): string {
  if (subSlug.startsWith("what-is-")) return "Overview";
  if (subSlug.startsWith("vs-")) return "Comparison";
  return "Explainer";
}

function comingSoonTitle(machineSlug: string, subSlug: string): string {
  const machine = getMachineBySlug(machineSlug);
  const sub = machine?.subDevices.find((s) => s.slug === subSlug);
  return sub?.name ?? titleFromSlug(subSlug);
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
  if (article && article.published) {
    return buildArticleMetadata({
      article,
      canonicalPath: `/machines/${slug}/${subSlug}`,
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
  const machine = getMachineBySlug(slug);
  if (!machine) notFound();

  const article = getArticleBySlug({
    parentType: "machine",
    parentSlug: slug,
    slug: subSlug,
  });

  if (!article || !article.published) {
    if (!getExpectedArticleSlugs("machine", slug).has(subSlug)) notFound();
    return (
      <ArticleComingSoon
        title={comingSoonTitle(slug, subSlug)}
        eyebrow={eyebrowForSlug(subSlug)}
        parent={{
          displayName: machine.name,
          hubHref: `/machines/${machine.slug}`,
          hubLabel: "Devices",
          hubBaseHref: "/machines",
        }}
        surface={`coming-soon-machine-${slug}-${subSlug}`}
      />
    );
  }

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
