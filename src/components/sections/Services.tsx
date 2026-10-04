import type { Service } from "@/content/schema";
import { formatPrice } from "@/lib/format";
import { TrackedLink } from "@/components/TrackedLink";
import styles from "./Services.module.css";

type Props = { services: Service[]; upworkUrl: string };

export function Services({ services, upworkUrl }: Props) {
  return (
    <section id="services" className="section">
      <div className="container">
        <h2>Services &amp; deliverables</h2>
        <div className={styles.grid}>
          {services.map((service, i) => (
            <article key={service.name} className={styles.card} aria-labelledby={`service-${i}`}>
              <h3 id={`service-${i}`}>{service.name}</h3>
              <p className={styles.forWho}>{service.forWho}</p>
              <ul className={styles.deliverables}>
                {service.deliverables.map((d) => <li key={d}>{d}</li>)}
              </ul>
              <p className={styles.timeline}>{service.timeline}</p>
              <p className={styles.price}>From {formatPrice(service.priceFrom)}</p>
              <TrackedLink
                event="upwork_cta_click"
                data={{ location: "services" }}
                className="btn btn--primary"
                href={upworkUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Discuss this on Upwork
              </TrackedLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
