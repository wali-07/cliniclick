import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Native Next.js robots.txt. Served at /robots.txt.
 * Allow everything in production, point crawlers at the sitemap.
 *
 * If we add a UAT subdomain (staging.cliniclick.ae) later we'll override
 * this for the staging environment to disallow all crawling - that's a
 * separate concern from this production-default file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block our internal API routes from being indexed.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
