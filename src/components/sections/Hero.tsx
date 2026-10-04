import type { Profile } from "@/content/schema";
import { TrackedLink } from "@/components/TrackedLink";
import styles from "./Hero.module.css";

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="top" className={`section ${styles.hero}`}>
      <div className="container">
        <p className="eyebrow">{profile.availability}</p>
        <h1 className={styles.title}>{profile.headline}</h1>
        <p className={styles.lede}>{profile.name}, based in {profile.location}.</p>
        <div className={styles.actions}>
          <TrackedLink
            event="upwork_cta_click"
            data={{ location: "hero" }}
            className="btn btn--primary"
            href={profile.links.upwork}
            target="_blank"
            rel="noopener noreferrer"
          >
            Invite me on Upwork
          </TrackedLink>
          <a className="btn btn--ghost" href="#work">Try my live projects</a>
        </div>
      </div>
    </section>
  );
}
