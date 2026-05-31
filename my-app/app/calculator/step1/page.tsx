'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Step1Page.module.css';
import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import { useCalculatorStore } from '@/components/calculator/store/calculatorStore';
import { useCalculatorApi } from '@/components/calculator/hooks/useCalculatorApi';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import {
  PURCHASE_EXPENSE_OPTIONS,
  type ExpenseOptionId,
  type PurchaseExpense,
  type Step1Result,
} from '@/components/calculator/types/index';

// ─── Local state type (type can be null before the user selects) ───────────

interface LocalExpense {
  id: string;
  type: ExpenseOptionId | null;
  label: string;
  amount: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('he-IL');
}

function blankExpense(seed: string): LocalExpense {
  return { id: seed, type: null, label: '', amount: null };
}

// ─── Component ───────────────────────────────────────────────────────────

export default function Step1Page() {
  const hydrated = useLocalStorageSync();
  const router = useRouter();
  const { calcStep1, loading } = useCalculatorApi();

  const setStep1Result = useCalculatorStore((s) => s.setStep1Result);
  const setStep1Input  = useCalculatorStore((s) => s.setStep1Input);
  const savedInput     = useCalculatorStore((s) => s.step1Input);

  // ── form state ──────────────────────────────────────────────────────────
  const [propertyValue,        setPropertyValue]        = useState<number | null>(null);
  const [propertyValueDisplay, setPropertyValueDisplay] = useState('');
  const [propertyType,         setPropertyType]         = useState<'first_apartment' | 'second_apartment'>('first_apartment');
  const [expenses,             setExpenses]             = useState<LocalExpense[]>([
    blankExpense('exp-0'),
    blankExpense('exp-1'),
    blankExpense('exp-2'),
  ]);

  // ── server result state ─────────────────────────────────────────────────
  const [result,      setResult]      = useState<Step1Result | null>(null);
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
        setExpenses(
          savedInput.expenses.map((e) => ({
            id: e.id,
            type: e.type as ExpenseOptionId,
            label: e.label,
            amount: e.amount,
          }))
        );
      }
    }

    setInitialized(true);
  }, [hydrated, initialized, savedInput]);

  // ── auto-save draft to store ─────────────────────────────────────────────
  useEffect(() => {
    if (!propertyValue) return;
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
  }, [propertyValue, propertyType, expenses, setStep1Input]);

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
      if (res) setResult(res);
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
    if (expenses.length >= 6) return;
    setExpenses((prev) => [
      ...prev,
      { id: `exp-${Date.now()}`, type: null, label: '', amount: null },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpenseType = (id: string, typeId: ExpenseOptionId) => {
    const option = PURCHASE_EXPENSE_OPTIONS.find((o) => o.id === typeId);
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, type: typeId, label: option?.label ?? '' } : e
      )
    );
  };

  const updateExpenseAmount = (id: string, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const amount = digits ? parseInt(digits, 10) : null;
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, amount } : e)));
  };

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

  const selectedTypes = expenses.map((e) => e.type).filter(Boolean) as ExpenseOptionId[];
  const canProceed = Boolean(result && propertyValue);

  if (!hydrated) return null;

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <main className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <ProgressBar currentStep={1} />
        <div className={styles.headerActions}>
          <button className={styles.btnOutline}>
            שמור וחזור מאוחר יותר
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleNext}
            disabled={!canProceed}
          >
            המשך לשלב הבא ←
          </button>
        </div>
      </div>

      {/* ── Page title ── */}
      <div className={styles.pageTitle}>
        <h1 className={styles.mainTitle}>בואו נכיר את העסקה</h1>
        <p className={styles.mainSubtitle}>פרטי הנכס ועלויות רכישה</p>
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.layout}>

        {/* ──── Form column ──── */}
        <div className={styles.formColumn}>

          {/* Section 1: Property details */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>פרטי הנכס</h2>
            <div className={styles.propertyRow}>

              {/* Property value */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>שווי הנכס</label>
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

              {/* Property type toggle */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>סוג רכישה</label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${propertyType === 'first_apartment' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setPropertyType('first_apartment')}
                  >
                    🏠 דירה יחידה
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${propertyType === 'second_apartment' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setPropertyType('second_apartment')}
                  >
                    🏢 דירה להשקעה
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Purchase expenses */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>עלויות רכישה נוספות</h2>
            <p className={styles.sectionSubtitle}>
              הזינו את העלויות החד פעמיות הנלוות לרכישת הנכס
            </p>

            <div className={styles.expensesHeader}>
              <span>סוג הוצאה</span>
              <span>סכום (₪)</span>
              <span />
            </div>

            {expenses.map((expense) => {
              // Filter out already-selected types (each option only once)
              const availableOptions = PURCHASE_EXPENSE_OPTIONS.filter(
                (opt) => opt.id === expense.type || !selectedTypes.includes(opt.id)
              );

              return (
                <div className={styles.expenseRow} key={expense.id}>
                  <select
                    className={styles.select}
                    value={expense.type ?? ''}
                    onChange={(e) => updateExpenseType(expense.id, e.target.value as ExpenseOptionId)}
                  >
                    <option value="">בחר סוג הוצאה</option>
                    {availableOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <input
                    className={styles.expenseInput}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={
                      expense.amount !== null
                        ? expense.amount.toLocaleString('he-IL')
                        : ''
                    }
                    onChange={(e) => updateExpenseAmount(expense.id, e.target.value)}
                  />

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => removeExpense(expense.id)}
                    aria-label="מחק שורה"
                  >
                    🗑
                  </button>
                </div>
              );
            })}

            {expenses.length < 6 && (
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
        {/* ──── end form column ──── */}

        {/* ──── Summary column ──── */}
        <div className={styles.summaryColumn}>
          {!propertyValue ? (
            <EmptyState />
          ) : (
            <SummaryCard
              propertyValue={propertyValue}
              result={result}
              isLoading={loading}
            />
          )}
        </div>

      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className={styles.emptyCard}>
      <span className={styles.emptyIcon}>🏠</span>
      <h3 className={styles.emptyTitle}>עוד רגע הכל יסתדר כאן</h3>
      <p className={styles.emptyText}>
        כאן תוכלו לעקוב אחר התמונה המלאה של העסקה
      </p>
    </div>
  );
}

interface SummaryCardProps {
  propertyValue: number;
  result: Step1Result | null;
  isLoading: boolean;
}

function SummaryCard({ propertyValue, result, isLoading }: SummaryCardProps) {
  const shimmer = isLoading ? styles.shimmer : '';

  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryHeaderRow}>
        <h3 className={styles.summaryTitle}>🧮 סיכום רכישה</h3>
        <span className={styles.summarySubtitle}>הסיכום מתעדכן בזמן אמת</span>
      </div>

      {/* Property value */}
      <div className={styles.summaryRow}>
        <span className={styles.summaryRowLabel}>שווי הנכס</span>
        <span className={styles.summaryRowValue}>{formatNum(propertyValue)} ₪</span>
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
    </div>
  );
}
