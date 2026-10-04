type SiteEnv = { siteUrl: string | undefined; vercelEnv: string | undefined };

// Sitemap, robots, canonical metadata and JSON-LD are all built from this URL, so a production
// build without it must fail rather than ship example.com to search engines.
export function resolveSiteUrl({ siteUrl, vercelEnv }: SiteEnv): string {
  if (siteUrl) return siteUrl;
  if (vercelEnv === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be set for production builds (for example https://yourname.dev).");
  }
  return "https://example.com";
}

export const siteUrl = resolveSiteUrl({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  vercelEnv: process.env.VERCEL_ENV,
});
