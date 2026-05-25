"use client";
import styles from "./InvestmentHero.module.css";
import Image from "next/image";
import data from "@/data/investment.json";

export default function InvestmentHero() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>

        <div className={styles.textWrapper}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.description}>{data.description}</p>
          <p className={styles.subText}>{data.lectureInfo}</p>
          <div className={styles.date}>{data.date}</div>

          <div className={styles.buttons}>
            <button
              className={styles.primaryBtn}
              onClick={() => {
                const el = document.getElementById(data.scrollTo);
                if (!el) return;

                const y =
                  el.getBoundingClientRect().top + window.scrollY - 0;

                window.scrollTo({
                  top: y,
                  behavior: "smooth",
                });
              }}
            >
              {data.registerButton}
            </button>

          </div>
        </div>

        <div className={styles.visualWrapper}>
          <div className={styles.goldSquare}></div>
          <div className={styles.darkSquare}></div>

          <div className={styles.imageWrapper}>
            <Image
              src={data.image}
              alt="investment course"
              fill
              className={styles.image}
            />
          </div>
        </div>

      </div>
    </section>
  );
}