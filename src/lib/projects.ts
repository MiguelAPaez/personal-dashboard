import type { Project } from "@/content/schema";

export function pickCover(project: Project): { src: string; alt: string } | undefined {
  if (project.cover) return project.cover;
  if (project.screenshots[0]) return project.screenshots[0];
  if (project.demo?.poster) return { src: project.demo.poster, alt: "" };
  return undefined;
}

export function visibleProjects(projects: Project[], env: string | undefined): Project[] {
  return env === "development" ? projects : projects.filter((p) => !p.draft);
}
