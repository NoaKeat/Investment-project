import Image from "next/image";
import styles from "./Header.module.css";
import data from "@/data/header.json";

export default function Header() {
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>

        {/* לוגו */}
        <div>
          <Image
            src="/images/logo.png"
            alt="logo"
            width={120}
            height={40}
          />
        </div>

        {/* תפריט */}
        <div className={styles.left}>

          <nav className={styles.nav}>
            {data.navItems.map((item) => (
              <a key={item.number} href={item.href} className={styles.link}>
                <span className={styles.number}>{item.number}:</span>
                <span className={styles.text}>{item.label}</span>
              </a>
            ))}
          </nav>

          <button className={styles.button}>
            {data.ctaButton}
          </button>

        </div>

      </div>
    </header>
  );
}