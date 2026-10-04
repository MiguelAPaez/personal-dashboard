import Image from "next/image";
import type { Profile } from "@/content/schema";
import styles from "./About.module.css";

export function About({ profile }: { profile: Profile }) {
  const { photo } = profile;
  return (
    <section id="about" className="section">
      <div className={`container ${styles.grid}`}>
        <Image className={styles.photo} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
        <div>
          <h2>About me</h2>
          {profile.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <dl className={styles.facts}>
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
            <div><dt>Timezone</dt><dd>{profile.timezone}</dd></div>
            <div><dt>Response time</dt><dd>{profile.responseTime}</dd></div>
          </dl>
          {profile.cvPath && (
            <a className="btn btn--ghost" href={profile.cvPath} download>Download CV</a>
          )}
        </div>
      </div>
    </section>
  );
}
