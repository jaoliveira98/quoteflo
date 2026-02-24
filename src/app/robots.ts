import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
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
