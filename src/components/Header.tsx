import Link from "next/link";
import { TrackedLink } from "./TrackedLink";
import styles from "./Header.module.css";

type Props = { name: string; upworkUrl: string };

export function Header({ name, upworkUrl }: Props) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/#top" className={styles.brand}>{name}</Link>
        <details className={styles.menu}>
          <summary className={styles.menuToggle} aria-label="Menu">
            <span className={styles.menuIcon} aria-hidden="true" />
          </summary>
          <nav aria-label="Sections" className={styles.mobileNav}>
            <Link href="/#work">Work</Link>
            <Link href="/#about">About</Link>
            <Link href="/#services">Services</Link>
            <Link href="/#contact">Contact</Link>
          </nav>
        </details>
        <nav aria-label="Sections" className={styles.navDesktop}>
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <Link href="/#services">Services</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <TrackedLink
          event="upwork_cta_click"
          data={{ location: "header" }}
          className={`btn btn--primary ${styles.cta}`}
          href={upworkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Invite me on Upwork
        </TrackedLink>
      </div>
    </header>
  );
}
