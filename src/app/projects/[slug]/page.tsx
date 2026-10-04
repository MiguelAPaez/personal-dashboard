import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profile, projects } from "@/content";
import { ProjectCaseStudy } from "@/components/ProjectCaseStudy";
import { siteUrl } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project
    ? { title: project.title, description: project.summary, alternates: { canonical: `${siteUrl}/projects/${project.slug}` } }
    : {};
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <main>
      <ProjectCaseStudy project={project} upworkUrl={profile.links.upwork} />
    </main>
  );
}
