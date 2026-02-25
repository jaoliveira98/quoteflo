import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/", "/settings", "/settings/", "/api", "/api/", "/quotes", "/quotes/", "/customers", "/customers/", "/services", "/services/", "/analytics", "/analytics/", "/q/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
