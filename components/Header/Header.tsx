import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>

        {/* ימין - לוגו */}
        <div>
          <Image
            src="/logo.png"
            alt="logo"
            width={120}
            height={40}
          />
        </div>

        {/* שמאל - כל התוכן */}
        <div className={styles.left}>

          {/* תפריט */}
          <nav className={styles.nav}>

            <a href="#" className={styles.link}>
              <span className={styles.number}>01:</span>
              <span className={styles.text}>מה אנחנו עושים</span>
            </a>

            <a href="#" className={styles.link}>
              <span className={styles.number}>02:</span>
              <span className={styles.text}>מי אנחנו</span>
            </a>

            <a href="#" className={styles.link}>
              <span className={styles.number}>03:</span>
              <span className={styles.text}>מחשבון</span>
            </a>

            <a href="#" className={styles.link}>
              <span className={styles.number}>04:</span>
              <span className={styles.text}>בלוג</span>
            </a>

          </nav>

          {/* כפתור */}
          <button className={styles.button}>
            לפגישת ייעוץ
          </button>

        </div>

      </div>
    </header>
  );
}