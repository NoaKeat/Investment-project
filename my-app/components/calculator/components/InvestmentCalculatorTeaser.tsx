'use client';

import { useRouter } from 'next/navigation';
import styles from './InvestmentCalculatorTeaser.module.css';
import data from '@/data/investment.json';
import CalcIcon from '@/components/ui/CalcIcon';


const t = data.investmentCalculatorTeaser;

export default function InvestmentCalculatorTeaser() {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>

      {/* ── כרטיס עם מסגרת זהובה ── */}
      <div className={styles.rectangle}>

        {/* ── תוכן פנימי ── */}
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
            onClick={() => router.push('/calculator/step1')}
          >
            <div className={styles.iconCircle}>
              <CalcIcon size={24} color="#E5B260" />
            </div>
            <span className={styles.ctaText}>{t.ctaButtonText}</span>
          </button>

        </div>
      </div>

    </div>
  );
}
