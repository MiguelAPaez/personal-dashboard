import type { Project } from "@/content/schema";

export function pickCover(project: Project): { src: string; alt: string } | undefined {
  if (project.screenshots[0]) return project.screenshots[0];
  if (project.demo.poster) return { src: project.demo.poster, alt: "" };
  return undefined;
}
