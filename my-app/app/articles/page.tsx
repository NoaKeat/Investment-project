import BlogSection from "@/components/BlogSection/BlogSection";
import Link from "next/link";
import styles from "@/components/BlogSection/BlogSection.module.css";

export default function AllArticlesPage() {
  return (
    <>

      <main style={{ marginTop: "100px" }}>

        {/* 🔥 כפתור חזרה יפה */}
        <div className={styles.backWrapper}>
          <Link href="/" className={styles.backButton}>
            <span className={styles.arrow}>←</span>
            חזרה לדף הבית
          </Link>
        </div>

        <BlogSection limit={100} showHeader={false} />

      </main>
    </>
  );
}