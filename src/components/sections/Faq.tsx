import type { FaqItem } from "@/content/schema";
import styles from "./Faq.module.css";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="section">
      <div className={`container ${styles.wrap}`}>
        <h2>Questions clients ask</h2>
        {items.map((item) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.question}>{item.question}</summary>
            <p className={styles.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
