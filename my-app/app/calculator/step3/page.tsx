'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Step3Page.module.css';
import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import { useCalculatorStore } from '@/components/calculator/store/calculatorStore';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import CalcIcon from '@/components/ui/CalcIcon';
import type {
  Step1Result,
  Step2Result,
  Step3Result,
} from '@/components/calculator/types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_TYPE_OPTIONS = [
  'ארנונה',
  'ועד בית',
  'תחזוקה שוטפת',
  'חברת ניהול',
  'ביטוח דירה',
  'שכ"ט רואה חשבון',
  'פחת',
  'אחר',
] as const;

// כל ההוצאות שנתיות בשקלים

interface LocalExpense {
  id: number;
  type: string;
  amount: number | null; // סכום שנתי בשקלים
}

// שורת הכנסה נוספת (מעבר לשכ"ד) — סכום שנתי בשקלים
interface LocalIncomeRow {
  id: number;
  label: string;
  amount: number | null;
}

const DEFAULT_EXPENSES: LocalExpense[] = [
  { id: 1, type: 'תחזוקה שוטפת', amount: null },
  { id: 2, type: 'חברת ניהול',   amount: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('he-IL');
}

function expenseToAnnual(exp: LocalExpense): number {
  return exp.amount && exp.amount > 0 ? exp.amount : 0;
}

function computeStep3(
  monthlyRent: number,
  expenses: LocalExpense[],
  monthlyMortgage: number,
  totalCost: number,
  additionalIncome: LocalIncomeRow[]
): Step3Result {
  const rentAnnual = monthlyRent * 12;
  const extraAnnual = additionalIncome.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const annualIncome = rentAnnual + extraAnnual;
  const annualExpenses = expenses.reduce((sum, e) => sum + expenseToAnnual(e), 0);
  const noiAnnual = annualIncome - annualExpenses; // הכנסה שנתית בניכוי כלל ההוצאות התפעוליות (NOI)
  const grossMonthlyCashFlow = noiAnnual / 12;
  const netMonthlyCashFlow = grossMonthlyCashFlow - monthlyMortgage;
  // תשואה ברוטו: שכ"ד שנתי ברוטו ÷ עלות הרכישה הכוללת
  const grossAnnualYield = totalCost > 0 ? (annualIncome / totalCost) * 100 : 0;
  // תשואה נטו: הכנסה שנתית בניכוי כלל ההוצאות השנתיות (ללא משכנתא) ÷ עלות הרכישה הכוללת
  const netAnnualYield = totalCost > 0 ? (noiAnnual / totalCost) * 100 : 0;
  return {
    adjustedMonthlyIncome: Math.round(monthlyRent),
    totalMonthlyExpenses: Math.round(annualExpenses / 12),
    totalAnnualExpenses: Math.round(annualExpenses),
    grossMonthlyCashFlow: Math.round(grossMonthlyCashFlow),
    netMonthlyCashFlow: Math.round(netMonthlyCashFlow),
    grossAnnualYield: Math.round(grossAnnualYield * 100) / 100,
    netAnnualYield: Math.round(netAnnualYield * 100) / 100,
  };
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function Step3Page() {
  const hydrated = useLocalStorageSync();
  const router = useRouter();

  // ── store ──────────────────────────────────────────────────────────────────
  const step1Result   = useCalculatorStore((s) => s.step1Result);
  const step1Input    = useCalculatorStore((s) => s.step1Input);
  const step2Result   = useCalculatorStore((s) => s.step2Result);
  const step2Input    = useCalculatorStore((s) => s.step2Input);
  const savedStep3    = useCalculatorStore((s) => s.step3Input);
  const setStep3Result = useCalculatorStore((s) => s.setStep3Result);
  const setStep3Input  = useCalculatorStore((s) => s.setStep3Input);

  // ── form state ─────────────────────────────────────────────────────────────
  const [monthlyRent, setMonthlyRent] = useState<number | null>(null);
  const [monthlyRentDisplay, setMonthlyRentDisplay] = useState('');
  const [annualRentIncrease, setAnnualRentIncrease] = useState(2.5);
  const [annualRentIncreaseDisplay, setAnnualRentIncreaseDisplay] = useState('2.5');
  const [expenses, setExpenses] = useState<LocalExpense[]>(DEFAULT_EXPENSES);
  const [initialized, setInitialized] = useState(false);

  // ── שחזור טופס מהסטור לאחר hydration ────────────────────────────────────
  useEffect(() => {
    if (!hydrated || initialized) return;
    if (savedStep3) {
      setMonthlyRent(savedStep3.monthlyRent);
      if (savedStep3.monthlyRent) setMonthlyRentDisplay(formatNum(savedStep3.monthlyRent));
      setAnnualRentIncrease(savedStep3.annualRentIncrease);
      setAnnualRentIncreaseDisplay(String(savedStep3.annualRentIncrease));
      if (savedStep3.expenses.length > 0) setExpenses(savedStep3.expenses);
    }
    setInitialized(true);
  }, [hydrated, initialized, savedStep3]);

  // ── sync חברת ניהול amount = monthlyRent (one month per year) ───────────
  useEffect(() => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.type === 'חברת ניהול' ? { ...e, amount: monthlyRent ?? null } : e
      )
    );
  }, [monthlyRent]);

  // ── שמירה אוטומטית לסטור בכל שינוי ─────────────────────────────────────
  useEffect(() => {
    if (!hydrated || !initialized) return;
    setStep3Input({ monthlyRent, annualRentIncrease, expenses, additionalIncome: [] });
  }, [monthlyRent, annualRentIncrease, expenses, hydrated, initialized, setStep3Input]);

  // ── accordion state ────────────────────────────────────────────────────────
  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(false);

  // ── derived values ────────────────────────────────────────────────────────
  const propertyValue   = step1Input?.propertyValue ?? 0;
  const totalCost       = step1Result?.totalCost ?? 0;
  const monthlyMortgage = step2Result?.monthlyPayment ?? 0;

  const result: Step3Result | null = monthlyRent
    ? computeStep3(monthlyRent, expenses, monthlyMortgage, totalCost, [])
    : null;

  const canProceed = Boolean(monthlyRent && monthlyRent > 0);

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleRentChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const num = digits ? parseInt(digits, 10) : null;
    setMonthlyRent(num);
    setMonthlyRentDisplay(num ? formatNum(num) : '');
  };

  const handleRentFocus = () => {
    if (monthlyRent) setMonthlyRentDisplay(String(monthlyRent));
  };

  const handleRentBlur = () => {
    if (monthlyRent) setMonthlyRentDisplay(formatNum(monthlyRent));
  };

  const handleAnnualIncreaseChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setAnnualRentIncreaseDisplay(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num)) setAnnualRentIncrease(num);
  };

  const updateExpense = useCallback(
    (id: number, field: keyof LocalExpense, value: string | number | null) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      );
    },
    []
  );

  const addExpense = () => {
    setExpenses((prev) => {
      const maxId = prev.reduce((m, e) => Math.max(m, e.id), 0);
      return [...prev, { id: maxId + 1, type: 'אחר', amount: null }];
    });
  };

  const removeExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleNext = () => {
    if (!result || !canProceed) return;
    setStep3Result(result);
    router.push('/calculator/step4');
  };

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
      <ProgressBar currentStep={3} onStepClick={handleStepClick} />

      {/* ── Nav row ── */}
      <div className={styles.navRow}>

        <div className={styles.navTitleGroup}>
          <div className={styles.stepIcon}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ maxWidth: '24px', maxHeight: '24px' }}
            >
              <path d="M2 20h2V10H2v10zm5 0h2V4H7v16zm5 0h2v-8h-2v8zm5 0h2v-5h-2v5z" fill="#E6B360" />
            </svg>
          </div>

          <div className={styles.stepTitleBlock}>
            <span className={styles.stepTitle}>בואו נחשב את התזרים של הנכס</span>
            <span className={styles.stepSubtitle}>הזינו הכנסות והוצאות לחישוב תזרים ורווחיות הנכס</span>
          </div>
        </div>

        <div className={styles.navButtonsGroup}>
          <button className={styles.saveBtn}>שמור וחזור מאוחר יותר 🔖</button>
          <button className={styles.nextBtn} onClick={handleNext} disabled={!canProceed}>
            המשך לשלב הבא←
          </button>
        </div>

      </div>

      {/* ── Content row ── */}
      <div className={styles.contentRow}>

        {/* ──── Summary column ──── */}
        <div className={styles.summaryColumn}>
          <SummaryPanel
            step1Result={step1Result}
            step1Input={step1Input}
            step2Result={step2Result}
            step2Input={step2Input}
            result={result}
            propertyValue={propertyValue}
            step1Open={step1Open}
            step2Open={step2Open}
            onToggleStep1={() => setStep1Open((v) => !v)}
            onToggleStep2={() => setStep2Open((v) => !v)}
          />
        </div>

        {/* ──── Forms column ──── */}
        <div className={styles.formsColumn}>

          {/* Card 1: Income */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>הכנסות</h2>

            <div className={styles.incomeFieldsRow}>

              {/* Monthly rent */}
              <div className={styles.incomeField}>
                <label className={styles.fieldLabel}>שכר דירה חודשי (₪)</label>
                <div className={styles.inputWithSymbol}>
                  <span className={styles.currencySymbol}>₪</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="לדוגמה: 6,500"
                    value={monthlyRentDisplay}
                    onChange={(e) => handleRentChange(e.target.value)}
                    onFocus={handleRentFocus}
                    onBlur={handleRentBlur}
                  />
                </div>
              </div>

              {/* Annual increase */}
              <div className={styles.incomeField}>
                <label className={styles.fieldLabel}>עליית שכ״ד שנתית (%)</label>
                <div className={styles.inputWithSymbol}>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="decimal"
                    placeholder="לדוגמה: 2.5"
                    value={annualRentIncreaseDisplay}
                    onChange={(e) => handleAnnualIncreaseChange(e.target.value)}
                  />
                  <span className={styles.percentSymbol}>%</span>
                </div>
                <span className={styles.fieldHint}>
                  שיעור הגידול השנתי הצפוי בשכ"ד (ממוצע היסטורי בישראל: 2–4%)
                </span>
              </div>

            </div>


          </div>

          {/* Card 2: Operating expenses */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>הוצאות תפעול שוטפות</h2>
            <p className={styles.cardSubtitle}>
              הזינו את העלויות הצפויות כחלק מהתפעול השוטף של הנכס
            </p>

            <div className={styles.expensesBody}>

              {/* תחזוקה שוטפת */}
              {(() => {
                const row = expenses.find((e) => e.type === 'תחזוקה שוטפת');
                return row ? (
                  <div className={styles.expenseRowNew}>
                    <div className={styles.expHalfLabel}>תחזוקה שוטפת</div>
                    <input
                      className={`${styles.inputSmall} ${styles.expHalfInput}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={row.amount !== null ? row.amount.toLocaleString('he-IL') : ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, '');
                        updateExpense(row.id, 'amount', digits === '' ? null : parseInt(digits, 10));
                      }}
                    />
                    <button className={styles.deleteBtn} onClick={() => removeExpense(row.id)} aria-label="מחק תחזוקה שוטפת">🗑</button>
                  </div>
                ) : null;
              })()}

              {/* חברת ניהול — auto-calc */}
              {(() => {
                const row = expenses.find((e) => e.type === 'חברת ניהול');
                return row ? (
                  <div className={styles.expenseSectionNew}>
                    <div className={styles.expenseRowNew}>
                      <div className={styles.expHalfLabel}>חברת ניהול</div>
                      <div className={`${styles.expHalfInput} ${styles.expReadOnly}`}>
                        {monthlyRent ? `${formatNum(monthlyRent)} ₪` : '—'}
                      </div>
                      <button className={styles.deleteBtn} onClick={() => removeExpense(row.id)} aria-label="מחק חברת ניהול">🗑</button>
                    </div>
                    <p className={styles.expHint}>שווה לשכירות חודשית אחת</p>
                  </div>
                ) : null;
              })()}

              {/* שורות אחר — דינמיות */}
              {expenses.filter((e) => e.type !== 'תחזוקה שוטפת' && e.type !== 'חברת ניהול').map((exp) => (
                <div key={exp.id} className={styles.expenseRowNew}>
                  <input
                    className={`${styles.inputSmall} ${styles.expHalfInput}`}
                    type="text"
                    placeholder="אחר"
                    value={exp.type}
                    onChange={(e) => updateExpense(exp.id, 'type', e.target.value)}
                  />
                  <input
                    className={`${styles.inputSmall} ${styles.expHalfInput}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={exp.amount !== null ? exp.amount.toLocaleString('he-IL') : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '');
                      updateExpense(exp.id, 'amount', digits === '' ? null : parseInt(digits, 10));
                    }}
                  />
                  <button className={styles.deleteBtn} onClick={() => removeExpense(exp.id)} aria-label="מחק הוצאה">🗑</button>
                </div>
              ))}

            </div>

            <button className={styles.addExpenseBtn} onClick={addExpense}>
              + הוספת הוצאה
            </button>

          </div>

        </div>
        {/* ──── end forms column ──── */}

      </div>
    </main>
  );
}

