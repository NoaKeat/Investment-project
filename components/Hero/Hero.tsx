import Image from "next/image";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>

      <div className={styles["hero-image-wrapper"]}>
        <Image
          src="/images/hero.jpg"
          alt="hero"
          fill
          priority
          className={styles["hero-image"]}
        />
      </div>

      <div className={styles["hero-overlay"]}></div>
      <div className={styles["hero-gradient"]}></div>

      <div className={styles["hero-content"]}>

        <h1 className={styles["hero-title"]}>
          נדל״ן הוא לא חלום.
        </h1>

        <h2 className={styles["hero-subtitle"]}>
          הוא מספרים.
        </h2>

        <p className={styles["hero-text"]}>
          ייעוץ השקעות אובייקטיבי למשקיעים שרוצים מספרים <br />
          ברורים ומציאות נקייה מאינטרסים.
        </p>

        <button className={styles["hero-button"]}>
          לקביעת פגישה לבדיקת עסקה
        </button>

      </div>
    </section>
  );
}