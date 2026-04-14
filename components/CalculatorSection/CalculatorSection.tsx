import styles from "./CalculatorSection.module.css";

export default function CalculatorSection() {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>03</span>
                <span className={styles.sectionTitle}>: מחשבון  </span>
            </div>
            <div className={styles.container}>

                {/* כותרת */}
                <h2 className={styles.title}>
                    מחשבון הזהב לחישוב כדאיות נכסים
                </h2>

                {/* תיאור */}
                <p className={styles.description}>
                    זהו מחשבון המסייע לכם לבחון את כדאיות רכישת הנכס שבו אתם מעוניינים,
                    עקבו אחר ההוראות והזינו את הנתונים הנדרשים כדי לקבל תוצאה מדויקת.
                </p>

                <div className={styles.steps}>
                    <span className={styles.activeStep}>שלב 1 - רכישה</span>
                    <span className={styles.step}>שלב 2 - מימון ומשכנתא</span>
                    <span className={styles.step}>שלב 3 - אחזקה</span>
                    <span className={styles.step}>שלב 4 - סיכום</span>
                </div>

                {/* אזור תוכן */}
                <div className={styles.content}>

                    {/* צד שמאל */}


                    {/* צד ימין */}
                    <div className={styles.formBox}>

                        <h3 className={styles.formTitle}>שלב 1 - רכישה</h3>

                        <p className={styles.formText}>
                            בשלב זה ממלאים את פרטי הרכש כדי שנוכל להתחיל בחישוב.
                        </p>

                        <label className={styles.label}>* מחיר דירה</label>

                        <input
                            className={styles.input}
                            placeholder="הזן מספר"
                        />
                        <div className={styles.rowThree}>

                            <div>
                                <label className={styles.label}>*סוג העיסקה</label>
                                <select className={styles.input}>
                                    <option>בחר סוג</option>
                                </select>
                            </div>

                            <div>
                                <label className={styles.label}>*הוצאות נלוות</label>
                                <select className={styles.input}>
                                    <option>בחר הוצאה</option>
                                </select>
                            </div>

                            <div>
                                <label className={styles.label}>*סכום ההוצאה(שנתי)</label>
                                <input className={styles.input} placeholder="הזן מספר" />
                            </div>

                        </div>
                        <div className={styles.buttons}>
                            <button className={styles.backBtn}>חזרה לשלב הקודם</button>
                            <button className={styles.nextBtn}>המשך לשלב הבא</button>
                        </div>

                    </div>

                    <div className={styles.summaryBox}>
                        <h3>סיכום ביניים</h3>
                        <p>פה מופיעים הנתונים שהזנת ואלא שכבר חושבו</p>
                    </div>
                </div>
            </div>
        </section>
    );
}