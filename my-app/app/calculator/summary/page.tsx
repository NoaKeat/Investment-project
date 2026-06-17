'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SummaryPage.module.css';
import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import { useCalculatorStore } from '@/components/calculator/store/calculatorStore';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import DealSummary from '@/components/calculator/components/DealSummary';
import type { DealData } from '@/components/calculator/components/DealSummary';

// ─── Mortgage math (mirrors step4/page.tsx) ───────────────────────────────────

function calcRemainingBalance(
  mortgageAmount: number,
  annualRate: number,
  loanTermYears: number,
  repaymentMethod: string,
  holdingYears: number
): number {
  const effective = Math.min(holdingYears, loanTermYears);
  if (effective >= loanTermYears) return 0;
  const r = annualRate / 100 / 12;
  const n = loanTermYears * 12;
  const k = effective * 12;
  if (repaymentMethod === 'spitzer') {
    if (r === 0) return mortgageAmount * (n - k) / n;
    return mortgageAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, k)) / (Math.pow(1 + r, n) - 1);
  }
  if (repaymentMethod === 'partial_balloon') return mortgageAmount;
  return mortgageAmount * Math.pow(1 + r, k);
}

function calcInterestPaid(
  mortgageAmount: number,
  annualRate: number,
  loanTermYears: number,
  repaymentMethod: string,
  holdingYears: number,
  monthlyPayment: number
): number {
  const effective = Math.min(holdingYears, loanTermYears);
  const k = effective * 12;
  const remaining = calcRemainingBalance(mortgageAmount, annualRate, loanTermYears, repaymentMethod, holdingYears);
  if (repaymentMethod === 'spitzer') {
    const totalPaid = monthlyPayment * k;
    const principalPaid = mortgageAmount - remaining;
    return Math.max(0, totalPaid - principalPaid);
  }
  if (repaymentMethod === 'partial_balloon') {
    const r = annualRate / 100 / 12;
    return mortgageAmount * r * k;
  }
  return Math.max(0, remaining - mortgageAmount);
}

