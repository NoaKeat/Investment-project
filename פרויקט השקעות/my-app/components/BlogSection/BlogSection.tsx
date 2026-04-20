export const runtime = "nodejs";

import styles from "./BlogSection.module.css";
import { client } from "@/lib/sanity";
import Link from "next/link";
import ui from "@/data/blog.json";

type Article = {
  _id: string;
  title: string;
  subtitle?: string;
  image?: string;
  slug?: {
    current: string;
  };
  _updatedAt: string;
};

type Props = {
  limit?: number;
  showHeader?: boolean;
};

export default async function BlogSection({
  limit = 4,
  showHeader = true,
}: Props) {

  const posts: Article[] = await client.fetch(`
    *[_type == "article"] | order(_updatedAt desc)[0...${limit + 1}]{
      _id,
      title,
      subtitle,
      "image": image.asset->url,
      slug,
      _updatedAt
    }
  `);

  const hasMore = posts.length > limit;
  const visiblePosts = posts.slice(0, limit);

  const isNew = (date: string) => {
    const articleDate = new Date(date);
    const now = new Date();
    const diffInDays =
      (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24);

    return diffInDays <= 7;
  };

  return (
    <section className={styles.section}>

      {/* HEADER */}
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.headerRight}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>
                {ui.sectionNumber}
              </span>
              <span className={styles.sectionTitle}>
                : {ui.sectionTitle}
              </span>
            </div>

            <h2 className={styles.title}>
              {ui.mainTitle}
            </h2>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className={styles.grid}>
        {visiblePosts.map((post) => (
          <article key={post._id} className={styles.card}>

            {/* IMAGE */}
            <div className={styles.imageWrapper}>
              <div
                className={styles.image}
                style={{ backgroundImage: `url(${post.image || ""})` }}
              />

              {isNew(post._updatedAt) && (
                <div className={styles.badge}>
                  <span className={styles.badgeIcon}>
                    <svg viewBox="0 0 15 15">
                      <path
                        d="M7.5 14.5C6.2 13.4 1.5 9.2 1.5 6.3C1.5 3.3 4 1 7.5 1C11 1 13.5 3.3 13.5 6.3C13.5 9.2 8.8 13.4 7.5 14.5Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.2"
                      />
                      <circle cx="7.5" cy="5.5" r="1.2" fill="white" />
                    </svg>
                  </span>

                  {ui.badge}
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className={styles.content}>
              <span className={styles.date}>
                {new Date(post._updatedAt).toLocaleDateString()}
              </span>

              <h3 className={styles.cardTitle}>
                {post.title}
              </h3>

              <p className={styles.text}>
                {post.subtitle}
              </p>

              {post.slug?.current && (
                <Link
                  href={`/article/${post.slug.current}`}
                  className={styles.readMore}
                >
                  {ui.readMore}
                </Link>
              )}
            </div>

          </article>
        ))}
      </div>

      {/* כפתור תחתון */}
      {hasMore && (
        <div className={styles.allArticlesWrapper}>
          <Link href="/articles" className={styles.allArticlesButton}>
            {ui.allArticles}
          </Link>
        </div>
      )}

    </section>
  );
}