import Image from "next/image";
import styles from "./Hero.module.css";
import data from "@/data/hero.json";
import Link from "next/link";

export default function Hero() {
  return (
    <section className={styles.hero}>

      <div className={styles["hero-image-wrapper"]}>
        <Image
          src={data.image}
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
          {data.title}
        </h1>

        <h2 className={styles["hero-subtitle"]}>
          {data.subtitle}
        </h2>

        <p className={styles["hero-text"]}>
          {data.description}
        </p>

        <Link
         href={`/meetings/${data.slug}`}
          className={styles["hero-button"]}
        >
          {data.ctaButton}
        </Link>

      </div>
    </section>
  );
}