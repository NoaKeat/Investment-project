import styles from "./PropertyShowcase.module.css";
import Image from "next/image";
import data from "@/data/property.json";

export default function PropertyShowcase() {
  return (
    <section className={styles.section}>

      <div className={styles.container}>

        {/* טקסט */}
        <div className={styles.textWrapper}>

          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>
              {data.sectionHeader.number}
            </span>
            <span className={styles.sectionTitle}>
              : {data.sectionHeader.title}
            </span>
          </div>

          <h2 className={styles.title}>
            {data.title}
          </h2>

          <p className={styles.desc}>
            {data.description}
            <br />
            <span className={styles.bold}>
              {data.boldText}
            </span>
          </p>

        </div>

        {/* קומפוזיציה */}
        <div className={styles.rightShapes}>

          <div className={styles.darkTriangle}></div>

          <svg className={styles.goldTriangle} viewBox="0 0 462 462">
            <path
              d="M0 461H461L0 0V461Z"
              stroke="url(#goldGradient)"
              fill="none"
            />
            <defs>
              <linearGradient id="goldGradient">
                <stop offset="0.36" stopColor="#E6B360" />
                <stop offset="0.54" stopColor="#FFFCC1" />
                <stop offset="0.71" stopColor="#E6B360" />
              </linearGradient>
            </defs>
          </svg>

          {/* 📸 התמונה עכשיו בפנים */}
          <div className={styles.imageOverlay}>
            <Image
              src={data.image}
              alt="building"
              fill
              sizes="(max-width: 768px) 60vw, 367px"
              className={styles.image}
              priority
            />
          </div>

        </div>

      </div>

    </section>
  );
}