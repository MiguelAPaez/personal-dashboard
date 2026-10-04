import type { Project } from "@/content/schema";
import { ProjectCard } from "../ProjectCard";
import styles from "./Projects.module.css";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="section">
      <div className="container">
        <h2>Selected work</h2>
        <p className={styles.lede}>Every project below is something you can open and use, not just read about.</p>
        <div className={styles.grid}>
          {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </div>
    </section>
  );
}
