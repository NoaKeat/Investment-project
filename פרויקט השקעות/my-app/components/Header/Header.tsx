"use client";
import Image from "next/image";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";

interface NavItem {
  number: string;
  label: string;
  href: string;
}

interface HeaderData {
  navItems: NavItem[];
  ctaButton: string;
}

export default function Header() {
  const [data, setData] = useState<HeaderData | null>(null);

  useEffect(() => {
    fetch("/header.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return null;

  return (
    <header className={styles.header}>
      <div className={styles.container}>

        {/* ימין - לוגו */}
        <div>
          <Image
            src="/images/logo.png"
            alt="logo"
            width={120}
            height={40}
          />
        </div>

        {/* שמאל - כל התוכן */}
        <div className={styles.left}>

          {/* תפריט */}
          <nav className={styles.nav}>
            {data.navItems.map((item) => (
              <a key={item.number} href={item.href} className={styles.link}>
                <span className={styles.number}>{item.number}:</span>
                <span className={styles.text}>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* כפתור */}
          <button className={styles.button}>
            {data.ctaButton}
          </button>

        </div>

      </div>
    </header>
  );
}