export default function SummaryPage() {
  const hydrated = useLocalStorageSync();
  const router   = useRouter();

  // חסימה: אם לא עברו דרך הפופאפ של שלב 4 → חוזרים לשלב 4
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('summary_gate_cleared') !== '1') {
      router.replace('/calculator/step4');
    }
  }, [router]);

  const step1Input  = useCalculatorStore((s) => s.step1Input);
  const step1Result = useCalculatorStore((s) => s.step1Result);
  const step2Input  = useCalculatorStore((s) => s.step2Input);
  const step2Result = useCalculatorStore((s) => s.step2Result);
  const step3Result = useCalculatorStore((s) => s.step3Result);
  const step4Input  = useCalculatorStore((s) => s.step4Input);

  const handleStepClick = (step: 1 | 2 | 3 | 4 | 'summary') => {
    if (step === 1) router.push('/calculator/step1');
    if (step === 2) router.push('/calculator/step2');
    if (step === 3) router.push('/calculator/step3');
    if (step === 4) router.push('/calculator/step4');
  };

  if (!hydrated) return null;
  if (typeof window !== 'undefined' && localStorage.getItem('summary_gate_cleared') !== '1') {
    return null; // מחכה ל-redirect
  }

  // ── Assemble dealData from store ──────────────────────────────────────────

  // Step 1
  const purchasePrice     = step1Input?.propertyValue ?? 0;
  const purchaseTax       = step1Result?.purchaseTaxAmount ?? 0;
  const additionalCosts   = step1Result?.totalExpenses ?? 0;
  const totalPurchaseCost = step1Result?.totalCost ?? 0;             // purchasePrice + purchaseTax + additionalCosts
  const buyingCosts       = totalPurchaseCost - purchasePrice;       // מס + עלויות נוספות בלבד

  // Step 2
  const mortgageAmount         = step2Input?.mortgageAmount ?? 0;
  const interestRate           = step2Input?.interestRate ?? 0;
  const loanPeriodYears        = step2Input?.loanTermYears ?? 20;
  const repaymentMethod        = step2Input?.repaymentMethod ?? 'spitzer';
  const monthlyMortgagePayment = step2Result?.monthlyPayment ?? 0;
  const equityInvested         = (step1Result?.totalCost ?? 0) - mortgageAmount;

  const holdingYears = step4Input?.holdingYears ?? loanPeriodYears;

  // Recalculate based on step 4 holding period (not the stale step2Result snapshot)
  const remainingMortgageAtSale = step2Input
    ? Math.round(calcRemainingBalance(mortgageAmount, interestRate, loanPeriodYears, repaymentMethod, holdingYears))
    : 0;
  const totalInterestPaid = step2Input
    ? Math.round(calcInterestPaid(mortgageAmount, interestRate, loanPeriodYears, repaymentMethod, holdingYears, monthlyMortgagePayment))
    : 0;

  // Step 3
  const monthlyRent     = step3Result?.adjustedMonthlyIncome ?? 0;
  const monthlyExpenses = step3Result?.totalMonthlyExpenses ?? 0;
  const monthlyNOI      = step3Result?.grossMonthlyCashFlow ?? (monthlyRent - monthlyExpenses);
  const grossYield      = step3Result?.grossAnnualYield ?? 0;
  const netYield        = step3Result?.netAnnualYield ?? 0;

  // Step 4
  const expectedSalePrice = step4Input?.autoCalculate
    ? Math.round(purchasePrice * Math.pow(1 + (step4Input?.annualAppreciation ?? 3) / 100, holdingYears))
    : (step4Input?.salePrice ?? purchasePrice);

  const annualAppreciation  = step4Input?.annualAppreciation ?? 3;
  const renovationCosts     = step4Input?.renovationCosts ?? 0;

  const capitalGain      = Math.max(0, expectedSalePrice - (step1Result?.totalCost ?? 0));
  const isSingleApt      = step1Input?.propertyType === 'first_apartment';
  const totalCostForGain = step1Result?.totalCost ?? 0;
  const totalGain        = expectedSalePrice - totalCostForGain - renovationCosts;

  const EXEMPT_THRESHOLD = 4_846_000;
  let capitalGainsTax: number;
  if (!step1Input) {
    capitalGainsTax = 0;
  } else if (totalGain <= 0) {
    capitalGainsTax = 0;
  } else if (isSingleApt && expectedSalePrice <= EXEMPT_THRESHOLD) {
    capitalGainsTax = 0;
  } else if (isSingleApt && expectedSalePrice > EXEMPT_THRESHOLD) {
    const exemptPortion = totalGain * (EXEMPT_THRESHOLD / expectedSalePrice);
    const taxablePortion = totalGain - exemptPortion;
    capitalGainsTax = Math.round(taxablePortion * 0.25);
  } else {
    capitalGainsTax = Math.round(totalGain * 0.25);
  }

  const capitalGainsTaxRate = isSingleApt ? 0 : 25;

  // עלויות מכירה = מס שבח + תיווך מכירה + שאר הוצאות מכירה (מהזנה בשלב 4)
  const hasMasShevach = step4Input?.saleExpenses
    ? step4Input.saleExpenses.some((r) => r.readOnly && r.type === 'מס שבח')
    : true;
  const brokerSaleRow = step4Input?.saleExpenses?.find((r) => r.type === 'תיווך' && r.unit === 'percent');
  const brokerSaleAmount = brokerSaleRow?.amount && expectedSalePrice > 0
    ? Math.round(expectedSalePrice * brokerSaleRow.amount / 100 * 1.18)
    : 0;
  const otherSaleExpenses = (step4Input?.saleExpenses ?? [])
    .filter((r) => !r.readOnly && r.unit !== 'percent')
    .reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const sellingCosts = (hasMasShevach ? capitalGainsTax : 0) + brokerSaleAmount + otherSaleExpenses;

  const dealData: DealData = {
    purchasePrice,
    totalPurchaseCost,
    buyingCosts,
    purchaseTax,
    additionalCosts,
    mortgageAmount,
    monthlyMortgagePayment,
    equityInvested,
    interestRate,
    totalInterestPaid,
    remainingMortgageAtSale,
    monthlyRent,
    monthlyExpenses,
    holdingPeriodYears: holdingYears,
    monthlyNOI,
    grossYield,
    netYield,
    expectedSalePrice,
    sellingCosts,
    capitalGainsTax,
    capitalGainsTaxRate,
    annualAppreciation,
    renovationCosts,
  };

  return (
    <main className={styles.pageWrapper} dir="rtl">
      <ProgressBar currentStep="summary" onStepClick={handleStepClick} />
      <DealSummary dealData={dealData} />
    </main>
  );
}
