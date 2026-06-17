'use client';

import styles from './ProgressBar.module.css';

type Step = 1 | 2 | 3 | 4 | 'summary';

interface ProgressBarProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
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

export default function ProgressBar({ currentStep, onStepClick }: ProgressBarProps) {
  const activeIndex = stepIndex(currentStep);

  return (
    <nav className={styles.container} dir="rtl" aria-label="שלבי המחשבון">
      {STEPS.map((step, i) => {
        const isActive = step.key === currentStep;
        const isDone   = i < activeIndex;
        const isClickable = !isActive && step.key !== 'summary' && onStepClick;

        const isSummaryClickable = step.key === 'summary' && !!onStepClick && !isActive;

        const circleClass = [
          styles.circle,
          isActive                          ? styles.circleActive    : '',
          isDone                            ? styles.circleDone      : '',
          (isClickable || isSummaryClickable) ? styles.circleClickable : '',
        ].join(' ');

        const labelClass = [
          styles.label,
          isActive                          ? styles.labelActive    : '',
          (isClickable || isSummaryClickable) ? styles.labelClickable : '',
        ].join(' ');

        const itemClass = [
          styles.stepItem,
          isActive                          ? styles.stepItemActive    : '',
          (isClickable || isSummaryClickable) ? styles.stepItemClickable : '',
        ].join(' ');

        return (
          <div key={step.key} style={{ display: 'contents' }}>
            <div
              className={itemClass}
              onClick={() => {
                if (isSummaryClickable) { onStepClick!(4); return; }
                if (isClickable) onStepClick!(step.key);
              }}
              role={(isClickable || isSummaryClickable) ? 'button' : undefined}
              tabIndex={(isClickable || isSummaryClickable) ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (isSummaryClickable) { onStepClick!(4); return; }
                  if (isClickable) onStepClick!(step.key);
                }
              }}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className={circleClass}>
                {typeof step.key === 'number' ? step.key : '✓'}
              </div>
              <span className={labelClass}>{step.label}</span>
            </div>

            {i < STEPS.length - 1 && (
              <div className={styles.connector} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
