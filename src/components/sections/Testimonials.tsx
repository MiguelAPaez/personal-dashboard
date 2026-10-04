import type { Testimonial } from "@/content/schema";
import styles from "./Testimonials.module.css";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" className="section">
      <div className="container">
        <h2>Client feedback</h2>
        <div className={styles.grid}>
          {testimonials.map((t) => (
            <figure key={`${t.author}-${t.quote}`} className={styles.card}>
              <blockquote className={styles.quote}>“{t.quote}”</blockquote>
              <figcaption>
                {t.author}{t.project ? `, ${t.project}` : ""}
                {t.sourceUrl && (
                  <>
                    {" – "}
                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer">View on Upwork</a>
                  </>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
