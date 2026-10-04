import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/schema";
import { pickCover } from "@/lib/projects";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ project }: { project: Project }) {
  const cover = pickCover(project);
  return (
    <article className={styles.card}>
      {cover && (
        <div className={styles.cover}>
          <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 64rem) 24rem, 100vw" className={styles.image} />
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={`/projects/${project.slug}`} className={styles.link}>{project.title}</Link>
        </h3>
        <p>{project.summary}</p>
        <ul className={styles.stack} aria-label="Tech stack">
          {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
        </ul>
        <p className={styles.hint}>Try it live</p>
      </div>
    </article>
  );
}
