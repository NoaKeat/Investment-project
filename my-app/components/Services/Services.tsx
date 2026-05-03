import Link from "next/link";
import styles from "./Services.module.css";
import data from "@/data/services.json";
import ServiceCard from "../ServiceCard/ServiceCard";

export default function ServicesSection() {
  return (
    <section className={styles.servicesSection}>

      {/* ✅ רקע */}
            <div className={styles.backgroundShape}>
        {/* SVG גדול */}
        <svg
          className={styles.shapeBig}
          viewBox="0 0 500 552"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M499.903 551.691H417.318C417.311 551.691 417.304 551.688 417.299 551.683L17.3693 154.08C17.3526 154.064 17.3241 154.075 17.3241 154.099V245.975C17.3241 245.982 17.3208 245.989 17.3151 245.994L0.0439343 261.14C0.0268207 261.155 0 261.143 0 261.12V29.3655C0 29.342 0.0291275 29.3308 0.0458095 29.3474L447.45 476.485C447.466 476.502 447.496 476.49 447.496 476.467V0.0494204C447.496 0.0256082 447.525 0.0139011 447.541 0.0310302L499.994 54.3473C499.998 54.3522 500.001 54.3588 500.001 54.3657L499.93 551.664C499.93 551.679 499.918 551.691 499.903 551.691Z" fill="#fff" />
          <path d="M421.376 415.432V0.0265138C421.376 0.00688295 421.355 -0.00591834 421.338 0.00278203L302.254 58.8786C302.245 58.8831 302.239 58.8923 302.239 58.9024V296.349C302.239 296.356 302.242 296.363 302.247 296.367L421.331 415.451C421.348 415.468 421.376 415.456 421.376 415.432Z" fill="#fff" opacity="0.6" />
        </svg>

        {/* SVG קטן */}
        <svg
          className={styles.shapeSmall}
          viewBox="0 0 339 339"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0.0264903 338.45H338.423C338.447 338.45 338.458 338.421 338.442 338.404L0.045213 0.00785953C0.0285333 -0.00882022 0 0.00299357 0 0.0265823V338.423C0 338.438 0.0118673 338.45 0.0264903 338.45Z" fill="#fff" opacity="0.4" />
        </svg>
      </div>

      {/* ✅ תוכן */}
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
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

    </section>
  );
}