// ─── SummaryPanel ─────────────────────────────────────────────────────────────

interface Step1InputStore {
  propertyValue: number;
  propertyType: string;
  expenses: unknown[];
}

interface Step2InputStore {
  mortgageAmount: number;
  repaymentMethod: string;
  interestRate: number;
  loanTermYears: number;
  earlyRepaymentYears?: number;
}

interface SummaryPanelProps {
  step1Result: Step1Result | null;
  step1Input: Step1InputStore | null;
  step2Result: Step2Result | null;
  step2Input: Step2InputStore | null;
  result: Step3Result | null;
  propertyValue: number;
  step1Open: boolean;
  step2Open: boolean;
  onToggleStep1: () => void;
  onToggleStep2: () => void;
}

function SummaryPanel({
  step1Result,
  step1Input,
  step2Result,
  step2Input,
  result,
  propertyValue,
  step1Open,
  step2Open,
  onToggleStep1,
  onToggleStep2,
}: SummaryPanelProps) {

  const cashFlowPositive = result ? result.netMonthlyCashFlow >= 0 : null;

  const repaymentMethodLabel: Record<string, string> = {
    spitzer: 'שפיצר (אנונה)',
    full_balloon: 'בלון מלא',
    partial_balloon: 'בלון חלקי',
  };

  return (
    <div className={styles.summaryCard}>

      {/* Header */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryTitleBlock}>
          <h3 className={styles.summaryTitle}>סיכום רכישה</h3>
          <span className={styles.summarySubtitle}>הסיכום מתעדכן בזמן אמת</span>
        </div>
        <div className={styles.summaryIcon}><CalcIcon size={22} /></div>
      </div>

      {/* ── Accordion: Step 1 ── */}
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

      {/* ── Accordion: Step 2 ── */}
      <div className={styles.collapseRow}>
        <div
          className={styles.collapseRowInner}
          onClick={onToggleStep2}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleStep2(); }}
          aria-expanded={step2Open}
        >
          <span className={`${styles.collapseLabel} ${step2Open ? styles.collapseLabelOpen : ''}`}>
            סיכום המימון והמשכנתא
          </span>
          <span className={`${styles.collapseChevron} ${step2Open ? styles.open : ''}`}>▼</span>
        </div>

        {step2Open && step2Result && step2Input && (
          <div className={styles.collapseContent}>
            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>סכום משכנתא</span>
              <span className={styles.recapValue}>₪ {formatNum(step2Input.mortgageAmount)}</span>
            </div>
            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>ריבית שנתית</span>
              <span className={styles.recapValue}>{step2Input.interestRate}%</span>
            </div>
            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>תקופת הלוואה</span>
              <span className={styles.recapValue}>{step2Input.loanTermYears} שנים</span>
            </div>
            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>שיטת החזר</span>
              <span className={styles.recapValue}>
                {repaymentMethodLabel[step2Input.repaymentMethod] ?? step2Input.repaymentMethod}
              </span>
            </div>
            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>סך ריבית צפויה</span>
              <span className={styles.recapValue}>₪ {formatNum(Math.round(step2Result.totalInterest))}</span>
            </div>
            <div className={styles.recapTotal}>
              <span className={styles.recapTotalLabel}>החזר חודשי</span>
              <span className={styles.recapTotalValue}>₪ {formatNum(Math.round(step2Result.monthlyPayment))}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Live calculations (always visible) ── */}
      <div className={styles.liveSection}>

        {/* הכנסות */}
        <div className={styles.liveSectionTitle}>הכנסות</div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>שכר דירה שנתי</span>
          <span className={styles.dataValue}>
            {result ? `₪ ${formatNum(result.adjustedMonthlyIncome * 12)}` : '—'}
          </span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>סה״כ הכנסות שנתיות</span>
          <span className={`${styles.dataValue} ${styles.dataValueBold}`}>
            {result ? `₪ ${formatNum(result.adjustedMonthlyIncome * 12)}` : '—'}
          </span>
        </div>

        <hr className={styles.dividerThin} />

        {/* הוצאות תפעול */}
        <div className={styles.liveSectionTitle}>הוצאות תפעול</div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>סה״כ הוצאות תפעול שנתיות</span>
          <span className={styles.dataValue}>
            {result ? `₪ ${formatNum(result.totalAnnualExpenses)}` : '—'}
          </span>
        </div>

        <hr className={styles.dividerThin} />

        {/* NOI */}
        <div className={styles.liveSectionTitle}>NOI — רווח תפעולי</div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>NOI שנתי</span>
          <span className={`${styles.dataValue} ${styles.dataValueBold}`}>
            {result ? `₪ ${formatNum(result.grossMonthlyCashFlow * 12)}` : '—'}
          </span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>NOI חודשי</span>
          <span className={styles.dataValue}>
            {result ? `₪ ${formatNum(result.grossMonthlyCashFlow)}` : '—'}
          </span>
        </div>

        <hr className={styles.dividerThin} />

        {/* מימון */}
        <div className={styles.liveSectionTitle}>מימון</div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>החזר משכנתא חודשי</span>
          <span className={styles.dataValue} style={{ color: '#dc2626' }}>
            {step2Result ? `−₪ ${formatNum(Math.round(step2Result.monthlyPayment))}` : '—'}
          </span>
        </div>

        <hr className={styles.dividerThin} />

        {/* תזרים נטו */}
        <div className={styles.cashFlowRow}>
          <span className={styles.cashFlowLabel}>תזרים חודשי נטו</span>
          <span className={`${styles.cashFlowValue} ${result
            ? cashFlowPositive ? styles.cashFlowPositive : styles.cashFlowNegative
            : ''
          }`}>
            {result
              ? `${cashFlowPositive ? '+' : ''}${formatNum(result.netMonthlyCashFlow)} ₪ ${cashFlowPositive ? '✓' : '⚠️'}`
              : '—'}
          </span>
        </div>

      </div>

      {/* ── Yield section ── */}
      {result && (() => {
        const annualRent  = result.adjustedMonthlyIncome * 12;
        const annualExp   = result.totalAnnualExpenses;
        const totalCost   = step1Result?.totalCost ?? 0;
        return (
          <div className={styles.yieldSection}>
            <div className={styles.yieldSectionTitle}>נתוני תשואה</div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>תשואה ברוטו</span>
              <span className={styles.dataValue}>{result.grossAnnualYield.toFixed(2)}%</span>
            </div>
            <p className={styles.yieldHint}>
              שכ&quot;ד שנתי ÷ עלות רכישה כוללת × 100<br />
              = {formatNum(annualRent)} ₪ ÷ {formatNum(totalCost)} ₪ × 100
            </p>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>תשואה נטו</span>
              <span className={styles.dataValue}>{result.netAnnualYield.toFixed(2)}%</span>
            </div>
            <p className={styles.yieldHint}>
              (שכ&quot;ד שנתי − הוצאות תפעול שנתיות) ÷ עלות רכישה כוללת × 100<br />
              = ({formatNum(annualRent)} − {formatNum(annualExp)}) ₪ ÷ {formatNum(totalCost)} ₪ × 100
            </p>
          </div>
        );
      })()}

      {/* ── Tip box ── */}
      <div className={styles.tipBox}>
        <div className={styles.tipInner}>
          <div className={styles.tipTextBlock}>
            <div className={styles.tipTitle}>הנכס כבר ברור 📍</div>
            <div className={styles.tipText}>
              בשלב הבא נבחן את המכירה העתידית, מס השבח והרווח הצפוי בסיום העסקה.
            </div>
          </div>
          <span className={styles.tipIcon}>💡</span>
        </div>
      </div>

    </div>
  );
}
