import type { MetadataRoute } from "next";
import { projects } from "@/content";
import { buildSitemap } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(siteUrl, projects);
}
