'use client';

import styles from './ProgressBar.module.css';

type Step = 1 | 2 | 3 | 4 | 'summary';

interface ProgressBarProps {
  currentStep: Step;
}

const STEPS: { key: Step; label: string }[] = [
  { key: 1,         label: 'פרטי הנכס ועלויות רכישה' },
  { key: 2,         label: 'מימון ומשכנתא'            },
  { key: 3,         label: 'הכנסות והוצאות'           },
  { key: 4,         label: 'מכירה עתידית'             },
  { key: 'summary', label: 'סיכום'                    },
];

function stepIndex(key: Step): number {
  return STEPS.findIndex((s) => s.key === key);
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const activeIndex = stepIndex(currentStep);

  return (
    <nav className={styles.container} aria-label="שלבי המחשבון">
      {STEPS.map((step, i) => {
        const isActive = step.key === currentStep;
        const isDone   = i < activeIndex;

        const circleClass = isActive
          ? `${styles.circle} ${styles.circleActive}`
          : isDone
            ? `${styles.circle} ${styles.circleDone}`
            : styles.circle;

        const labelClass = isActive
          ? `${styles.label} ${styles.labelActive}`
          : styles.label;

        return (
          <div key={step.key} style={{ display: 'contents' }}>
            <div className={styles.stepItem}>
              <div className={circleClass} aria-current={isActive ? 'step' : undefined}>
                {typeof step.key === 'number' ? step.key : '✓'}
              </div>
              <span className={labelClass}>{step.label}</span>
            </div>

            {/* dashed connector — rendered between every pair of steps */}
            {i < STEPS.length - 1 && (
              <div className={styles.connector} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
