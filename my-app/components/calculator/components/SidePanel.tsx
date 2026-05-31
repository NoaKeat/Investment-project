'use client';

import { useCalculatorStore } from '../store/calculatorStore';

function formatCurrency(n: number): string {
  return n.toLocaleString('he-IL') + ' ₪';
}

function formatPercent(n: number): string {
  return n.toFixed(2) + '%';
}

export default function SidePanel() {
  const step1Result = useCalculatorStore((s) => s.step1Result);
  const step2Result = useCalculatorStore((s) => s.step2Result);
  const step3Result = useCalculatorStore((s) => s.step3Result);
  const step4Result = useCalculatorStore((s) => s.step4Result);

  const hasAny = step1Result ?? step2Result ?? step3Result ?? step4Result;
  if (!hasAny) return null;

  return (
    <aside
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '220px',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700 }}>
        סיכום ביניים
      </h3>

      {step1Result && (
        <section style={{ marginBottom: '12px' }}>
          <strong>שלב 1 — רכישה</strong>
          <p style={{ margin: '4px 0' }}>עלות כוללת: {formatCurrency(step1Result.totalCost)}</p>
          <p style={{ margin: '4px 0' }}>מס רכישה: {formatCurrency(step1Result.purchaseTaxAmount)}</p>
        </section>
      )}

      {step2Result && (
        <section style={{ marginBottom: '12px' }}>
          <strong>שלב 2 — מימון</strong>
          <p style={{ margin: '4px 0' }}>
            החזר חודשי: {formatCurrency(step2Result.monthlyPayment)}
          </p>
          <p style={{ margin: '4px 0' }}>
            סה"כ ריבית: {formatCurrency(step2Result.totalInterest)}
          </p>
        </section>
      )}

      {step3Result && (
        <section style={{ marginBottom: '12px' }}>
          <strong>שלב 3 — תשואה שוטפת</strong>
          <p style={{ margin: '4px 0' }}>
            תזרים נטו: {formatCurrency(step3Result.netMonthlyCashFlow)} / חודש
          </p>
          <p style={{ margin: '4px 0' }}>
            תשואה שנתית נטו: {formatPercent(step3Result.netAnnualYield)}
          </p>
        </section>
      )}

      {step4Result && (
        <section>
          <strong>שלב 4 — מכירה</strong>
          <p style={{ margin: '4px 0' }}>
            רווח נטו: {formatCurrency(step4Result.netProfit)}
          </p>
          <p style={{ margin: '4px 0' }}>
            ROI שנתי: {formatPercent(step4Result.annualROI)}
          </p>
        </section>
      )}
    </aside>
  );
}
