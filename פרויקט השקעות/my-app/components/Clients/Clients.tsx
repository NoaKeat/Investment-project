"use client";

import { useEffect, useState } from "react";
import styles from "./Clients.module.css";

interface ClientsData {
  title: string;
  subtitle: string;
}

export default function Clients() {
  const [data, setData] = useState<ClientsData | null>(null);

  useEffect(() => {
    fetch("/clients.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return null;

  return (
    <section className={styles.section}>

      {/* כותרת */}
      <div className={styles.header}>
        <h2 className={styles.title}>{data.title}</h2>
        <p className={styles.subtitle}>
          {data.subtitle}
        </p>
      </div>

      {/* עיגולים */}
      <div className={styles.circlesContainer}>
        <div className={styles.topRow}>
          {[...Array(9)].map((_, i) => (
            <div key={"top-" + i} className={styles.circle}></div>
          ))}
        </div>

        <div className={styles.bottomRow}>
          {[...Array(9)].map((_, i) => (
            <div key={"bot-" + i} className={styles.circle}></div>
          ))}
        </div>
      </div>

    </section>
  );
}