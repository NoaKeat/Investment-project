"use client";
import styles from "./InvestmentHero.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";

interface InvestmentData {
  title: string;
  description: string;
  lectureInfo: string;
  date: string;
  registerButton: string;
  allCoursesButton: string;
  image: string;
}

export default function InvestmentHero() {
  const [data, setData] = useState<InvestmentData | null>(null);

  useEffect(() => {
    fetch("/investment.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textWrapper}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.description}>{data.description}</p>
          <p className={styles.subText}>{data.lectureInfo}</p>
          <div className={styles.date}>{data.date}</div>
          <div className={styles.buttons}>
            <button className={styles.primaryBtn}>{data.registerButton}</button>
            <button className={styles.secondaryBtn}>{data.allCoursesButton}</button>
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
