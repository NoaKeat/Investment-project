import styles from "./ArticlePage.module.css";

export default function ArticlePageComponent({ article }: any) {
  return (
    <section className={styles.section}>

      {article.image && (
        <img src={article.image} className={styles.image} />
      )}

      <h1 className={styles.title}>{article.title}</h1>

      <h3 className={styles.subtitle}>{article.subtitle}</h3>

      <div className={styles.content}>
        {article.content?.map((block: any) => (
          <p key={block._key}>
            {block.children?.map((child: any) => child.text)}
          </p>
        ))}
      </div>

    </section>
  );
}