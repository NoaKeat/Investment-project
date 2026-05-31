"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import data from "@/data/header.json";
import CalendlyButton from "@/components/CalendlyButton/CalendlyButton";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* לוגו */}
        <div className={styles.logo}>
          <Link href="/" aria-label="לעמוד הבית">
            <Image
              src="/images/logo.png"
              alt="logo"
              width={120}
              height={40}
              className={styles.logoImage}
            />
          </Link>
        </div>

        {/* המבורגר — מובייל בלבד */}
        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={isOpen}
          aria-label="תפריט"
          onClick={toggleMenu}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        {/* תפריט — דסקטופ */}
        <div className={styles.left}>
          <nav className={styles.nav}>
            {data.navItems.map((item) => (
              <a key={item.number} href={item.href} className={styles.link}>
                <span className={styles.number}>{item.number}:</span>
                <span className={styles.text}>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* כאן נשאר רק כפתור הצירוף לפגישות בדסקטופ */}
          <CalendlyButton className={styles.button} />
        </div>
      </div>

      {/* תפריט מובייל נפתח */}
      <div
        className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <nav className={styles.mobileNav}>
          {data.navItems.map((item) => (
            <a
              key={item.number}
              href={item.href}
              className={styles.link}
              onClick={closeMenu}
            >
              <span className={styles.number}>{item.number}:</span>
              <span className={styles.text}>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* החלפנו גם כאן לכפתור ה-Calendly שייסגר/יופיע במובייל */}
        <CalendlyButton className={styles.button} />
      </div>
    </header>
  );
}