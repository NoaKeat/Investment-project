'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Step1Page.module.css';
import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import { useCalculatorStore } from '@/components/calculator/store/calculatorStore';
import { useCalculatorApi } from '@/components/calculator/hooks/useCalculatorApi';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import CalcIcon from '@/components/ui/CalcIcon';
import {
  type ExpenseOptionId,
  type PurchaseExpense,
  type Step1Result,
} from '@/components/calculator/types/index';

// ─── Local state type (type can be null before the user selects) ───────────

interface LocalExpense {
  id: string;
  type: ExpenseOptionId | null;
  label: string;
  amount: number | null; // תמיד ₪ (עבור עו"ד — מחושב מ-pct)
  pct?: number | null;   // רק עבור 'lawyer' — האחוז שהמשתמש הזין
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('he-IL');
}

// ─── Component ───────────────────────────────────────────────────────────

export default function Step1Page() {
  const hydrated = useLocalStorageSync();
  const router = useRouter();
  const { calcStep1, loading } = useCalculatorApi();

  const setStep1Result = useCalculatorStore((s) => s.setStep1Result);
  const setStep1Input = useCalculatorStore((s) => s.setStep1Input);
  const savedInput = useCalculatorStore((s) => s.step1Input);

  // ── form state ──────────────────────────────────────────────────────────
  const [propertyValue, setPropertyValue] = useState<number | null>(null);
  const [propertyValueDisplay, setPropertyValueDisplay] = useState('');
  const [propertyType, setPropertyType] = useState<'first_apartment' | 'second_apartment'>('first_apartment');
  const [expenses, setExpenses] = useState<LocalExpense[]>([
    { id: 'broker-fixed', type: 'broker', label: 'תיווך רכישה', amount: null, pct: 2 },
    { id: 'lawyer-fixed', type: 'lawyer', label: 'עורך דין קונה', amount: null },
    { id: 'advisor-fixed', type: 'mortgage_advisor', label: 'יועץ משכנתאות', amount: null },
  ]);

  // ── server result state ─────────────────────────────────────────────────
  const [result, setResult] = useState<Step1Result | null>(null);
  const [initialized, setInitialized] = useState(false);

  // ── restore from localStorage after hydration ───────────────────────────
  useEffect(() => {
    if (!hydrated || initialized) return;

    if (savedInput) {
      setPropertyValue(savedInput.propertyValue || null);
      if (savedInput.propertyValue) {
        setPropertyValueDisplay(formatNum(savedInput.propertyValue));
      }
      setPropertyType(savedInput.propertyType);
      if (savedInput.expenses.length > 0) {
        const savedBroker = savedInput.expenses.find((e) => e.type === 'broker');
        const savedLawyer = savedInput.expenses.find((e) => e.type === 'lawyer');
        const savedAdvisor = savedInput.expenses.find((e) => e.type === 'mortgage_advisor');
        const savedOthers = savedInput.expenses.filter(
          (e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor'
        );
        // שחזור אחוז התיווך מהסכום השמור (לא נשמר ישירות) — אחרת ברירת מחדל 2%
        const restoredBrokerPct =
          savedBroker?.amount && savedInput.propertyValue
            ? Math.round((savedBroker.amount / (savedInput.propertyValue * 1.18)) * 1000) / 10
            : 2;
        setExpenses([
          { id: savedBroker?.id ?? 'broker-fixed', type: 'broker', label: 'תיווך רכישה', amount: savedBroker?.amount ?? null, pct: restoredBrokerPct },
          { id: savedLawyer?.id ?? 'lawyer-fixed', type: 'lawyer', label: 'עורך דין קונה', amount: savedLawyer?.amount ?? null },
          { id: savedAdvisor?.id ?? 'advisor-fixed', type: 'mortgage_advisor', label: 'יועץ משכנתאות', amount: savedAdvisor?.amount ?? null },
          ...savedOthers.map((e) => ({ id: e.id, type: 'other' as ExpenseOptionId, label: e.label || 'אחר', amount: e.amount })),
        ]);
      }
    }

    setInitialized(true);
  }, [hydrated, initialized, savedInput]);

  // ── auto-save draft to store ─────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    setStep1Input({
      propertyValue: propertyValue ?? 0,
      propertyType,
      expenses: expenses
        .filter((e) => e.type !== null)
        .map((e) => ({
          id: e.id,
          type: e.type as string,
          label: e.label,
          amount: e.amount,
        })),
    });
  }, [propertyValue, propertyType, expenses, initialized, setStep1Input]);

  // ── calculation (debounce 600ms) ─────────────────────────────────────────
  useEffect(() => {
    if (!propertyValue) {
      setResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      const validExpenses: PurchaseExpense[] = expenses
        .filter((e): e is LocalExpense & { type: ExpenseOptionId; amount: number } =>
          e.type !== null && e.amount !== null && e.amount > 0
        )
        .map((e) => ({
          id: e.id,
          type: e.type,
          label: e.label,
          amount: e.amount,
        }));

      const res = await calcStep1({ propertyValue, propertyType, expenses: validExpenses });
      if (res) {
        setResult(res);
        setStep1Result(res);
      }
    }, 600);

    return () => clearTimeout(timer);
    // calcStep1 is stable — omitting from deps to avoid re-triggering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyValue, propertyType, expenses]);

  // ── handlers ─────────────────────────────────────────────────────────────

  const handlePropertyValueChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const num = digits ? parseInt(digits, 10) : null;
    setPropertyValue(num);
    setPropertyValueDisplay(num ? formatNum(num) : '');
  };

  const handlePropertyValueBlur = () => {
    if (propertyValue) setPropertyValueDisplay(formatNum(propertyValue));
  };

  const handlePropertyValueFocus = () => {
    // Show raw digits while editing to avoid re-parsing commas
    if (propertyValue) setPropertyValueDisplay(String(propertyValue));
  };

  const addExpense = () => {
    const otherCount = expenses.filter((e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor').length;
    if (otherCount >= 6) return;
    setExpenses((prev) => [
      ...prev,
      { id: `exp-${Date.now()}`, type: 'other' as ExpenseOptionId, label: 'אחר', amount: null },
    ]);
  };

  const updateExpenseLabel = (id: string, label: string) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, label } : e)));
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpenseAmount = (id: string, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const amount = digits ? parseInt(digits, 10) : null;
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, amount } : e)));
  };

  const updateBrokerPct = (id: string, raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const pct = cleaned ? parseFloat(cleaned) : null;
    const amount =
      pct !== null && propertyValue
        ? Math.round((pct / 100) * propertyValue * 1.18)
        : null;
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, pct: pct ?? null, amount } : e))
    );
  };

  // כשמשתמש משנה שווי הנכס — מעדכן סכום תיווך אוטומטית (כולל מע"מ)
  useEffect(() => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.type === 'broker' && e.pct != null) {
          return {
            ...e,
            amount: propertyValue ? Math.round((e.pct / 100) * propertyValue * 1.18) : null,
          };
        }
        return e;
      })
    );
  }, [propertyValue]);

  const handleNext = () => {
    if (!result || !propertyValue) return;
    setStep1Result(result);
    setStep1Input({
      propertyValue,
      propertyType,
      expenses: expenses
        .filter((e) => e.type !== null)
        .map((e) => ({
          id: e.id,
          type: e.type as string,
          label: e.label,
          amount: e.amount,
        })),
    });
    router.push('/calculator/step2');
  };

  // ── derived ──────────────────────────────────────────────────────────────

  const canProceed = Boolean(result && propertyValue);

  // ── step navigation ───────────────────────────────────────────────────────

  const handleStepClick = (step: 1 | 2 | 3 | 4 | 'summary') => {
    if (step === 1) router.push('/calculator/step1');
    if (step === 2) router.push('/calculator/step2');
    if (step === 3) router.push('/calculator/step3');
    if (step === 4) router.push('/calculator/step4');
    if (step === 'summary') router.push('/calculator/summary');
  };

  if (!hydrated) return null;

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <main className={styles.pageWrapper} dir="rtl">

      {/* ── Progress bar ── */}
      <ProgressBar currentStep={1} onStepClick={handleStepClick} />

      {/* ── Nav row: step icon + title + nav buttons ── */}
      <div className={styles.navRow}>

        {/* גוש ימני: אייקון וכותרת */}
        <div className={styles.navTitleGroup}>
          <div className={styles.stepIcon}>
            <svg
              width="100%"
              height="100%"
              viewBox="486 268 16 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ maxWidth: '24px', maxHeight: '24px' }}
            >
              <path d="M500.25 274.75H487.75V286C487.75 286.703 488.297 287.25 489 287.25H499C499.703 287.25 500.25 286.703 500.25 286V274.75ZM500.25 273.5V271C500.25 270.297 499.703 269.75 499 269.75H489C488.297 269.75 487.75 270.297 487.75 271V273.5H500.25ZM501.5 273.5V286C501.5 287.367 500.367 288.5 499 288.5H489C487.633 288.5 486.5 287.367 486.5 286V271C486.5 269.633 487.633 268.5 489 268.5H499C500.367 268.5 501.5 269.633 501.5 271V273.5ZM489.312 277.25C489.312 276.742 489.742 276.312 490.25 276.312C490.758 276.312 491.188 276.742 491.188 277.25C491.188 277.758 490.758 278.188 490.25 278.188C489.742 278.188 489.312 277.758 489.312 277.25ZM490.25 280.062C490.758 280.062 491.188 280.492 491.188 281C491.188 281.508 490.758 281.938 490.25 281.938C489.742 281.938 489.312 281.508 489.312 281C489.312 280.492 489.742 280.062 490.25 280.062ZM493.062 277.25C493.062 276.742 493.492 276.312 494 276.312C494.508 276.312 494.938 276.742 494.938 277.25C494.938 277.758 494.508 278.188 494 278.188C493.492 278.188 493.062 277.758 493.062 277.25ZM494 280.062C494.508 280.062 494.938 280.492 494.938 281C494.938 281.508 494.508 281.938 494 281.938C493.492 281.938 493.062 281.508 493.062 281C493.062 280.492 493.492 280.062 494 280.062ZM496.812 277.25C496.812 276.742 497.242 276.312 497.75 276.312C498.258 276.312 498.688 276.742 498.688 277.25C498.688 277.758 498.258 278.188 497.75 278.188C497.242 278.188 496.812 277.758 496.812 277.25ZM497.75 280.062C498.258 280.062 498.688 280.492 498.688 281C498.688 281.508 498.258 281.938 497.75 281.938C497.242 281.938 496.812 281.508 496.812 281C496.812 280.492 497.242 280.062 497.75 280.062ZM496.812 284.75C496.812 284.242 497.242 283.812 497.75 283.812C498.258 283.812 498.688 284.242 498.688 284.75C498.688 285.258 498.258 285.688 497.75 285.688C497.242 285.688 496.812 285.258 496.812 284.75ZM489.625 284.125H494.625C494.977 284.125 495.25 284.398 495.25 284.75C495.25 285.102 494.977 285.375 494.625 285.375H489.625C489.273 285.375 489 285.102 489 284.75C489 284.398 489.273 284.125 489.625 284.125Z" fill="#E6B360" />
            </svg>
          </div>
          <div className={styles.stepTitleBlock}>
            <h1 className={styles.stepTitle}>בואו נכיר את העסקה</h1>
            <span className={styles.stepSubtitle}>פרטי הנכס ועלויות רכישה</span>
          </div>
        </div>

        {/* גוש שמאלי: כפתורי ניווט ושמירה */}
        <div className={styles.navButtonsGroup}>
          <button className={styles.saveBtn}>
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
            propertyValue={propertyValue}
            result={result}
            isLoading={loading}
          />
        </div>

        {/* ──── Forms column ──── */}
        <div className={styles.formsColumn}>

          {/* Card 1: Property details */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>פרטי הנכס</h2>

            <div className={styles.fieldsRow}>

              {/* Property value — first in DOM = right in RTL */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>שווי הנכס</label>
                <div className={styles.inputWithSymbol}>
                  <span className={styles.currencySymbol}>₪</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="מהו שווי הנכס?"
                    value={propertyValueDisplay}
                    onChange={(e) => handlePropertyValueChange(e.target.value)}
                    onFocus={handlePropertyValueFocus}
                    onBlur={handlePropertyValueBlur}
                  />
                </div>
              </div>

              {/* Property type toggle — second in DOM = left in RTL */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>סוג רכישה</label>
                <div className={styles.propertyTypeToggle}>
                  <button
                    type="button"
                    className={`${styles.typeOption} ${propertyType === 'second_apartment' ? styles.typeOptionSelected : ''}`}
                    onClick={() => setPropertyType('second_apartment')}
                  >
                    דירה להשקעה 🏢
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeOption} ${propertyType === 'first_apartment' ? styles.typeOptionSelected : ''}`}
                    onClick={() => setPropertyType('first_apartment')}
                  >
                    דירה יחידה 🏠
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Purchase expenses */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>עלויות רכישה נוספות</h2>
            <p className={styles.cardSubtitle}>
              הזינו את העלויות החד פעמיות הנלוות לרכישת הנכס
            </p>

            <div className={styles.expensesBody}>

              {/* ROW 1: עורך דין */}
              {(() => {
                const lawyerRow = expenses.find((e) => e.type === 'lawyer');
                return lawyerRow ? (
                  <div className={styles.newExpenseRow}>
                    <div className={styles.halfLabel}>עורך דין</div>
                    <input
                      className={`${styles.expenseInput} ${styles.halfInput}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={lawyerRow.amount !== null ? lawyerRow.amount.toLocaleString('he-IL') : ''}
                      onChange={(e) => updateExpenseAmount(lawyerRow.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.trashIcon}
                      onClick={() => removeExpense(lawyerRow.id)}
                      aria-label="מחק עורך דין"
                    >
                      🗑
                    </button>
                  </div>
                ) : null;
              })()}

              {/* ROW 2: יועץ משכנתאות */}
              {(() => {
                const advisorRow = expenses.find((e) => e.type === 'mortgage_advisor');
                return advisorRow ? (
                  <div className={styles.newExpenseRow}>
                    <div className={styles.halfLabel}>יועץ משכנתאות</div>
                    <input
                      className={`${styles.expenseInput} ${styles.halfInput}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={advisorRow.amount !== null ? advisorRow.amount.toLocaleString('he-IL') : ''}
                      onChange={(e) => updateExpenseAmount(advisorRow.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.trashIcon}
                      onClick={() => removeExpense(advisorRow.id)}
                      aria-label="מחק יועץ משכנתאות"
                    >
                      🗑
                    </button>
                  </div>
                ) : null;
              })()}

              {/* ROW 3: תיווך */}
              {(() => {
                const brokerRow = expenses.find((e) => e.type === 'broker');
                return brokerRow ? (
                  <div className={styles.fixedExpenseSection}>
                    <div className={styles.newExpenseRow}>
                      <div className={styles.halfLabel}>תיווך %</div>
                      <input
                        className={`${styles.expenseInput} ${styles.halfInput}`}
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0"
                        value={brokerRow.pct ?? ''}
                        onChange={(e) => updateBrokerPct(brokerRow.id, e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.trashIcon}
                        onClick={() => removeExpense(brokerRow.id)}
                        aria-label="מחק תיווך"
                      >
                        🗑
                      </button>
                    </div>
                    {brokerRow.amount !== null && (
                      <p className={styles.vatHint}>= {formatNum(brokerRow.amount)} שח (כולל מע״מ 18%)</p>
                    )}
                  </div>
                ) : null;
              })()}

              {/* שורות אחר — דינמיות */}
              {expenses.filter((e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor').map((expense) => (
                <div className={styles.newExpenseRow} key={expense.id}>
                  <input
                    className={`${styles.expenseInput} ${styles.halfInput}`}
                    type="text"
                    placeholder="אחר"
                    value={expense.label}
                    onChange={(e) => updateExpenseLabel(expense.id, e.target.value)}
                  />
                  <input
                    className={`${styles.expenseInput} ${styles.halfInput}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={expense.amount !== null ? expense.amount.toLocaleString('he-IL') : ''}
                    onChange={(e) => updateExpenseAmount(expense.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.trashIcon}
                    onClick={() => removeExpense(expense.id)}
                    aria-label="מחק שורה"
                  >
                    🗑
                  </button>
                </div>
              ))}

            </div>

            {expenses.filter((e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor').length < 6 && (
              <button
                type="button"
                className={styles.addExpenseBtn}
                onClick={addExpense}
              >
                + הוספת הוצאה
              </button>
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
  propertyValue: number | null;
  result: Step1Result | null;
  isLoading: boolean;
}

function SummaryCard({ propertyValue, result, isLoading }: SummaryCardProps) {
  const shimmer = isLoading ? styles.shimmer : '';
  const pv = propertyValue ?? 0;

  return (
    <div className={styles.summaryCard}>

      {/* ── Header ── */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryTitleBlock}>
          <h3 className={styles.summaryTitle}>סיכום רכישה</h3>
          <span className={styles.summarySubtitle}>הסיכום מתעדכן בזמן אמת</span>
        </div>
        <div className={styles.summaryIcon}>
          <CalcIcon size={22} />
        </div>
      </div>

      {/* ── Content: empty or data ── */}
      {!propertyValue ? (
        <div className={styles.summaryEmpty}>
          <div className={styles.summaryEmptyTitle}>עוד רגע הכל יסתדר כאן</div>
          <div className={styles.summaryEmptyText}>
            כאן תוכלו לעקוב אחר התמונה המלאה של העסקה בזמן אמת, הסיכום יתעדכן אוטומטית לפי הנתונים שתזינו לאורך הדרך.
          </div>
        </div>
      ) : (
        <>
          {/* Property value */}
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>שווי הנכס</span>
            <span className={styles.summaryRowValue}>{formatNum(pv)} ₪</span>
          </div>

          {/* Purchase tax */}
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>מס רכישה (אוטומטי)</span>
            <span className={`${styles.summaryRowValue} ${shimmer}`}>
              {result ? `${formatNum(result.purchaseTaxAmount)} ₪` : '—'}
            </span>
          </div>
          <p className={styles.taxNote}>✓ חושב לפי שווי הנכס וסוג הרכישה</p>

          {/* Additional expenses breakdown */}
          {result && result.expenseBreakdown.length > 0 && (
            <>
              <hr className={styles.divider} />
              <div className={styles.summarySectionLabel}>עלויות נוספות</div>
              {result.expenseBreakdown.map((exp) => (
                <div className={styles.summaryRow} key={exp.id}>
                  <span className={styles.summaryRowLabel}>
                    {exp.label}
                    {exp.hasSurcharge && (
                      <span style={{ color: '#E6B360', fontSize: '12px' }}>
                        {' '}(כולל 10% בצ״מ)
                      </span>
                    )}
                  </span>
                  <span className={styles.summaryRowValue}>
                    {formatNum(exp.adjustedAmount)} ₪
                  </span>
                </div>
              ))}
            </>
          )}

          <hr className={styles.divider} />

          {/* Total */}
          <div className={styles.summaryTotalRow}>
            <span className={styles.summaryTotalLabel}>עלות רכישה כוללת</span>
            <span className={`${styles.summaryTotalValue} ${shimmer}`}>
              {result ? `${formatNum(result.totalCost)} ₪` : '—'}
            </span>
          </div>

          <div className={styles.summaryFooter}>
            📍 זו רק ההתחלה — בשלבים הבאים נחשב את המימון, ההכנסות והרווח הצפוי
          </div>
        </>
      )}

    </div>
  );
}
