import Image from "next/image";
import styles from "./PropertyShowcase.module.css";

export default function ProjectSection() {
    return (
        <section className={styles.section}>

            <div className={styles.container}>

                {/* טקסט */}
                <div className={styles.textWrapper}>
                    <span className={styles.small}>02 · פרויקט</span>

                    <h2 className={styles.title}>
                        <span className={styles.highlight}>
                            אובייקטיביות זה לא סתם סיסמה
                        </span>
                    </h2>

                    <p className={styles.desc}>
                        אז החלטנו להיות לא פשוט נדל"ן...
                    </p>
                </div>

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