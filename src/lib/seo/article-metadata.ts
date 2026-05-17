import type { Metadata } from "next";
import type { Article } from "@/lib/content/types";
import { siteConfig } from "@/lib/site-config";

/**
 * Canonical Next.js Metadata for a published article, including OpenGraph +
 * Twitter card. When the article has a Visuals-Agent hero illustration we use
 * it as the social/share image (absolute URL, what Discover + social cards
 * read); otherwise we fall back to the site-wide OG image.
 *
 * Used by every article route's generateMetadata so the SEO surface stays
 * consistent across concerns / treatments / machines / guides.
 */
export function buildArticleMetadata(args: {
  article: Article;
  /** Site-relative canonical path, e.g. "/concerns/acne/what-is-acne". */
  canonicalPath: string;
}): Metadata {
  const { article, canonicalPath } = args;
  const title = article.metaTitle ?? article.title;
  const description = article.metaDescription ?? article.dek;
  const url = `${siteConfig.url}${canonicalPath}`;

  const ogImage = article.heroImage
    ? {
        url: `${siteConfig.url}${article.heroImage.src}`,
        alt: article.heroImage.alt,
        ...(article.heroImage.width ? { width: article.heroImage.width } : {}),
        ...(article.heroImage.height
          ? { height: article.heroImage.height }
          : {}),
      }
    : { url: siteConfig.ogImage, alt: siteConfig.name };

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: siteConfig.twitter,
      images: [ogImage.url],
    },
  };
}
