import styles from "./InvestmentHero.module.css";
import Image from "next/image";

export default function PropertyShowcase() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* צד שמאל - טקסט */}
        <div className={styles.textWrapper}>
          <h2 className={styles.title}>
            איך מקבלים החלטות השקעה נכונות
          </h2>

          <p className={styles.description}>
            תחילת הדרך עבדתי בעבודות מזדמנות, ואז הגיע קרע ברצועה בכתף.
            פציעה שעצרה אותי פיזית, אבל בעיקר הכריחה אותי לעצור ולבחור מחדש.
            זו הייתה הנקודה שבה החלטתי להיכנס לעולם שתמיד משך אותי באמת.
          </p>

          <p className={styles.subText}>
            ההרצאה תתקיים אי”ה בזום בתאריך -
          </p>

          <div className={styles.date}>12.03</div>

          <div className={styles.buttons}>
            <button className={styles.primaryBtn}>להרשמה</button>
            <button className={styles.secondaryBtn}>
              לכל הקורסים שהיו
            </button>
          </div>
        </div>

        {/* צד ימין - תמונה וריבועים */}
        <div className={styles.visualWrapper}>
          <div className={styles.goldSquare}></div>
          <div className={styles.darkSquare}></div>

          <div className={styles.imageWrapper}>
            <Image
              src="/your-image.png"
              alt="property"
              fill
              className={styles.image}
            />
          </div>
        </div>

      </div>
    </section>
  );
}
