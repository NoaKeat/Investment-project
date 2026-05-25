"use client";

import styles from "./CalculatorSection.module.css";

export default function CalculatorSection3({
  onPrev,
  onNext,
  data,
  updateField,
}: any) {
  return (
    <section className={styles.wrapper}>

      {/* שלבים */}
      <div className={styles.stepsWrapper}>
        <span className={styles.step}>שלב 1 - רכישה</span>
        <span className={styles.step}>שלב 2 - מימון ומשכנתא</span>
        <span className={styles.activeStep}>שלב 3 - אחזקה</span>
        <span className={styles.step}>שלב 4 - סיכום</span>
      </div>

      <div className={styles.content}>
        <div className={styles.formBox}>

          <h2 className={styles.title}>
            שלב 3 - אחזקה והכנסות
          </h2>

          <p className={styles.desc}>
            בשלב זה ממלאים את הפרטים כדי לבדוק את הרווחיות
          </p>

          {/* 🔥 שורה 1 */}
          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>דמי ניהול (₪)</span>
            <select
              className={styles.input}
              value={data.management || ""}
              onChange={(e) => updateField("management", e.target.value)}
            >
              <option value="">בחר</option>
              <option value="12">12</option>
              <option value="10">10</option>
            </select>
          </div>

          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>עליית ערך שנתית (%)</span>
            <input
              className={styles.input}
              value={data.annualIncrease || ""}
              onChange={(e) => updateField("annualIncrease", e.target.value)}
            />
          </div>

          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>שכירות חודשית צפויה</span>
            <input
              className={styles.input}
              value={data.rent || ""}
              onChange={(e) => updateField("rent", e.target.value)}
            />
          </div>

          {/* 🔥 שורה 2 */}
          <div className={styles.rowRight}>
            <div className={styles.fieldWrapper}>
              <span className={styles.fieldLabel}>אחוז חוסר תפוסה</span>
              <input
                className={styles.input}
                value={data.vacancy || ""}
                onChange={(e) => updateField("vacancy", e.target.value)}
              />
            </div>

            <div className={styles.fieldWrapper}>
              <span className={styles.fieldLabel}>עלות תחזוקה שנתית</span>
              <input
                className={styles.input}
                value={data.maintenance || ""}
                onChange={(e) => updateField("maintenance", e.target.value)}
              />
            </div>
          </div>

          {/* 🔥 שורה 3 */}
          <div className={styles.rowRight}>
            <div className={styles.fieldWrapper}>
              <span className={styles.fieldLabel}>מס על שכר דירה</span>
              <input
                className={styles.input}
                value={data.tax || ""}
                onChange={(e) => updateField("tax", e.target.value)}
              />
            </div>

            <div className={styles.fieldWrapper}>
              <span className={styles.fieldLabel}>צפי עליית ערך נכס</span>
              <select
                className={styles.input}
                value={data.appreciation || ""}
                onChange={(e) => updateField("appreciation", e.target.value)}
              >
                <option value="">בחר מסלול</option>
              </select>
            </div>
          </div>

          {/* כפתורים */}
          <div className={styles.actions}>
            <button className={styles.outline} onClick={onPrev}>
              חזרה לשלב הקודם
            </button>

            <button className={styles.filled} onClick={onNext}>
              המשך לשלב הבא
            </button>
          </div>

        </div>

        {/* צד שמאל */}
        <div className={styles.summaryBox}>
          <h3>סיכום ביניים</h3>
          <p>פה מופיעים הנתונים שהזנת ואלא שכבר חושבו</p>

          <p>שכירות: {data.rent || "-"}</p>
          <p>תחזוקה: {data.maintenance || "-"}</p>
          <p>מס: {data.tax || "-"}</p>
        </div>

      </div>
    </section>
  );
}