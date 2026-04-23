"use client";
import styles from "./CalculatorSection.module.css";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  data: any;
  updateField: (key: string, value: string) => void;
};

export default function CalculatorSection2({
  onPrev,
  onNext,
  data,
  updateField,
}: Props) {
  return (
    <section className={styles.wrapper}>

      {/* שלבים */}
      <div className={styles.stepsWrapper}>
        <span className={styles.step}>שלב 1 - רכישה</span>
        <span className={styles.activeStep}>שלב 2 - מימון ומשכנתא</span>
        <span className={styles.step}>שלב 3 - אחזקה</span>
        <span className={styles.step}>שלב 4 - סיכום</span>
      </div>

      <div className={styles.content}>
        <div className={styles.formBox}>

          {/* כותרת */}
          <h2 className={styles.title}>שלב 2 - מימון ומשכנתא</h2>

          <p className={styles.desc}>
            בשלב זה ממלאים את פרטי המימון
          </p>

          {/* 🔥 שורה 1 */}
          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>מחיר דירה</span>
            <input className={styles.input} placeholder="הזן מספר" />
          </div>

          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>הון עצמי</span>
            <input className={styles.input} placeholder="הזן מספר" />
          </div>

          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>אחוז מימון</span>
            <input className={styles.input} placeholder="הזן מספר" />
          </div>

          {/* 🔥 טקסט ביניים */}
          <div className={styles.contentCenter } >
            מסלול משכנתא (אפשר להוסיף עד ארבעה מסלולים)
          </div>

          {/* 🔥 קופסה כחולה */}
          <div className={`${styles.blueGroup} ${styles.blueGroupStep2}`}>

            {/* אייקון */}
            <div className={styles.checkIcon}>
              <svg width="28" height="28">
                <circle cx="14" cy="14" r="14" fill="white" />
                <path
                  d="M12 18L8 14L9 13L12 16L20 10L21 11L12 18Z"
                  fill="#1D1E44"
                />
              </svg>
            </div>

            <div className={styles.fieldWrapper}>
              <span className={styles.fieldLabel}>ריבית</span>
              <input className={styles.input} placeholder="הזן מספר" />
            </div>

            <div className={styles.fieldWrapper}>
              <span className={styles.fieldLabel}>תקופה (שנים)</span>
              <input className={styles.input} placeholder="הזן מספר" />
            </div>

            <div className={styles.fieldWrapper}>
              <span className={styles.fieldLabel}>החזר חודשי</span>
              <input className={styles.input} placeholder="הזן מספר" />
            </div>

          </div>

          {/* 🔥 סיכום */}
          <div style={{ gridColumn: "1 / -1", color: "#ccc" }}>
            סכום משכנתא: 900,000 ₪
          </div>

          {/* 🔥 כפתורים */}
          <div className={styles.actions}>
            <button className={styles.outline} onClick={onPrev}>
              חזרה לשלב הקודם
            </button>
            <button className={styles.filled} onClick={onNext}>
              המשך לשלב הבא
            </button>


          </div>

        </div>

        {/* כפתורים */}



        {/* צד שמאל */}
        <div className={styles.summaryBox}>
          <h3>סיכום ביניים</h3>
          <p>הכנסה: {data.income || "-"}</p>
          <p>החזר: {data.monthly || "-"}</p>
        </div>

      </div>
    </section>
  );
}