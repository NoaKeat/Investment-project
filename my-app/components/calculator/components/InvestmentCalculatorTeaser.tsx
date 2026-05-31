import styles from './InvestmentCalculatorTeaser.module.css';
import data from '@/data/investment.json';
import CalculatorIcon from './icons/CalculatorIcon';

const t = data.investmentCalculatorTeaser;

export default function InvestmentCalculatorTeaser() {
  return (
    <div className={styles.wrapper}>

      {/* ── כרטיס עם מסגרת זהובה ── */}
      <div className={styles.rectangle}>

        {/* "בקרוב" — watermark בתוך הכרטיס, position: absolute */}
        <span className={styles.comingSoonBadge} aria-hidden="true">
          {t.comingSoonBadge}
        </span>

        {/* ── תוכן פנימי — z-index: 1 מעל ה-watermark ── */}
        <div className={styles.frame80}>

          <h2 className={styles.heading}>
            <span className={styles.headingLight}>{t.headlineLight}</span>
            <span className={styles.headingBold}>{t.headlineBold}</span>
          </h2>

          <p className={styles.subtitle}>
            <strong>{t.subtitleLine1}</strong>
            <br />{t.subtitleLine2}
            <br />{t.subtitleLine3}
          </p>

          <button
            className={styles.ctaButton}
            disabled
            aria-disabled="true"
          >
            <div className={styles.iconCircle}>
              <CalculatorIcon />
            </div>
            <span className={styles.ctaText}>{t.ctaButtonText}</span>
          </button>

        </div>
      </div>

    </div>
  );
}
