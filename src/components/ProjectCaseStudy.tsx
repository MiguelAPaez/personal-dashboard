import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/schema";
import { DemoFrame } from "./DemoFrame";
import { TrackedLink } from "./TrackedLink";
import styles from "./ProjectCaseStudy.module.css";

type Props = { project: Project; upworkUrl: string };

export function ProjectCaseStudy({ project, upworkUrl }: Props) {
  return (
    <article className="section">
      <div className={`container ${styles.wrap}`}>
        <Link href="/#work" className={styles.back}>All projects</Link>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.role}>{project.role}</p>
        <ul className={styles.stack} aria-label="Tech stack">
          {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
        </ul>

        <DemoFrame demo={project.demo} title={`${project.title} live demo`} />

        <h2>The problem</h2>
        <p>{project.problem}</p>
        <h2>What I built</h2>
        <p>{project.solution}</p>
        <h2>Results</h2>
        <ul className={styles.results}>
          {project.results.map((result) => <li key={result}>{result}</li>)}
        </ul>

        {project.screenshots.length > 0 && (
          <div className={styles.shots}>
            {project.screenshots.map((shot) => (
              <Image
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                width={1200}
                height={750}
                sizes="(min-width: 40rem) 50vw, 100vw"
                className={styles.shot}
              />
            ))}
          </div>
        )}

        <p className={styles.links}>
          {project.links.live && <a href={project.links.live} target="_blank" rel="noopener noreferrer">Live site</a>}
          {project.links.repo && <a href={project.links.repo} target="_blank" rel="noopener noreferrer">Source code</a>}
        </p>

        <TrackedLink
          event="upwork_cta_click"
          data={{ location: "project_case_study" }}
          className="btn btn--primary"
          href={upworkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Want something like this? Invite me on Upwork
        </TrackedLink>
      </div>
    </article>
  );
}
