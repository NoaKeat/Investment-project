import { PortableText } from "@portabletext/react";
import Header from "@/components/Header/Header";
import styles from "./ArticlePage.module.css";
import BlogSection from "@/components/BlogSection/BlogSection";
import ContactForm from "@/components/ContactForm/ContactForm";
import data from "@/data/articlePage.json";

export default function ArticlePage({ post, relatedPosts }: { post: any, relatedPosts: any[] }) {
  // בדיקה שהתמונה קיימת כדי למנוע שגיאות
  const imageUrl = post?.image || '';

  return (
    <>
      <Header />

      {/* ה-Hero Image (הרקע הגדול) */}
      <div
        className={styles.hero}
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* תוכן מתחת לתמונה */}
      <article className={styles.articleWrapper}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.contentBody}>
          <PortableText value={post.body} />
        </div>
      </article>
      {/* הסקשן של המאמרים הקשורים */}
      <section className={styles.relatedSectionWrapper}>
        <div className="container">
          <h2 className={styles.moreArticlesTitle}>
            {data.relatedTitle}
          </h2>
          <BlogSection
            limit={2}
            showHeader={false}
            showAllButton={false}
          />
        </div>
      </section>

      <ContactForm />
    </>
  );
}