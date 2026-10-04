import type { Profile } from "@/content/schema";
import { TrackedLink } from "@/components/TrackedLink";
import styles from "./FinalCta.module.css";

export function FinalCta({ profile }: { profile: Profile }) {
  return (
    <section id="contact" className={`section ${styles.cta}`}>
      <div className="container">
        <h2>Ready to start?</h2>
        <p className={styles.lede}>Send me an invite with a short description of your project. I reply within a day.</p>
        <div className={styles.actions}>
          <TrackedLink
            event="upwork_cta_click"
            data={{ location: "final_cta" }}
            className="btn btn--primary"
            href={profile.links.upwork}
            target="_blank"
            rel="noopener noreferrer"
          >
            Invite me on Upwork
          </TrackedLink>
          <a className="btn btn--ghost" href={`mailto:${profile.links.email}`}>Email me</a>
          {profile.cvPath && <a className="btn btn--ghost" href={profile.cvPath} download>Download my CV</a>}
        </div>
      </div>
    </section>
  );
}
