import type { ProcessStep } from "@/content/schema";
import styles from "./Process.module.css";

export function Process({ steps }: { steps: ProcessStep[] }) {
  return (
    <section id="process" className="section">
      <div className="container">
        <h2>How we&apos;ll work together</h2>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.title} className={styles.step}>
              <h3 className={styles.title}>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
