import type { Credential } from "@/content/schema";
import { formatRange } from "@/lib/format";
import { groupCredentials } from "@/lib/credentials";
import styles from "./Credentials.module.css";

const groupTitles: Record<Credential["type"], string> = {
  job: "Experience",
  study: "Education",
  certification: "Certifications",
};

type Props = { summary: string; credentials: Credential[] };

export function Credentials({ summary, credentials }: Props) {
  const groups = groupCredentials(credentials);
  return (
    <section id="credentials" className="section">
      <div className="container">
        <h2>Background</h2>
        <p className={styles.summary}>{summary}</p>
        <div className={styles.groups}>
          {(Object.keys(groupTitles) as Credential["type"][]).map((type) =>
            groups[type].length === 0 ? null : (
              <div key={type}>
                <h3>{groupTitles[type]}</h3>
                <ul className={styles.list}>
                  {groups[type].map((item) => (
                    <li key={`${item.title}-${item.start}`} className={styles.item}>
                      <p className={styles.dates}>{formatRange(item.start, item.end)}</p>
                      <p className={styles.title}>{item.title}</p>
                      <p className={styles.org}>{item.org}</p>
                      {item.description && <p>{item.description}</p>}
                      {item.verifyUrl && (
                        <a href={item.verifyUrl} target="_blank" rel="noopener noreferrer" className={styles.verify}>
                          Verify
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
