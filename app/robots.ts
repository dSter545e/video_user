import type { MetadataRoute } from "next";
import { getSitemapIndexUrl } from "../lib/sitemapData";
import { SEO } from "../lib/seo";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/auth/"],
      },
    ],
    sitemap: getSitemapIndexUrl(),
    host: SEO.siteUrl,
  };
}
