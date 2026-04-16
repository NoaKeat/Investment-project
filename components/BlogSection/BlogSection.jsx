import styles from "./BlogSection.module.css";

const posts = [
    {
        id: 1,
        image: "/images/blog-top-right.jpg",
        date: "16.05.26",
        title: "איך מקבלים החלטות השקעה נכונות",
        text: "תחילת הדרך עבדתי בעבודות מזדמנות, ואז הגיע קרע ברצועה בכתף. פציעה שעצרה אותי פיזית, אבל בעיקר הכריחה אותי לעצור ולבחור מחדש.",
    },
    {
        id: 2,
        image: "/images/blog-top-left.jpg",
        date: "16.05.26",
        title: "איך מקבלים החלטות השקעה נכונות",
        text: "תחילת הדרך עבדתי בעבודות מזדמנות, ואז הגיע קרע ברצועה בכתף. פציעה שעצרה אותי פיזית, אבל בעיקר הכריחה אותי לעצור ולבחור מחדש.",
    },
    {
        id: 3,
        image: "/images/blog-bottom-right.jpg",
        date: "16.05.26",
        title: "איך מקבלים החלטות השקעה נכונות",
        text: "תחילת הדרך עבדתי בעבודות מזדמנות, ואז הגיע קרע ברצועה בכתף. פציעה שעצרה אותי פיזית, אבל בעיקר הכריחה אותי לעצור ולבחור מחדש.",
    },
    {
        id: 4,
        image: "/images/blog-bottom-left.jpg",
        date: "16.05.26",
        title: "איך מקבלים החלטות השקעה נכונות",
        text: "תחילת הדרך עבדתי בעבודות מזדמנות, ואז הגיע קרע ברצועה בכתף. פציעה שעצרה אותי פיזית, אבל בעיקר הכריחה אותי לעצור ולבחור מחדש.",
    },
];

export default function BlogSection() {
    return (
        <section className={styles.section}>

            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerRight}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionNumber}>04</span>
                        <span className={styles.sectionTitle}>: בלוג</span>
                    </div>

                    <h2 className={styles.title}>מאחורי ההשקעות</h2>
                </div>
            </div>

            {/* GRID */}
            <div className={styles.grid}>
                {posts.map((post, index) => (
                    <article key={post.id} className={styles.card}>

                        {/* IMAGE */}
                        <div className={styles.imageWrapper}>
                            <div
                                className={styles.image}
                                style={{ backgroundImage: `url(${post.image})` }}
                            />

                            {/* badge רק לראשון */}
                            {index === 0 && (
                                <div className={styles.badge}>

                                    {/* אייקון */}
                                    <span className={styles.badgeIcon}>
                                        <svg viewBox="0 0 15 15">

                                            {/* מסגרת */}
                                            <path
                                                d="M7.5 14.5C6.2 13.4 1.5 9.2 1.5 6.3C1.5 3.3 4 1 7.5 1C11 1 13.5 3.3 13.5 6.3C13.5 9.2 8.8 13.4 7.5 14.5Z"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="1.2"
                                            />

                                            {/* נקודה למעלה באמצע */}
                                            <circle cx="7.5" cy="5.5" r="1.2" fill="white" />

                                        </svg>
                                    </span>

                                    חדש מהשבוע
                                </div>
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className={styles.content}>
                            <span className={styles.date}>{post.date}</span>

                            <h3 className={styles.cardTitle}>{post.title}</h3>

                            <p className={styles.text}>{post.text}</p>

                            <button className={styles.readMore}>
                                להמשך קריאה
                            </button>
                        </div>

                    </article>
                ))}
            </div>

        </section>
    );
}