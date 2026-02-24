import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
  return staticPages;
}
