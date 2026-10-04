import type { MetadataRoute } from "next";
import type { Profile, Project } from "@/content/schema";

export function buildPersonJsonLd(profile: Profile, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    url: siteUrl,
    image: `${siteUrl}${profile.photo.src}`,
    sameAs: [
      profile.links.upwork,
      ...(profile.links.linkedin ? [profile.links.linkedin] : []),
      ...(profile.links.github ? [profile.links.github] : []),
    ],
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildSitemap(siteUrl: string, projects: Project[]): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
