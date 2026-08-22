import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin pages expose noindex in both HTML metadata and X-Robots-Tag.
        // They stay crawlable so bots can actually see that directive;
        // robots.txt disallow alone can still leave a URL indexed by anchor
        // text. API byte/data endpoints have no document to index.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
