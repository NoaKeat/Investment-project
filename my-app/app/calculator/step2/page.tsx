'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Step2Page.module.css';
import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import { useCalculatorStore } from '@/components/calculator/store/calculatorStore';
import { useCalculatorApi } from '@/components/calculator/hooks/useCalculatorApi';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import CalcIcon from '@/components/ui/CalcIcon';
import { CalcIconSmall } from '@/components/ui/CalcIconSmall';
import type {
  RepaymentMethod,
  Step1Result,
  Step2Result,
} from '@/components/calculator/types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const REPAYMENT_METHODS: { id: RepaymentMethod; label: string; desc: string }[] = [
  {
    id: 'spitzer',
    label: 'שפיצר (אנונה)',
    desc: 'תשלום חודשי קבוע של קרן + ריבית. הפופולרי ביותר בישראל.',
  },
  {
    id: 'partial_balloon',
    label: 'בלון חלקי (ריבית בלבד)',
    desc: 'משלמים רק ריבית כל חודש. הקרן המלאה נפרעת בסוף התקופה.',
  },
  {
    id: 'full_balloon',
    label: 'בלון מלא',
    desc: 'ריבית דריבית — אין תשלומים שוטפים. כל הסכום נפרע בסוף התקופה.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('he-IL');
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function Step2Page() {
  const hydrated = useLocalStorageSync();
  const router = useRouter();
  const { calcStep2, loading } = useCalculatorApi();

  // ── store ──────────────────────────────────────────────────────────────────
  const step1Result = useCalculatorStore((s) => s.step1Result);
  const step1Input = useCalculatorStore((s) => s.step1Input);
  const savedStep2 = useCalculatorStore((s) => s.step2Input);
  const step4Input = useCalculatorStore((s) => s.step4Input);
  const setStep2Result = useCalculatorStore((s) => s.setStep2Result);
  const setStep2Input = useCalculatorStore((s) => s.setStep2Input);

  // ── form state ─────────────────────────────────────────────────────────────
  const [mortgageAmount, setMortgageAmount] = useState<number | null>(null);
  const [mortgageAmountDisplay, setMortgageAmountDisplay] = useState('');
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('spitzer');
  const [interestRate, setInterestRate] = useState<number | null>(null);
  const [interestRateDisplay, setInterestRateDisplay] = useState('');
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [loanTermDisplay, setLoanTermDisplay] = useState('30');
  const [earlyRepayment, setEarlyRepayment] = useState(false);
  const [earlyRepaymentYears, setEarlyRepaymentYears] = useState(25);
  const [earlyRepaymentDisplay, setEarlyRepaymentDisplay] = useState('');
  const earlyRepaymentDefaultSet = useRef(false);

  // ── result + UI state ──────────────────────────────────────────────────────
  const [result, setResult] = useState<Step2Result | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [step1Open, setStep1Open] = useState(false);

  // ── derived values ────────────────────────────────────────────────────────
  const propertyValue = step1Input?.propertyValue ?? 0;
  const totalCost = step1Result?.totalCost ?? 0;
  const propertyType = step1Input?.propertyType ?? 'first_apartment';
  const ltvThreshold = propertyType === 'second_apartment' ? 50 : 75;
  const ltvWarning = result ? result.financingRate > ltvThreshold : false;

  const mortgageAmountError: string | null =
    mortgageAmount !== null && mortgageAmount > 0 && totalCost > 0 && mortgageAmount > totalCost
      ? `סכום המשכנתא (${formatNum(mortgageAmount)} ₪) עולה על עלות הרכישה הכוללת (${formatNum(totalCost)} ₪)`
      : null;

  const isBalloon = repaymentMethod === 'partial_balloon' || repaymentMethod === 'full_balloon';
  const balloonWarning = isBalloon && loanTermYears > 5;

  const earlyRepaymentError: string | null =
    earlyRepayment && earlyRepaymentYears >= loanTermYears
      ? 'שנות הפירעון המוקדם חייבות להיות פחות מתקופת ההלוואה'
      : null;

  const canProceed = Boolean(
    result &&
    mortgageAmount &&
    interestRate !== null &&
    !mortgageAmountError &&
    !earlyRepaymentError
  );

  // ── restore form from store after hydration ───────────────────────────────
  useEffect(() => {
    if (!hydrated || initialized) return;

    if (savedStep2) {
      setMortgageAmount(savedStep2.mortgageAmount || null);
      if (savedStep2.mortgageAmount) {
        setMortgageAmountDisplay(formatNum(savedStep2.mortgageAmount));
      }
      setRepaymentMethod(savedStep2.repaymentMethod);
      setInterestRate(savedStep2.interestRate || null);
      if (savedStep2.interestRate) {
        setInterestRateDisplay(String(savedStep2.interestRate));
      }
      setLoanTermYears(savedStep2.loanTermYears);
      setLoanTermDisplay(String(savedStep2.loanTermYears));
      // Step 4 always overrides earlyRepaymentYears
      const syncedYears = step4Input?.holdingYears ?? savedStep2.earlyRepaymentYears;
      if (syncedYears) {
        setEarlyRepayment(true);
        setEarlyRepaymentYears(syncedYears);
        // תצוגה מעוגלת לספרה אחת (החודשים משלב 4 עשויים להניב שנים שבריות)
        setEarlyRepaymentDisplay(String(Math.round(syncedYears * 10) / 10));
        earlyRepaymentDefaultSet.current = true;
      }
    } else if (step4Input?.holdingYears) {
      setEarlyRepayment(true);
      setEarlyRepaymentYears(step4Input.holdingYears);
      setEarlyRepaymentDisplay(String(Math.round(step4Input.holdingYears * 10) / 10));
      earlyRepaymentDefaultSet.current = true;
    }

    setInitialized(true);
  }, [hydrated, initialized, savedStep2, step4Input]);

  // ── sync earlyRepaymentYears whenever step 4 holdingYears changes ─────────
  useEffect(() => {
    if (!initialized) return;
    const h = step4Input?.holdingYears;
    if (h == null) return;
    setEarlyRepayment(true);
    setEarlyRepaymentYears(h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step4Input?.holdingYears]);

  // ── auto-save draft to store ──────────────────────────────────────────────
  useEffect(() => {
    if (!mortgageAmount) return;
    setStep2Input({
      mortgageAmount,
      repaymentMethod,
      interestRate: interestRate ?? 0,
      loanTermYears,
      earlyRepaymentYears: earlyRepayment ? earlyRepaymentYears : undefined,
    });
  }, [
    mortgageAmount, repaymentMethod,
    interestRate, loanTermYears, earlyRepayment, earlyRepaymentYears,
    setStep2Input,
  ]);

  // ── calculation (debounce 600ms) ──────────────────────────────────────────
  useEffect(() => {
    if (!mortgageAmount || !interestRate || !propertyValue || !totalCost || mortgageAmountError) {
      setResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await calcStep2({
        propertyValue,
        totalCost,
        mortgageAmount,
        repaymentMethod,
        interestRate,
        loanTermYears,
        earlyRepaymentYears:
          earlyRepayment && !earlyRepaymentError ? earlyRepaymentYears : undefined,
      });
      if (res) setResult(res);
    }, 600);

    return () => clearTimeout(timer);
    // calcStep2 is stable — omitting from deps to avoid re-triggering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mortgageAmount, repaymentMethod,
    interestRate, loanTermYears, earlyRepayment, earlyRepaymentYears,
    propertyValue, totalCost, mortgageAmountError, earlyRepaymentError,
  ]);

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleMortgageAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const num = digits ? parseInt(digits, 10) : null;
    setMortgageAmount(num);
    setMortgageAmountDisplay(num ? formatNum(num) : '');
  };

  const handleMortgageAmountFocus = () => {
    if (mortgageAmount) setMortgageAmountDisplay(String(mortgageAmount));
  };

  const handleMortgageAmountBlur = () => {
    if (mortgageAmount) setMortgageAmountDisplay(formatNum(mortgageAmount));
  };

  const handleInterestRateChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setInterestRateDisplay(cleaned);
    const num = parseFloat(cleaned);
    setInterestRate(isNaN(num) ? null : num);
  };

  const handleLoanTermChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    setLoanTermDisplay(digits);
    const num = digits ? parseInt(digits, 10) : 0;
    if (num > 0) setLoanTermYears(num);
  };

  const handleRepaymentMethodChange = (method: RepaymentMethod) => {
    setRepaymentMethod(method);
    if (method === 'partial_balloon' || method === 'full_balloon') {
      setLoanTermYears(3);
      setLoanTermDisplay('3');
    }
  };

  const handleEarlyRepaymentToggle = (checked: boolean) => {
    setEarlyRepayment(checked);
  };

  const handleEarlyRepaymentYearsChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    setEarlyRepaymentDisplay(digits);
    const num = digits ? parseInt(digits, 10) : 0;
    if (num > 0) setEarlyRepaymentYears(num);
  };

  const handleNext = () => {
    if (!result || !canProceed) return;
    setStep2Result(result);
    router.push('/calculator/step3');
  };

  // ── step navigation ───────────────────────────────────────────────────────

  const handleStepClick = (step: 1 | 2 | 3 | 4 | 'summary') => {
    if (step === 1) router.push('/calculator/step1');
    if (step === 2) router.push('/calculator/step2');
    if (step === 3) router.push('/calculator/step3');
    if (step === 4) router.push('/calculator/step4');
    if (step === 'summary') router.push('/calculator/summary');
  };

  // ── guard ────────────────────────────────────────────────────────────────
  if (!hydrated) return null;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <main className={styles.pageWrapper}>

      {/* ── Progress bar ── */}
      <ProgressBar currentStep={2} onStepClick={handleStepClick} />

      {/* ── Nav row: step icon + title + nav buttons ── */}
      <div className={styles.navRow}>

        {/* צד ימין – אייקון + כותרת */}
        <div className={styles.navTitleGroup}>

          <div className={styles.stepIcon}>
            <svg
              width="100%"
              height="100%"
              viewBox="1255 164 22 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ maxWidth: '24px', maxHeight: '24px' }}
            >
              <path d="M1256.04 171.727C1255.88 171.18 1256.12 170.633 1256.59 170.32L1265.34 164.695C1265.73 164.422 1266.27 164.422 1266.66 164.695L1275.41 170.32C1275.88 170.633 1276.12 171.18 1275.96 171.727C1275.8 172.273 1275.3 172.625 1274.75 172.625H1273.5V180.125H1274.12C1274.48 180.125 1274.75 180.398 1274.75 180.75C1274.75 181.102 1274.48 181.375 1274.12 181.375H1257.88C1257.52 181.375 1257.25 181.102 1257.25 180.75C1257.25 180.398 1257.52 180.125 1257.88 180.125H1258.5V172.625H1257.25C1256.7 172.625 1256.2 172.273 1256.04 171.727ZM1259.75 180.125H1262.88V172.625H1259.75V180.125ZM1264.12 180.125H1267.88V172.625H1264.12V180.125ZM1267.99 171.375H1274.75L1266 165.75L1257.25 171.375H1264.01C1263.89 171.102 1263.81 170.789 1263.81 170.438C1263.81 169.227 1264.79 168.25 1266 168.25C1267.21 168.25 1268.19 169.227 1268.19 170.438C1268.19 170.789 1268.11 171.102 1267.99 171.375ZM1266 169.5C1265.49 169.5 1265.06 169.93 1265.06 170.438C1265.06 170.945 1265.49 171.375 1266 171.375C1266.51 171.375 1266.94 170.945 1266.94 170.438C1266.94 169.93 1266.51 169.5 1266 169.5ZM1269.12 180.125H1272.25V172.625H1269.12V180.125ZM1256.62 183.25H1275.38C1275.73 183.25 1276 183.523 1276 183.875C1276 184.227 1275.73 184.5 1275.38 184.5H1256.62C1256.27 184.5 1256 184.227 1256 183.875C1256 183.523 1256.27 183.25 1256.62 183.25Z" fill="#E6B360" />
            </svg>
          </div>

          <div className={styles.stepTitleBlock}>
            <span className={styles.stepTitle}>מימון ומשכנתא</span>
            <span className={styles.stepSubtitle}>
              פרטי הלוואת המשכנתא ותנאי המימון
            </span>
          </div>

        </div>

        {/* צד שמאל – כפתורים */}
        <div className={styles.navButtonsGroup}>

          <button
            className={styles.saveBtn}

          >
            שמור וחזור מאוחר יותר 🔖

          </button>

          <button
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={!canProceed}
          >
            המשך לשלב הבא←
          </button>

        </div>

      </div>

      {/* ── Content row: summary (right in RTL) + forms (left in RTL) ── */}
      <div className={styles.contentRow}>

        {/* ──── Summary column (first in DOM = right in RTL) ──── */}
        <div className={styles.summaryColumn}>
          <SummaryCard
            result={result}
            isLoading={loading}
            propertyValue={propertyValue}
            step1Result={step1Result}
            repaymentMethod={repaymentMethod}
            step1Open={step1Open}
            onToggleStep1={() => setStep1Open((v) => !v)}
            isEmpty={!mortgageAmount || !interestRate}
          />
        </div>

        {/* ──── Forms column ──── */}
        <div className={styles.formsColumn}>

          {/* Card 1: Mortgage details */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>פרטי המשכנתא</h2>

            <div className={styles.mortgageFieldsRow}>

              {/* Mortgage amount */}
              <div className={styles.mortgageField}>
                <label className={styles.fieldLabel}>סכום המשכנתא</label>
                <div
                  className={`${styles.inputWithSymbol} ${mortgageAmountError ? styles.hasError : ''}`}
                >
                  <span className={styles.currencySymbol}>₪</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={mortgageAmountDisplay}
                    onChange={(e) => handleMortgageAmountChange(e.target.value)}
                    onFocus={handleMortgageAmountFocus}
                    onBlur={handleMortgageAmountBlur}
                  />
                </div>
                {mortgageAmountError ? (
                  <p className={styles.errorMsg}>{mortgageAmountError}</p>
                ) : result && (
                  <div
                    className={`${styles.ltvChip} ${ltvWarning ? styles.ltvChipWarn : styles.ltvChipOk}`}
                  >
                    {ltvWarning ? '⚠' : '✓'} LTV: {result.financingRate.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Interest rate */}
              <div className={styles.mortgageField}>
                <label className={styles.fieldLabel}>ריבית שנתית</label>
                <div className={styles.inputWithSymbol}>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="decimal"
                    placeholder="3.5"
                    value={interestRateDisplay}
                    onChange={(e) => handleInterestRateChange(e.target.value)}
                  />
                  <span className={styles.percentSymbol}>%</span>
                </div>
                {isBalloon && (
                  <p className={styles.fieldHint}>
                    ריבית משכנתא בלון נעה בדרך כלל בין 5% ל-7% בהתאם לגוף המממן, יחס המימון ודירוג האשראי
                  </p>
                )}
              </div>

              {/* Loan term */}
              <div className={styles.mortgageField}>
                <label className={styles.fieldLabel}>תקופת הלוואה</label>
                <div className={styles.inputWithSymbol}>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="30"
                    value={loanTermDisplay}
                    onChange={(e) => handleLoanTermChange(e.target.value)}
                  />
                  <span className={styles.percentSymbol}>שנים</span>
                </div>
                {balloonWarning && (
                  <p className={styles.errorMsg}>משכנתא בלון היא עד 5 שנים</p>
                )}
              </div>

            </div>

            {/* LTV warning banner */}
            {ltvWarning && (
              <div className={styles.ltvWarning}>
                <span className={styles.ltvWarningIcon}>⚠️</span>
                <span>
                  שיעור המימון ({result?.financingRate.toFixed(1)}%) עולה על הרף המותר
                  ({ltvThreshold}%) עבור{' '}
                  {propertyType === 'second_apartment' ? 'דירה להשקעה' : 'דירה יחידה'}.
                  בנק ישראל מגביל את אחוז המימון לפי סוג הנכס.
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Repayment method */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>שיטת החזר</h2>
            <p className={styles.cardSubtitle}>בחרו כיצד תרצו לפרוע את ההלוואה</p>

            <div className={styles.methodCards}>
              {REPAYMENT_METHODS.map((method) => {
                const isActive = repaymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    className={`${styles.methodCard} ${isActive ? styles.methodCardSelected : ''}`}
                    onClick={() => handleRepaymentMethodChange(method.id)}
                    role="radio"
                    aria-checked={isActive}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleRepaymentMethodChange(method.id);
                    }}
                  >
                    <div className={styles.radioRow}>
                      <div
                        className={`${styles.radioIcon} ${isActive ? styles.radioIconSelected : ''
                          }`}
                      />
                    </div>

                    <div className={styles.methodCardTitle}>{method.label}</div>
                    <div className={styles.methodCardDesc}>{method.desc}</div>


                  </div>
                );
              })}
            </div>

            {/* Early repayment toggle */}
            <label className={styles.earlyToggle}>
              <input
                type="checkbox"
                checked={earlyRepayment}
                onChange={(e) => handleEarlyRepaymentToggle(e.target.checked)}
              />
              <span className={styles.earlyToggleLabel}>הוסף תחזית פירעון מוקדם</span>
            </label>

            {earlyRepayment && (
              <div style={{ marginTop: '6px', width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '213px' }}>
                  <label className={styles.fieldLabel}>פירעון לאחר שנים</label>
                  <div className={styles.inputWithSymbol}>
                    <input
                      className={styles.input}
                      type="text"
                      inputMode="numeric"
                      placeholder=""
                      value={earlyRepaymentDisplay}
                      onChange={(e) => handleEarlyRepaymentYearsChange(e.target.value)}
                    />
                    <span className={styles.percentSymbol}>שנים</span>
                  </div>
                  {earlyRepaymentError && (
                    <p className={styles.errorMsg}>{earlyRepaymentError}</p>
                  )}
                  {!earlyRepaymentError && step4Input?.holdingYears != null && earlyRepaymentYears === step4Input.holdingYears && (
                    <p className={styles.syncNote}>מסונכרן עם תקופת החזקה משלב 4</p>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
        {/* ──── end forms column ──── */}

      </div>
    </main>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

interface SummaryCardProps {
  result: Step2Result | null;
  isLoading: boolean;
  propertyValue: number;
  step1Result: Step1Result | null;
  repaymentMethod: RepaymentMethod;
  step1Open: boolean;
  onToggleStep1: () => void;
  isEmpty: boolean;
}

function SummaryCard({
  result,
  isLoading,
  propertyValue,
  step1Result,
  repaymentMethod,
  step1Open,
  onToggleStep1,
  isEmpty,
}: SummaryCardProps) {
  const shimmer = isLoading ? styles.shimmer : '';

  return (
    <div className={styles.summaryCard}>

      {/* ── Header ── */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryTitleBlock}>
          <h3 className={styles.summaryTitle}>סיכום מימון</h3>
          <span className={styles.summarySubtitle}>הסיכום מתעדכן בזמן אמת</span>
        </div>
        <div className={styles.summaryIcon}><CalcIcon size={22} /></div>
      </div>

      {/* ── Empty state ── */}
      {isEmpty ? (
        <div className={styles.summaryEmpty}>
          <div className={styles.summaryEmptyTitle}>מלאו את פרטי המשכנתא</div>
          <div className={styles.summaryEmptyText}>
            הכניסו סכום משכנתא וריבית — הסיכום יתעדכן בזמן אמת
          </div>
        </div>
      ) : (
        <>
          {/* ── Collapsible Step 1 recap ── */}
          <div className={styles.collapseRow}>
            <div
              className={styles.collapseRowInner}
              onClick={onToggleStep1}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleStep1(); }}
              aria-expanded={step1Open}
            >
              <span className={`${styles.collapseLabel} ${step1Open ? styles.collapseLabelOpen : ''}`}>
                סיכום פרטי הנכס ועלויות רכישה
              </span>
              <span className={`${styles.collapseChevron} ${step1Open ? styles.open : ''}`}>▼</span>
            </div>

            {step1Open && step1Result && (
              <div className={styles.collapseContent}>
                <div className={styles.recapRow}>
                  <span className={styles.recapLabel}>שווי הנכס</span>
                  <span className={styles.recapValue}>₪ {formatNum(propertyValue)}</span>
                </div>
                <div className={styles.recapRow}>
                  <span className={styles.recapLabel}>מס רכישה</span>
                  <span className={styles.recapValue}>₪ {formatNum(step1Result.purchaseTaxAmount)}</span>
                </div>
                <div className={styles.recapRow}>
                  <span className={styles.recapLabel}>עלויות נוספות</span>
                  <span className={styles.recapValue}>₪ {formatNum(step1Result.totalExpenses)}</span>
                </div>
                <div className={styles.recapTotal}>
                  <span className={styles.recapTotalLabel}>עלות רכישה כוללת</span>
                  <span className={styles.recapTotalValue}>₪ {formatNum(step1Result.totalCost)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Financing section ── */}
          <div className={styles.financingSection}>
            <div className={styles.financingSectionTitle}>נתוני המימון</div>
            <div className={styles.financingRows}>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>הון עצמי נדרש</span>
                <span className={`${styles.dataValue} ${shimmer}`}>
                  {result ? `₪ ${formatNum(result.requiredEquity)}` : '—'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>סך ריבית צפויה</span>
                <span className={`${styles.dataValue} ${shimmer}`}>
                  {result ? `₪ ${formatNum(Math.round(result.totalInterest))}` : '—'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>סך החזר לבנק</span>
                <span className={`${styles.dataValue} ${shimmer}`}>
                  {result ? `₪ ${formatNum(Math.round(result.totalPayments))}` : '—'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>יחס מימון</span>
                <span className={`${styles.dataValue} ${shimmer}`}>
                  {result ? `${result.financingRate.toFixed(1)}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Monthly payment ── */}
          <div className={styles.monthlyRow}>
            <span className={styles.monthlyLabel}>החזר חודשי</span>
            <span className={`${styles.monthlyValue} ${shimmer}`}>
              {result
                ? repaymentMethod === 'full_balloon'
                  ? `₪ ${formatNum(Math.round(result.balloonPayment ?? result.totalPayments))}`
                  : `₪ ${formatNum(Math.round(result.monthlyPayment))}`
                : '—'}
            </span>
          </div>

          {/* ── Tip box ── */}
          <div className={styles.tipBox}>
            <div className={styles.tipInner}>
              <div className={styles.tipTextBlock}>
                <div className={styles.tipTitle}>תמונת המימון מתחילה להתבהר</div>
                <div className={styles.tipText}>
                  בשלבים הבאים נבחן את ההכנסות מהנכס ואת הרווחיות הכוללת
                </div>
              </div>
              <span className={styles.tipIcon}>💡</span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
