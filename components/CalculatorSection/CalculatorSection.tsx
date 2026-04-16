import styles from "./CalculatorSection.module.css";

export default function CalculatorSection() {
    return (
        <section className={styles.section}>
            {/* שורה */}
            <div className={styles.wrapper}>
                <div className={styles.stepsWrapper}>
                    <span className={styles.activeStep}>שלב 1 - רכישה</span>
                    <span className={styles.step}>שלב 2 - מימון ומשכנתא</span>
                    <span className={styles.step}>שלב 3 - אחזקה</span>
                    <span className={styles.step}>שלב 4 - סיכום</span>
                </div>

                <div className={styles.content}>

                    {/* שמאל */}


                    {/* ימין */}
                    <div className={styles.formBox}>

                        <h2 className={styles.title}>שלב 1 - רכישה</h2>
                        <p className={styles.desc}>
                            בשלב זה ממלאים את פרטי הרכש כדי שנוכל להתחיל בחישוב.
                        </p>

                        {/* שורה 1 — מחיר דירה */}
                        <div className={`${styles.fieldWrapper} ${styles.price}`}>
                            <span className={styles.fieldLabel}>* מחיר דירה</span>
                            <input className={styles.input} placeholder="הזן מספר" />
                        </div>

                        {/* שורה 2 — סוג עסקה */}
                        <div className={`${styles.fieldWrapper} ${styles.type}`}>
                            <span className={styles.fieldLabel}>* סוג העסקה</span>

                            <div className={styles.selectWrapper}>
                                <select className={styles.input}>
                                    <option >בחר סוג עסקה</option>
                             
                                </select>
                            </div>
                        </div>

                        {/* שורה 2 — שני הכחולים */}
                        <div className={styles.blueGroup}>

                            <div className={styles.fieldInRow}>
                                <span className={styles.fieldLabel}>הוצאות נלוות</span>
                                <div className={styles.selectWrapper}>
                                    <select className={styles.input}>
                                        <option >בחר הוצאה</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.fieldInRow}>
                                <span className={styles.fieldLabel}>סכום ההוצאה (שנתי)</span>
                                <input className={styles.input} placeholder="הזן מספר" />
                            </div>

                            {/* אייקון */}
                            <div className={styles.checkIcon}>
                                <svg viewBox="0 0 28 28">
                                    <circle cx="14" cy="14" r="14" fill="white" />
                                    <path
                                        d="M12.2086 18C11.9937 18.0004 11.7808 17.9625 11.5823 17.8885C11.3837 17.8146 11.2033 17.7061 11.0514 17.5691L8 14.8219L8.77145 14.1267L11.8229 16.8745C11.9252 16.9666 12.0639 17.0183 12.2086 17.0183C12.3532 17.0183 12.492 16.9666 12.5943 16.8745L20.2286 10L21 10.6947L13.3657 17.5691C13.2139 17.7061 13.0335 17.8146 12.8349 17.8885C12.6363 17.9625 12.4235 18.0004 12.2086 18Z"
                                        fill="#1D1E44"
                                    />
                                </svg>
                            </div>

                        </div>

                        {/* סיכום */}
                        <div className={styles.summaryText}>
                            <span>סיכום הוצאות נלוות</span>
                            <p>עו״ד דני: 12,000 | ייעוץ משכנתא: 12,000</p>
                        </div>

                        {/* כפתורים */}
                        <div className={styles.actions}>
                            <button className={styles.filled}>חזרה לשלב הקודם</button>
                            <button className={styles.outline}>המשך לשלב הבא</button>
                        </div>

                    </div>
                    <div className={styles.summaryBox}>
                        <h3>סיכום ביניים</h3>
                        <p>פה מופיעים הנתונים שהזנת ואלו שכבר חושבו</p>
                        <span>אין נתונים</span>
                    </div>

                    {/* סיכום */}

                </div>

            </div>

        </section>
    );
}