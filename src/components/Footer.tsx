import type { Profile } from "@/content/schema";
import { EmailIcon, GithubIcon, LinkedinIcon, UpworkIcon } from "./icons";
import styles from "./Footer.module.css";

export function Footer({ profile }: { profile: Profile }) {
  const { links } = profile;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <ul className={styles.links}>
          <li>
            <a className={styles.link} href={`mailto:${links.email}`}>
              <EmailIcon className={styles.icon} />
              Email
            </a>
          </li>
          <li>
            <a className={styles.link} href={links.upwork} target="_blank" rel="noopener noreferrer">
              <UpworkIcon className={styles.icon} />
              Upwork
            </a>
          </li>
          {links.linkedin && (
            <li>
              <a className={styles.link} href={links.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedinIcon className={styles.icon} />
                LinkedIn
              </a>
            </li>
          )}
          {links.github && (
            <li>
              <a className={styles.link} href={links.github} target="_blank" rel="noopener noreferrer">
                <GithubIcon className={styles.icon} />
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
