import styles from "./ArticlesHeader.module.css";
import data from "@/data/articlesHeader.json";

export default function ArticlesHeader() {
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>
        {data.title}
      </h1>

      <p className={styles.subtitle}>
        {data.subtitle}
      </p>
    </section>
  );
}