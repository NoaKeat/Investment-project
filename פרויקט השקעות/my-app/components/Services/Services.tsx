import styles from "./Services.module.css";
import data from "@/data/services.json";

export default function ServicesSection() {
  return (
    <section className={styles.servicesSection}>
      <div className={styles.inner}>
        
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>
            {data.sectionHeader.number}
          </span>
          <span className={styles.sectionTitle}>
            : {data.sectionHeader.title}
          </span>
        </div>

        <div className={styles.cardsWrapper}>
          {data.services.map((service) => (
            <div key={service.id} className={styles.card}>
              <span className={styles.tag}>{service.tag}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button>{data.ctaButton}</button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}