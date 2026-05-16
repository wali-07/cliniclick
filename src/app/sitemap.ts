import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getPublishedConcerns } from "@/lib/content/concerns";
import { getPublishedTreatments } from "@/lib/content/treatments";
import { getPublishedMachines } from "@/lib/content/machines";
import {
  getPublishedArticles,
  getArticlesForParent,
} from "@/lib/content/articles";

/**
 * Native Next.js sitemap. Auto-runs at build time, generates sitemap.xml
 * served at /sitemap.xml. Auto-updates whenever content changes - no
 * regen step needed.
 *
 * Article URLs are constructed from parentType: concern/treatment/machine
 * articles live at /<parentType>s/<parentSlug>/<slug>; guide articles
 * live at /learn/<slug>.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const today = new Date().toISOString().slice(0, 10);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${base}/concerns`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/treatments`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/machines`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/learn`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/editorial-policy`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/how-we-write-our-content`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/glossary`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${base}/quiz`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
  ].map((entry) => ({ ...entry, lastModified: today }));

  const concernRoutes: MetadataRoute.Sitemap = getPublishedConcerns().map((c) => ({
    url: `${base}/concerns/${c.slug}`,
    lastModified: c.lastReviewed ?? today,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Treatment/device hub pages are noindex coming-soon stubs UNTIL they
  // have a published article (mirrors the index/noindex logic in their
  // page.tsx). Only emit the indexable ones so Search Console does not
  // flag "Submitted URL marked noindex".
  const treatmentRoutes: MetadataRoute.Sitemap = getPublishedTreatments()
    .filter(
      (t) =>
        getArticlesForParent({ parentType: "treatment", parentSlug: t.slug })
          .length > 0
    )
    .map((t) => ({
      url: `${base}/treatments/${t.slug}`,
      lastModified: t.lastReviewed ?? today,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const machineRoutes: MetadataRoute.Sitemap = getPublishedMachines()
    .filter(
      (m) =>
        getArticlesForParent({ parentType: "machine", parentSlug: m.slug })
          .length > 0
    )
    .map((m) => ({
      url: `${base}/machines/${m.slug}`,
      lastModified: m.lastReviewed ?? today,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const articleRoutes: MetadataRoute.Sitemap = getPublishedArticles().map((a) => {
    const path =
      a.parentType === "guide"
        ? `/learn/${a.slug}`
        : `/${a.parentType}s/${a.parentSlug}/${a.slug}`;
    return {
      url: `${base}${path}`,
      lastModified: a.lastReviewed,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [
    ...staticRoutes,
    ...concernRoutes,
    ...treatmentRoutes,
    ...machineRoutes,
    ...articleRoutes,
  ];
}
