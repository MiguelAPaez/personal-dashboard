import type { Stats } from "@/content/schema";
import { hasStats } from "@/content/visibility";
import styles from "./TrustStrip.module.css";

export function TrustStrip({ stats }: { stats: Stats }) {
  if (!hasStats(stats)) return null;
  const items: { label: string; value: string }[] = [];
  if (stats.jobSuccessScore !== undefined) items.push({ label: "Job Success Score", value: `${stats.jobSuccessScore}%` });
  if (stats.badge) items.push({ label: "Upwork badge", value: stats.badge });
  if (stats.hoursWorked !== undefined) items.push({ label: "Hours worked", value: stats.hoursWorked.toLocaleString("en-US") });
  if (stats.clients !== undefined) items.push({ label: "Clients", value: String(stats.clients) });
  return (
    <section aria-label="Upwork track record" className={styles.strip}>
      <dl className={`container ${styles.list}`}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <dd className={styles.value}>{item.value}</dd>
            <dt className={styles.label}>{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
