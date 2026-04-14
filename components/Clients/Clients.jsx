import styles from "./Clients.module.css";

export default function Clients() {
    return (
        <section className={styles.section}>

            {/* כותרת */}
            <div className={styles.header}>
                <h2 className={styles.title}>עבדו איתנו</h2>
                <p className={styles.subtitle}>
                    פה יבוא משפט הסבר קצר
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