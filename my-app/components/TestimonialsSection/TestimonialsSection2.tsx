"use client";

import { useState } from "react";
import styles from "./TestimonialsSection.module.css";
import data from "@/data/testimonials.json";

const testimonials = data.testimonials;

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const current = testimonials[index];

  return (
    <section className={styles.section}>
      
      {/* רקע */}
      <div className={styles.backgroundShape}>
        <svg className={styles.shapeBig} viewBox="0 0 500 552">
          <path d="M499.903 551.691H417.318L17.3693 154.08V245.975L0.0439343 261.14V29.3655L447.45 476.485V0.0494204L499.994 54.3473L499.93 551.664Z" fill="#fff"/>
          <path d="M421.376 415.432V0.0265138L302.254 58.8786V296.349L421.331 415.451Z" fill="#fff" opacity="0.6"/>
        </svg>

        <svg className={styles.shapeSmall} viewBox="0 0 339 339">
          <path d="M0.0264903 338.45H338.423L0.045213 0.00785953V338.423Z" fill="#fff" opacity="0.4"/>
        </svg>
      </div>

      <div className={styles.inner}>
        
        {/* כותרת */}
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>
            {data.title}
          </h3>
        </div>

        {/* קרוסלה */}
        <div className={styles.slider}>

          {/* חץ שמאל */}
          <button onClick={prev} className={styles.leftArrow}>
            <span className={styles.circle}></span>
            <svg viewBox="0 0 24 24">
              <path d="M13.7188 5.65804L14.4258 6.36504L9.14478 11.646C9.05078 11.741 8.99878 11.866 8.99878 12C8.99878 12.134 9.05078 12.259 9.14478 12.354L14.4258 17.635L13.7188 18.342L8.43778 13.061C8.15478 12.778 7.99878 12.401 7.99878 12C7.99878 11.599 8.15478 11.223 8.43778 10.939L13.7188 5.65804Z" fill="white"/>
            </svg>
          </button>

          {/* תוכן */}
          <div className={styles.content}>
            <h4 className={styles.name}>{current.name}</h4>
            <p className={styles.text}>{current.text}</p>
          </div>

          {/* חץ ימין */}
          <button onClick={next} className={styles.rightArrow}>
            <svg viewBox="0 0 24 24">
              <path d="M10.2812 18.342L9.57422 17.635L14.8552 12.354C14.9492 12.259 15.0012 12.134 15.0012 12C15.0012 11.866 14.9492 11.741 14.8552 11.646L9.57422 6.36496L10.2812 5.65796L15.5622 10.939C15.8452 11.222 16.0012 11.599 16.0012 12C16.0012 12.401 15.8452 12.777 15.5622 13.061L10.2812 18.342Z" fill="white"/>
            </svg>
          </button>

        </div>

        {/* נקודות */}
        <div className={styles.dots}>
          {testimonials.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${
                i === index ? styles.active : ""
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
