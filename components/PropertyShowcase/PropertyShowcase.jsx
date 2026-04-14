import styles from "./PropertyShowcase.module.css";
import Image from "next/image";
export default function PropertyShowcase() {
    return (
        <section className={styles.section}>

            <div className={styles.container}>

                {/* טקסט */}
                <div className={styles.textWrapper}>

                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionNumber}>02</span>
                        <span className={styles.sectionTitle}>: מי אנחנו</span>
                    </div>

                    <h2 className={styles.title}>
                        אובייקטיביות זה לא סתם סיסמה
                    </h2>

                    <p className={styles.desc}>
                        אז ומתמיד הייתה לי תשוקה לנדל"ן, לא ממקום של "חלום", אלא השקעות עמוקות.
                        <br />
                        איך החלטה חכמה מייצרת ערך אמיתי לאורך זמן, ואיך מספרים פוגשים מציאות.
                        <br />
                        <br />
                        בתחילת הדרך עבדתי בעבודות מזדמנות, ואז הגיע רגע בצומת בחיי, פגישה שעצרה אותי פיזית –
                        <br />
                        אבל בעיקר הכריחה אותי לעצור ולבחור מחדש. זו הייתה הנקודה שבה החלטתי להיכנס לעולם שתמיד
                        <br />
                        משך אותי באמת.
                        <br />
                        <span className={styles.bold}>
                            בחרתי בעולם הנדל"ן.
                        </span>
                    </p>

                </div>

            </div>
            <div className={styles.imageOverlay}>
                <Image
                    src="/images/building.jpg"
                    alt="building"
                    fill
                    className={styles.image}
                />
            </div>
            {/* משולשים */}
            <div className={styles.rightShapes}>

                <div className={styles.darkTriangle}></div>

                <svg className={styles.goldTriangle} viewBox="0 0 462 462">
                    <path
                        d="M0 461H461L0 0V461Z"
                        stroke="url(#gold)"
                        fill="none"
                    />
                    <defs>
                        <linearGradient id="gold">
                            <stop offset="0.36" stopColor="#E6B360" />
                            <stop offset="0.54" stopColor="#FFFCC1" />
                            <stop offset="0.71" stopColor="#E6B360" />
                        </linearGradient>
                    </defs>
                </svg>

            </div>

        </section>
    );
}