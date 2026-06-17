'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Step4Page.module.css';
import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import { useCalculatorStore } from '@/components/calculator/store/calculatorStore';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import CalcIcon from '@/components/ui/CalcIcon';
import type { Step1Result, Step2Result, Step3Result } from '@/components/calculator/types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OtherExpenseRow {
  id: number;
  label: string;
  amount: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('he-IL');
}

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
  // full_balloon
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
  // full_balloon — no regular interest payments, accrued interest counted at balloon
  return Math.max(0, remaining - mortgageAmount);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Step4Page() {
  const hydrated = useLocalStorageSync();
  const router   = useRouter();

  // ── store reads ───────────────────────────────────────────────────────────
  const step1Result    = useCalculatorStore((s) => s.step1Result);
  const step1Input     = useCalculatorStore((s) => s.step1Input);
  const step2Result    = useCalculatorStore((s) => s.step2Result);
  const step2Input     = useCalculatorStore((s) => s.step2Input);
  const step3Result    = useCalculatorStore((s) => s.step3Result);
  const savedStep4     = useCalculatorStore((s) => s.step4Input);
  const setStep4Result = useCalculatorStore((s) => s.setStep4Result);
  const setStep4Input  = useCalculatorStore((s) => s.setStep4Input);

  // ── derived from previous steps ───────────────────────────────────────────
  const propertyValue    = step1Input?.propertyValue     ?? 0;
  const totalCost        = step1Result?.totalCost        ?? 0;
  const purchaseTax      = step1Result?.purchaseTaxAmount ?? 0;
  const mortgageAmount   = step2Input?.mortgageAmount    ?? 0;
  const annualRate       = step2Input?.interestRate      ?? 0;
  const loanTermYears    = step2Input?.loanTermYears     ?? 20;
  const repaymentMethod  = step2Input?.repaymentMethod   ?? 'spitzer';
  const monthlyPayment   = step2Result?.monthlyPayment   ?? 0;
  const isSingleApt      = step1Input?.propertyType === 'first_apartment';

  const maxHoldingMonths     = loanTermYears * 12; // תקרת תקופת ההחזקה = תקופת המשכנתא בחודשים
  const defaultHoldingMonths = Math.round((step2Input?.earlyRepaymentYears ?? loanTermYears) * 12);

  // ── form state (קלט בחודשים) ────────────────────────────────────────────────
  const [holdingMonths,          setHoldingMonths]          = useState(defaultHoldingMonths);
  const [holdingMonthsDisplay,   setHoldingMonthsDisplay]   = useState(String(defaultHoldingMonths));
  const [salePrice,              setSalePrice]              = useState<number | null>(null);
  const [salePriceDisplay,       setSalePriceDisplay]       = useState('');
  const [autoCalculate,          setAutoCalculate]          = useState(false);
  const [annualAppreciation,     setAnnualAppreciation]     = useState(3);
  const [appreciationDisplay,    setAppreciationDisplay]    = useState('3');
  const [renovationCosts,        setRenovationCosts]        = useState<number | null>(null);
  const [renovationCostsDisplay, setRenovationCostsDisplay] = useState('');
  const [hasMasShevach,          setHasMasShevach]          = useState(true);
  const [hasBroker,              setHasBroker]              = useState(true);
  const [brokerPct,              setBrokerPct]              = useState(2);
  const [brokerPctDisplay,       setBrokerPctDisplay]       = useState('2');
  const [otherExpenses,          setOtherExpenses]          = useState<OtherExpenseRow[]>([]);
  const [initialized,            setInitialized]            = useState(false);

  // תקופת ההחזקה בשנים (שברית) — נגזרת מהחודשים, משמשת לכל החישובים ולשמירה בסטור
  const holdingYears = holdingMonths / 12;

  // ── שחזור טופס מהסטור לאחר hydration ────────────────────────────────────
  useEffect(() => {
    if (!hydrated || initialized) return;
    if (savedStep4) {
      const savedMonths = Math.round((savedStep4.holdingYears ?? 0) * 12);
      setHoldingMonths(savedMonths);
      setHoldingMonthsDisplay(String(savedMonths));
      setSalePrice(savedStep4.salePrice);
      if (savedStep4.salePrice) setSalePriceDisplay(fmt(savedStep4.salePrice));
      setAutoCalculate(savedStep4.autoCalculate);
      setAnnualAppreciation(savedStep4.annualAppreciation);
      setAppreciationDisplay(String(savedStep4.annualAppreciation));
      setRenovationCosts(savedStep4.renovationCosts);
      if (savedStep4.renovationCosts) setRenovationCostsDisplay(fmt(savedStep4.renovationCosts));
      if (savedStep4.saleExpenses.length > 0) {
        const saved = savedStep4.saleExpenses;
        const masRow = saved.find((r) => r.readOnly && r.type === 'מס שבח');
        setHasMasShevach(masRow !== undefined);
        // זיהוי שורת התיווך לפי הסוג בלבד — תומך גם בנתון ישן שנשמר בש"ח
        const brokerRow = saved.find((r) => r.type === 'תיווך');
        if (brokerRow) {
          setHasBroker(true);
          // אם הנתון השמור הוא אחוז תקין — להשתמש בו; אם הוא ערך ישן בש"ח — לאפס ל-2%
          const pct =
            brokerRow.unit === 'percent' && typeof brokerRow.amount === 'number'
              ? brokerRow.amount
              : 2;
          setBrokerPct(pct);
          setBrokerPctDisplay(String(pct));
        } else {
          setHasBroker(false);
        }
        // לא לכלול את שורת התיווך בשורות "אחר" (גם לא נתון ישן בש"ח)
        const others = saved.filter((r) => !r.readOnly && r.type !== 'תיווך');
        setOtherExpenses(others.map((r) => ({ id: r.id, label: r.type, amount: r.amount })));
      }
    }
    setInitialized(true);
  }, [hydrated, initialized, savedStep4]);

  // ── שמירה אוטומטית לסטור בכל שינוי ─────────────────────────────────────
  useEffect(() => {
    if (!hydrated || !initialized) return;
    const saleExpenses = [
      ...(hasMasShevach ? [{ id: 1, type: 'מס שבח', unit: 'auto', amount: null, readOnly: true }] : []),
      ...(hasBroker ? [{ id: 2, type: 'תיווך', unit: 'percent', amount: brokerPct }] : []),
      ...otherExpenses.map((e) => ({ id: e.id + 100, type: e.label, unit: 'ils', amount: e.amount })),
    ];
    setStep4Input({ holdingYears, salePrice, autoCalculate, annualAppreciation, renovationCosts, saleExpenses });
  }, [holdingMonths, holdingYears, salePrice, autoCalculate, annualAppreciation, renovationCosts, hasMasShevach, hasBroker, brokerPct, otherExpenses, hydrated, initialized, setStep4Input]);

  // ── accordion state ───────────────────────────────────────────────────────
  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(false);
  const [step3Open, setStep3Open] = useState(false);
  const [taxOpen,   setTaxOpen]   = useState(false);

  // ── live calculations ─────────────────────────────────────────────────────
  const effectiveSalePrice: number =
    autoCalculate && propertyValue > 0
      ? Math.round(propertyValue * Math.pow(1 + annualAppreciation / 100, holdingYears))
      : (salePrice ?? 0);

  const remainingMortgage = step2Input
    ? Math.round(calcRemainingBalance(mortgageAmount, annualRate, loanTermYears, repaymentMethod, holdingYears))
    : 0;

  const interestPaid = step2Input
    ? Math.round(calcInterestPaid(mortgageAmount, annualRate, loanTermYears, repaymentMethod, holdingYears, monthlyPayment))
    : 0;

  const purchaseFeesDeductible = (step1Result?.expenseBreakdown ?? [])
    .filter((e) => e.type === 'broker' || e.type === 'lawyer')
    .reduce((sum, e) => sum + e.adjustedAmount, 0);

  const EXEMPT_THRESHOLD = 4_846_000;
  const totalGain = effectiveSalePrice - totalCost - (renovationCosts ?? 0);

  let capitalGainsTax: number;
  let capitalGainsTaxWarning: boolean;

  if (!step1Input) {
    capitalGainsTax = 0;
    capitalGainsTaxWarning = false;
  } else if (totalGain <= 0) {
    capitalGainsTax = 0;
    capitalGainsTaxWarning = false;
  } else if (isSingleApt && effectiveSalePrice <= EXEMPT_THRESHOLD) {
    capitalGainsTax = 0;
    capitalGainsTaxWarning = false;
  } else if (isSingleApt && effectiveSalePrice > EXEMPT_THRESHOLD) {
    const exemptPortion = totalGain * (EXEMPT_THRESHOLD / effectiveSalePrice);
    const taxablePortion = totalGain - exemptPortion;
    capitalGainsTax = Math.round(taxablePortion * 0.25);
    capitalGainsTaxWarning = true;
  } else {
    capitalGainsTax = Math.round(totalGain * 0.25);
    capitalGainsTaxWarning = true;
  }

  const brokerAmount = hasBroker && effectiveSalePrice > 0
    ? Math.round(effectiveSalePrice * brokerPct / 100 * 1.18)
    : 0;

  const totalSaleExpenses =
    (hasMasShevach ? capitalGainsTax : 0) +
    brokerAmount +
    otherExpenses.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  const netProfitFromSale = effectiveSalePrice - remainingMortgage - totalSaleExpenses - totalCost;
  const capitalGain       = effectiveSalePrice - totalCost;

  const canProceed = effectiveSalePrice > 0;

  // ── popup state ───────────────────────────────────────────────────────────
  const [showPopup,  setShowPopup]  = useState(false);
  const [email,      setEmail]      = useState('');
  const [consent,    setConsent]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = emailTouched && !isEmailValid;

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleSalePriceChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const num = digits ? parseInt(digits, 10) : null;
    setSalePrice(num);
    setSalePriceDisplay(num ? fmt(num) : '');
  };

  const handleSalePriceFocus = () => {
    if (salePrice) setSalePriceDisplay(String(salePrice));
  };

  const handleSalePriceBlur = () => {
    if (salePrice) setSalePriceDisplay(fmt(salePrice));
  };

  const handleRenovationChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const num = digits ? parseInt(digits, 10) : null;
    setRenovationCosts(num);
    setRenovationCostsDisplay(num ? fmt(num) : '');
  };

  const handleRenovationFocus = () => {
    if (renovationCosts) setRenovationCostsDisplay(String(renovationCosts));
  };

  const handleRenovationBlur = () => {
    if (renovationCosts) setRenovationCostsDisplay(fmt(renovationCosts));
  };

  const handleAppreciationChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setAppreciationDisplay(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num)) setAnnualAppreciation(num);
  };

  const handleHoldingMonthsChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    setHoldingMonthsDisplay(digits);
    let num = digits ? parseInt(digits, 10) : 0;
    if (num > 0) {
      if (num > maxHoldingMonths) {
        num = maxHoldingMonths;                 // הגבלה לתקופת המשכנתא
        setHoldingMonthsDisplay(String(num));
      }
      setHoldingMonths(num);
    }
  };

  const handleBrokerPctChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setBrokerPctDisplay(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 0) setBrokerPct(num);
  };

  const addOtherExpense = () => {
    setOtherExpenses((prev) => {
      const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
      return [...prev, { id: maxId + 1, label: 'אחר', amount: null }];
    });
  };

  const removeOtherExpense = (id: number) => {
    setOtherExpenses((prev) => prev.filter((r) => r.id !== id));
  };

  const updateOtherExpenseLabel = (id: number, label: string) => {
    setOtherExpenses((prev) => prev.map((r) => r.id === id ? { ...r, label } : r));
  };

  const updateOtherExpenseAmount = (id: number, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const num = digits === '' ? null : parseInt(digits, 10);
    setOtherExpenses((prev) => prev.map((r) => r.id === id ? { ...r, amount: num } : r));
  };

  // שמירת תוצאה לסטור (נקרא גם לפני הפופאפ וגם בהמשך)
  const saveStep4Result = () => {
    const adj = step3Result?.adjustedMonthlyIncome ?? 0;
    const exp = step3Result?.totalMonthlyExpenses ?? 0;
    const totalRent   = adj * 12 * holdingYears;
    const totalOpEx   = exp * 12 * holdingYears;
    const totalMortP  = monthlyPayment * 12 * holdingYears;
    const grossProfit = effectiveSalePrice + totalRent - propertyValue;
    const netProfit   = grossProfit - totalOpEx - totalMortP - totalSaleExpenses;
    const totalROI    = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    setStep4Result({
      capitalGain,
      totalRentCollected: totalRent,
      totalOperatingExpenses: totalOpEx,
      totalMortgagePayments: totalMortP,
      totalSaleExpenses,
      grossProfit,
      netProfit,
      totalROI,
      annualROI: holdingYears > 0 ? totalROI / holdingYears : 0,
    });
    return netProfit;
  };

  // פתיחת הפופאפ
  const handleNext = () => {
    if (!canProceed) return;
    saveStep4Result();
    setShowPopup(true);
  };

  // שליחה לגוגל שיטס + מעבר לסיכום
  const handlePopupSubmit = async () => {
    if (!isEmailValid || submitting) return;
    setSubmitting(true);
    const netProfit = netProfitFromSale;
    try {
      const url = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
      if (url) {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            date: new Date().toISOString(),
            consent,
            propertyValue,
            mortgageAmount,
            monthlyRent: step3Result?.adjustedMonthlyIncome ?? 0,
            expectedSalePrice: effectiveSalePrice,
            netProfit,
          }),
        });
      }
    } catch {
      // שגיאת רשת לא עוצרת את המשך
    } finally {
      setSubmitting(false);
      setShowPopup(false);
      localStorage.setItem('summary_gate_cleared', '1');
      router.push('/calculator/summary');
    }
  };

  const handleStepClick = (step: 1 | 2 | 3 | 4 | 'summary') => {
    if (step === 1) router.push('/calculator/step1');
    if (step === 2) router.push('/calculator/step2');
    if (step === 3) router.push('/calculator/step3');
    if (step === 4) router.push('/calculator/step4');
    // 'summary' — חסום: חייבים לעבור דרך הפופאפ
  };

  if (!hydrated) return null;

  // ─── render ──────────────────────────────────────────────────────────────
  return (
    <>
    {/* ── Email popup ── */}
    {showPopup && (
      <div className={styles.overlay}>
        <div className={styles.modal} role="dialog" aria-modal="true">

          {/* Header: כותרת + X */}
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>הדוח המלא של העסקה מוכן לצפייה</h2>
            <button className={styles.closeBtn} onClick={() => setShowPopup(false)} aria-label="סגור">✕</button>
          </div>

          {/* Illustration */}
          <div className={styles.modalIllustration}>
            <svg width="180" height="200" viewBox="285 85 180 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="422.8" cy="127.437" rx="25" ry="25.5" fill="#F3D7AB"/>
              <path d="M347.076 87.2998C351.698 87.2999 355.526 90.6943 356.205 95.126C356.358 95.1186 356.512 95.1143 356.668 95.1143C360.469 95.1143 363.573 97.3535 363.764 100.169L363.772 100.443V105.772H328.604V100.799L328.62 100.798C328.61 100.681 328.604 100.563 328.604 100.443C328.604 97.5005 331.784 95.1144 335.708 95.1143C336.478 95.1143 337.22 95.208 337.914 95.3779C338.484 90.8237 342.367 87.2998 347.076 87.2998Z" fill="white" stroke="#1A1B3A"/>
              <path d="M446.545 110.037C449.063 110.037 451.196 111.47 451.942 113.455C452.115 113.439 452.291 113.43 452.47 113.43C454.76 113.43 456.637 114.75 456.829 116.43H456.847V119.983H432.335V116.667L432.34 116.667C432.452 114.956 434.951 113.589 438.019 113.589C439.098 113.589 440.106 113.759 440.966 114.052C441.476 111.764 443.78 110.037 446.545 110.037Z" fill="white" stroke="#1A1B3A"/>
              <path d="M338.853 128.004L419.567 128.749C420.738 128.759 421.71 129.654 421.82 130.819L431.85 237.167C431.973 238.472 430.975 239.613 429.666 239.665L349.512 242.827C348.301 242.874 347.263 241.968 347.147 240.762L336.558 130.507C336.428 129.157 337.496 127.992 338.853 128.004Z" fill="#FFFCF5" stroke="#1A1B3A"/>
              <path d="M344.422 132.948H415.567C416.747 132.948 417.732 133.846 417.842 135.021L426.879 231.792C427.001 233.098 426 234.238 424.689 234.287L354.855 236.867C353.654 236.912 352.624 236.017 352.499 234.821L342.149 135.47C342.009 134.122 343.067 132.948 344.422 132.948Z" fill="white" stroke="#1A1B3A"/>
              <path d="M379.321 115.542C373.593 115.702 372.824 121.045 373.155 123.697H365.001C358.636 123.697 359.631 128.669 359.829 131.255C360.028 133.84 360.426 133.642 365.398 133.642H395.431C398.216 133.642 397.619 131.852 397.42 127.675C397.221 123.498 394.039 123.697 392.05 123.697H386.481C386.481 120.912 385.049 115.383 379.321 115.542Z" fill="#FFFCF5" stroke="#1A1B3A"/>
              <circle cx="379.918" cy="121.907" r="3.08005" fill="#FFFCF5" stroke="#1A1B3A"/>
              <path d="M305.731 170.834C307.163 170.357 314.681 168.249 318.261 167.254L323.035 204.248L314.085 199.077C311.035 191.188 304.856 175.13 304.538 174.017C304.14 172.624 303.941 171.431 305.731 170.834Z" stroke="#1A1B3A"/>
              <path d="M317.665 165.067C318.301 168.886 321.311 192.713 322.836 204.05L335.167 211.21L344.117 205.84L339.543 158.901C334.04 158.769 322.359 158.503 319.654 158.503C316.272 158.503 316.869 160.293 317.665 165.067Z" fill="white" stroke="#1A1B3A"/>
              <path d="M335.167 211.209L363.41 236.071" stroke="#1A1B3A"/>
              <path d="M335.167 211.209L303.345 237.264" stroke="#1A1B3A"/>
              <path d="M323.432 165.066H337.155" stroke="#1A1B3A"/>
              <path d="M323.432 169.84H336.558" stroke="#1A1B3A"/>
              <path d="M323.83 174.414H333.377" stroke="#1A1B3A"/>
              <path d="M301.753 191.917L308.316 184.558" stroke="#1A1B3A"/>
              <path d="M364.8 193.378L375.54 183.035L382.7 186.217L388.468 179.057L395.628 182.24L406.169 164.936" stroke="#1A1B3A"/>
              <path d="M401.595 167.124L406.368 164.936L406.766 170.505" stroke="#1A1B3A"/>
              <path d="M302.748 233.485C302.748 230.621 302.217 204.712 301.952 192.116L335.167 211.209L353.067 200.27L356.448 238.259C342.725 238.192 313.965 238.099 308.714 238.259C302.151 238.457 302.748 237.065 302.748 233.485Z" fill="#FFFCF5" stroke="#1A1B3A"/>
              <path d="M430.237 199.475C428.646 199.475 428.115 200.005 428.049 200.27C428.844 211.806 430.515 235.394 430.833 237.463C431.231 240.048 432.226 240.247 433.22 240.247C434.214 240.247 450.325 240.247 452.91 240.048C455.496 239.85 455.496 238.06 455.297 235.872C455.098 233.684 451.717 204.049 451.518 202.06C451.319 200.071 449.728 199.475 446.745 199.475H430.237Z" fill="white" stroke="#1A1B3A"/>
              <path d="M448.572 202.856H430.875C430.64 202.856 430.456 203.059 430.479 203.293L431.195 210.453C431.216 210.657 431.387 210.812 431.591 210.812H449.288C449.524 210.812 449.708 210.608 449.684 210.374L448.968 203.214C448.948 203.011 448.777 202.856 448.572 202.856Z" stroke="#1A1B3A"/>
              <path d="M436.608 214.591H432.447C432.219 214.591 432.038 214.782 432.05 215.01L432.22 218.192C432.232 218.403 432.406 218.569 432.618 218.569H436.779C437.007 218.569 437.188 218.377 437.176 218.15L437.005 214.967C436.994 214.756 436.82 214.591 436.608 214.591Z" stroke="#1A1B3A"/>
              <path d="M437.006 220.557H432.844C432.616 220.557 432.435 220.748 432.447 220.976L432.618 224.158C432.629 224.37 432.804 224.535 433.015 224.535H437.176C437.404 224.535 437.586 224.344 437.574 224.116L437.403 220.934C437.392 220.723 437.217 220.557 437.006 220.557Z" stroke="#1A1B3A"/>
              <path d="M437.802 226.524H433.64C433.412 226.524 433.231 226.715 433.243 226.943L433.414 230.125C433.425 230.336 433.6 230.502 433.811 230.502H437.972C438.2 230.502 438.382 230.31 438.369 230.083L438.199 226.9C438.188 226.689 438.013 226.524 437.802 226.524Z" stroke="#1A1B3A"/>
              <path d="M438.597 232.491H434.435C434.207 232.491 434.026 232.682 434.038 232.91L434.209 236.092C434.22 236.303 434.394 236.469 434.606 236.469H438.767C438.995 236.469 439.177 236.277 439.164 236.049L438.994 232.867C438.982 232.656 438.808 232.491 438.597 232.491Z" stroke="#1A1B3A"/>
              <path d="M443.37 214.591H439.209C438.981 214.591 438.799 214.782 438.812 215.01L438.982 218.192C438.993 218.403 439.168 218.569 439.379 218.569H443.541C443.769 218.569 443.95 218.377 443.938 218.15L443.767 214.967C443.756 214.756 443.581 214.591 443.37 214.591Z" stroke="#1A1B3A"/>
              <path d="M443.768 220.557H439.607C439.379 220.557 439.198 220.748 439.21 220.976L439.381 224.158C439.392 224.37 439.566 224.535 439.778 224.535H443.939C444.167 224.535 444.348 224.344 444.336 224.116L444.166 220.934C444.154 220.723 443.98 220.557 443.768 220.557Z" stroke="#1A1B3A"/>
              <path d="M444.563 226.524H440.402C440.174 226.524 439.993 226.715 440.005 226.943L440.175 230.125C440.187 230.336 440.361 230.502 440.573 230.502H444.734C444.962 230.502 445.143 230.31 445.131 230.083L444.961 226.9C444.949 226.689 444.775 226.524 444.563 226.524Z" stroke="#1A1B3A"/>
              <path d="M445.359 232.491H441.198C440.97 232.491 440.789 232.682 440.801 232.91L440.971 236.092C440.983 236.303 441.157 236.469 441.369 236.469H445.53C445.758 236.469 445.939 236.277 445.927 236.049L445.756 232.867C445.745 232.656 445.571 232.491 445.359 232.491Z" stroke="#1A1B3A"/>
              <path d="M450.133 214.591H445.971C445.743 214.591 445.562 214.782 445.574 215.01L445.745 218.192C445.756 218.403 445.931 218.569 446.142 218.569H450.303C450.531 218.569 450.713 218.377 450.7 218.15L450.53 214.967C450.519 214.756 450.344 214.591 450.133 214.591Z" stroke="#1A1B3A"/>
              <path d="M450.53 220.557H446.369C446.141 220.557 445.959 220.748 445.972 220.976L446.142 224.158C446.154 224.37 446.328 224.535 446.539 224.535H450.701C450.929 224.535 451.11 224.344 451.098 224.116L450.927 220.934C450.916 220.723 450.742 220.557 450.53 220.557Z" stroke="#1A1B3A"/>
              <path d="M451.336 226.524H447.177C446.944 226.524 446.761 226.722 446.78 226.954L447.525 236.103C447.542 236.309 447.715 236.469 447.922 236.469H452.081C452.314 236.469 452.497 236.27 452.478 236.038L451.733 226.889C451.716 226.683 451.544 226.524 451.336 226.524Z" stroke="#1A1B3A"/>
              <path d="M346.305 225.035C348.42 225.035 350.32 225.234 351.677 225.547C352.359 225.704 352.877 225.885 353.212 226.067C353.379 226.159 353.478 226.238 353.529 226.296C353.539 226.307 353.545 226.318 353.55 226.325C353.545 226.332 353.539 226.343 353.529 226.354C353.478 226.412 353.379 226.492 353.212 226.583C352.877 226.766 352.359 226.946 351.677 227.104C350.32 227.417 348.42 227.615 346.305 227.615C344.189 227.615 342.29 227.417 340.933 227.104C340.25 226.946 339.731 226.766 339.396 226.583C339.229 226.492 339.13 226.412 339.079 226.354C339.069 226.343 339.064 226.333 339.059 226.325C339.064 226.318 339.069 226.307 339.079 226.296C339.13 226.238 339.229 226.159 339.396 226.067C339.731 225.885 340.25 225.704 340.933 225.547C342.29 225.234 344.189 225.035 346.305 225.035Z" fill="white" stroke="#1A1B3A"/>
              <path d="M336.758 232.991C338.873 232.991 340.773 233.189 342.13 233.502C342.812 233.66 343.33 233.84 343.665 234.023C343.832 234.114 343.931 234.194 343.982 234.251C343.992 234.263 343.998 234.273 344.003 234.281C343.998 234.288 343.992 234.299 343.982 234.31C343.931 234.368 343.832 234.447 343.665 234.539C343.33 234.721 342.812 234.902 342.13 235.059C340.773 235.372 338.873 235.571 336.758 235.571C334.642 235.571 332.743 235.372 331.386 235.059C330.703 234.902 330.185 234.721 329.85 234.539C329.682 234.447 329.583 234.368 329.532 234.31C329.522 234.299 329.517 234.288 329.512 234.281C329.517 234.273 329.522 234.263 329.532 234.251C329.583 234.194 329.682 234.114 329.85 234.023C330.185 233.84 330.703 233.66 331.386 233.502C332.743 233.189 334.642 232.991 336.758 232.991Z" fill="white" stroke="#1A1B3A"/>
            </svg>
          </div>

          {/* Body text */}
          <p className={styles.modalText}>
            ריכזנו עבורכם את כל נתוני העסקה במקום אחד, כולל רווח צפוי, תזרים, תשואות, מימון ותחזית המכירה העתידית.
            כדי לצפות בדוח המלא ולקבל עותק מסודר למייל, הזינו את כתובת המייל שלכם.
            הדוח יישלח אליכם לצפייה חוזרת ולהשוואת עסקאות.
          </p>

          {/* Email section */}
          <div className={styles.emailSection}>
            <label className={styles.emailLabel}>הזינו כתובת מייל</label>

            {/* Input + button row */}
            <div className={styles.emailRow}>
              {/* Input — right (first in RTL) */}
              <div className={styles.emailInputWrapper}>
                <input
                  className={`${styles.emailInput} ${showEmailError ? styles.emailInputError : ''}`}
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  dir="ltr"
                />
                {showEmailError && (
                  <span className={styles.emailError}>נא להזין כתובת מייל תקינה</span>
                )}
              </div>

              {/* Button — left (second in RTL) */}
              <button
                className={styles.modalSubmitBtn}
                onClick={handlePopupSubmit}
                disabled={!isEmailValid || submitting}
              >
                {submitting ? 'שולח...' : '← צפייה בדוח המלא'}
              </button>
            </div>

            {/* Consent — informational only (gold) */}
            <div className={styles.consentText}>
              <span className={styles.consentIcon}>✓</span>
              <span>בהזנת כתובת המייל אתם מאשרים קבלת עדכונים מקצועיים בנושא נדל&quot;ן והשקעות.</span>
            </div>
          </div>

        </div>
      </div>
    )}

    <main className={styles.pageWrapper}>

      <ProgressBar currentStep={4} onStepClick={handleStepClick} />

      {/* ── Nav row ── */}
      <div className={styles.navRow}>
        <div className={styles.navTitleGroup}>
          <div className={styles.stepIcon}>
            <svg
              width="100%"
              height="100%"
              viewBox="1255 15 22 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ maxWidth: '24px', maxHeight: '24px' }}
            >
              <path d="M1262.25 19.625V19.6641C1261.82 19.7031 1261.43 19.7422 1261 19.7812V19.625C1261 19.0391 1261.35 18.5312 1261.74 18.1797C1262.17 17.8281 1262.76 17.5156 1263.42 17.2812C1264.75 16.7734 1266.55 16.5 1268.5 16.5C1270.45 16.5 1272.25 16.7734 1273.58 17.2812C1274.24 17.5156 1274.83 17.8281 1275.26 18.1797C1275.69 18.5312 1276 19.0391 1276 19.625V28.1406C1276 28.7266 1275.69 29.2344 1275.26 29.625C1274.83 30.0156 1274.24 30.3281 1273.58 30.5625C1273.38 30.6797 1273.11 30.7578 1272.88 30.7969V29.5078C1272.95 29.4688 1273.07 29.4297 1273.15 29.3906C1273.73 29.1953 1274.16 28.9219 1274.44 28.6875C1274.71 28.4531 1274.75 28.2578 1274.75 28.1406V25.5625C1274.4 25.7578 1274.01 25.9531 1273.58 26.1094C1273.34 26.2266 1273.11 26.3047 1272.88 26.3828V25.0547C1272.95 25.0156 1273.07 24.9766 1273.15 24.9766C1273.73 24.7422 1274.16 24.5078 1274.44 24.2344C1274.67 24 1274.75 23.8047 1274.75 23.6875V21.4219C1274.4 21.6562 1274.01 21.8125 1273.58 21.9688C1273.11 22.1641 1272.56 22.3203 1271.94 22.4375C1271.78 22.2031 1271.59 22.0469 1271.43 21.8906C1271.23 21.6953 1271 21.5 1270.77 21.3438C1271.66 21.2266 1272.48 21.0312 1273.15 20.7969C1273.73 20.6016 1274.16 20.3672 1274.44 20.1328C1274.71 19.8984 1274.75 19.7031 1274.75 19.625C1274.75 19.5469 1274.71 19.3516 1274.44 19.1172C1274.16 18.8828 1273.73 18.6484 1273.15 18.4531C1271.98 18.0234 1270.34 17.75 1268.5 17.75C1266.66 17.75 1265.02 18.0234 1263.85 18.4531C1263.27 18.6484 1262.84 18.8828 1262.56 19.1172C1262.29 19.3516 1262.25 19.5469 1262.25 19.625ZM1257.25 24.625C1257.25 24.7031 1257.29 24.8984 1257.56 25.1328C1257.84 25.3672 1258.27 25.6016 1258.85 25.7969C1260.02 26.2266 1261.66 26.5 1263.5 26.5C1265.34 26.5 1266.98 26.2266 1268.15 25.7969C1268.73 25.6016 1269.16 25.3672 1269.44 25.1328C1269.71 24.8984 1269.75 24.7031 1269.75 24.625C1269.75 24.5469 1269.71 24.3516 1269.44 24.1172C1269.16 23.8828 1268.73 23.6484 1268.15 23.4531C1266.98 23.0234 1265.34 22.75 1263.5 22.75C1261.66 22.75 1260.02 23.0234 1258.85 23.4531C1258.27 23.6484 1257.84 23.8828 1257.56 24.1172C1257.29 24.3516 1257.25 24.5469 1257.25 24.625ZM1256 24.625C1256 24.0391 1256.35 23.5312 1256.74 23.1797C1257.17 22.8281 1257.76 22.5156 1258.42 22.2812C1259.75 21.7734 1261.55 21.5 1263.5 21.5C1265.45 21.5 1267.25 21.7734 1268.58 22.2812C1269.24 22.5156 1269.83 22.8281 1270.26 23.1797C1270.69 23.5312 1271 24.0391 1271 24.625V33.1406C1271 33.7266 1270.69 34.2344 1270.26 34.625C1269.83 35.0156 1269.24 35.3281 1268.58 35.5625C1267.25 36.0703 1265.45 36.3828 1263.5 36.3828C1261.55 36.3828 1259.75 36.0703 1258.42 35.5625C1257.76 35.3281 1257.17 35.0156 1256.74 34.625C1256.31 34.2344 1256 33.7266 1256 33.1406V24.625ZM1269.75 26.4219C1269.4 26.6562 1269.01 26.8125 1268.58 26.9688C1267.25 27.4766 1265.45 27.75 1263.5 27.75C1261.55 27.75 1259.75 27.4766 1258.42 26.9688C1257.99 26.8125 1257.6 26.6562 1257.25 26.4219V28.6875C1257.25 28.8047 1257.33 29 1257.6 29.2344C1257.84 29.4688 1258.27 29.7422 1258.85 29.9375C1260.02 30.4062 1261.66 30.6797 1263.5 30.6797C1265.34 30.6797 1266.98 30.4062 1268.15 29.9375C1268.73 29.7422 1269.16 29.4688 1269.44 29.2344C1269.67 29 1269.75 28.8047 1269.75 28.6875V26.4219ZM1257.25 33.1406C1257.25 33.2578 1257.33 33.4531 1257.6 33.6875C1257.84 33.9219 1258.27 34.1953 1258.85 34.3906C1260.02 34.8594 1261.66 35.1328 1263.5 35.1328C1265.34 35.1328 1266.98 34.8594 1268.15 34.3906C1268.73 34.1953 1269.16 33.9219 1269.44 33.6875C1269.67 33.4531 1269.75 33.2578 1269.75 33.1406V30.5625C1269.4 30.7578 1269.01 30.9531 1268.58 31.1094C1267.25 31.6172 1265.45 31.9297 1263.5 31.9297C1261.55 31.9297 1259.75 31.6172 1258.42 31.1094C1257.99 30.9531 1257.6 30.7578 1257.25 30.5625V33.1406Z" fill="#E5B260" />
            </svg>
          </div>
          <div className={styles.stepTitleBlock}>
            <span className={styles.stepTitle}>בואו נבחן את המכירה העתידית של הנכס</span>
            <span className={styles.stepSubtitle}>הזינו נתוני מכירה צפויים לחישוב הרווח בסיום ההשקעה</span>
          </div>
        </div>
        <div className={styles.navButtonsGroup}>
          <button className={styles.saveBtn}>שמור וחזור מאוחר יותר 🔖</button>
          <button className={styles.nextBtn} onClick={handleNext} disabled={!canProceed}>
            המשך לסיכום←
          </button>
        </div>
      </div>

      {/* ── Content row ── */}
      <div className={styles.contentRow}>

        {/* ── Summary column ── */}
        <div className={styles.summaryColumn}>
          <SummaryPanel
            step1Result={step1Result}
            step1Input={step1Input}
            step2Result={step2Result}
            step2Input={step2Input}
            step3Result={step3Result}
            effectiveSalePrice={effectiveSalePrice}
            capitalGain={capitalGain}
            remainingMortgage={remainingMortgage}
            totalSaleExpenses={totalSaleExpenses}
            netProfitFromSale={netProfitFromSale}
            capitalGainsTax={capitalGainsTax}
            capitalGainsTaxWarning={capitalGainsTaxWarning}
            isSingleApt={isSingleApt}
            totalGain={totalGain}
            purchaseFeesDeductible={purchaseFeesDeductible}
            purchaseTax={purchaseTax}
            interestPaid={interestPaid}
            renovationCosts={renovationCosts ?? 0}
            propertyValue={propertyValue}
            totalCost={totalCost}
            step1Open={step1Open} onToggleStep1={() => setStep1Open(v => !v)}
            step2Open={step2Open} onToggleStep2={() => setStep2Open(v => !v)}
            step3Open={step3Open} onToggleStep3={() => setStep3Open(v => !v)}
            taxOpen={taxOpen}     onToggleTax={()   => setTaxOpen(v => !v)}
          />
        </div>

        {/* ── Forms column ── */}
        <div className={styles.formsColumn}>

          {/* Card 1: Future sale */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>מכירה עתידית</h2>

            {/* שורה 1: מחיר מכירה (ימין) + כעבור כמה שנים (שמאל, צמוד ימין) */}
            <div className={styles.fieldsRow}>

              {/* Sale price — right half */}
              <div className={styles.halfField}>
                <label className={styles.fieldLabel}>מחיר מכירה צפוי (₪)</label>
                <div className={`${styles.inputWithSymbol} ${autoCalculate ? styles.readOnly : ''}`}>
                  <span className={styles.currencySymbol}>₪</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="לדוגמה: 2,300,000"
                    readOnly={autoCalculate}
                    value={autoCalculate ? fmt(effectiveSalePrice) : salePriceDisplay}
                    onChange={(e) => !autoCalculate && handleSalePriceChange(e.target.value)}
                    onFocus={() => !autoCalculate && handleSalePriceFocus()}
                    onBlur={() => !autoCalculate && handleSalePriceBlur()}
                  />
                </div>
                {autoCalculate && (
                  <span className={styles.fieldHint}>
                    מחיר × (1 + {annualAppreciation}%)^({holdingMonths} חודשים ÷ 12)
                  </span>
                )}
              </div>

              {/* Holding years — left half, right-aligned within */}
         

            </div>

            {/* שורה 2: checkbox מתחת למחיר (ימין) + עליית ערך כשפעיל (שמאל) */}
            <div className={styles.fieldsRow}>

              {/* Checkbox — right half, below sale price */}
              <div className={styles.halfField}>
                <label className={styles.checkboxRow} style={{ width: 'fit-content' }}>
                  <input
                    type="checkbox"
                    checked={autoCalculate}
                    onChange={(e) => setAutoCalculate(e.target.checked)}
                  />
                  <span className={styles.checkboxLabel}>חשב מחיר אוטומטית לפי עליית ערך</span>
                </label>
              </div>

              {/* Appreciation — left half, shown only when auto */}
              {autoCalculate ? (
                <div className={styles.halfField}>
                  <label className={styles.fieldLabel}>עליית ערך שנתית (%)</label>
                  <div className={styles.inputWithSymbol}>
                    <input
                      className={styles.input}
                      type="text"
                      inputMode="decimal"
                      placeholder="3"
                      value={appreciationDisplay}
                      onChange={(e) => handleAppreciationChange(e.target.value)}
                    />
                    <span className={styles.percentSymbol}>%</span>
                  </div>
                </div>
              ) : <div className={styles.halfField} />}

            </div>

            {/* שורה 3: הוצאות השבחה (ימין) + כעבור כמה שנים (שמאל) */}
            <div className={styles.fieldsRow}>

              {/* Renovation costs — right half */}
              <div className={styles.halfField}>
                <label className={styles.fieldLabel}>הוצאות השבחה (₪)</label>
                <div className={styles.inputWithSymbol}>
                  <span className={styles.currencySymbol}>₪</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="לדוגמה: 80,000"
                    value={renovationCostsDisplay}
                    onChange={(e) => handleRenovationChange(e.target.value)}
                    onFocus={handleRenovationFocus}
                    onBlur={handleRenovationBlur}
                  />
                </div>
                <span className={styles.fieldHint}>
                  יש לשמור קבלות כחוק לצורך הגשה לרשויות המס
                </span>
              </div>

              {/* Holding months — left half, right-aligned within */}
              <div className={styles.halfFieldRight}>
                <label className={styles.fieldLabel}>כעבור כמה חודשים תמכור?</label>
                <div className={styles.inputWithSymbol}>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder={String(defaultHoldingMonths)}
                    value={holdingMonthsDisplay}
                    onChange={(e) => handleHoldingMonthsChange(e.target.value)}
                  />
                  <span className={styles.percentSymbol}>חודשים</span>
                </div>
                <span className={styles.fieldHint}>
                  עד {maxHoldingMonths} חודשים ({loanTermYears} שנות המשכנתא) · ≈ {holdingYears.toFixed(1)} שנים
                </span>
              </div>

            </div>

          </div>

          {/* Card 2: Sale expenses */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>הוצאות ועלויות המכירה</h2>

            <div className={styles.saleExpensesBody}>

              {/* ROW 1: מס שבח */}
              {hasMasShevach && (
                <div className={styles.saleExpenseSectionNew}>
                  <div className={styles.saleExpenseRowNew}>
                    <div className={styles.saleHalfLabel}>מס שבח</div>
                    <div className={styles.saleReadOnly}>
                      {capitalGainsTax === 0 && !capitalGainsTaxWarning && isSingleApt
                        ? 'פטור – דירה יחידה'
                        : `${fmt(capitalGainsTax)} ₪`}
                    </div>
                    <button
                      type="button"
                      className={styles.saleTrashBtn}
                      onClick={() => setHasMasShevach(false)}
                      aria-label="מחק מס שבח"
                    >🗑</button>
                  </div>
                  {capitalGainsTaxWarning && capitalGainsTax > 0 && (
                    <p className={styles.saleExpenseHint}>חישוב זה הוא הערכה בלבד. לדיוק מושלם נדרש ייעוץ פרטני</p>
                  )}
                </div>
              )}

              {/* ROW 2: תיווך מכירה — מבנה זהה לשלב 1 */}
              {hasBroker && (
                <div className={styles.saleExpenseSectionNew}>
                  <div className={styles.saleExpenseRowNew}>
                    <div className={styles.saleHalfLabel}>תיווך %</div>
                    <input
                      className={styles.saleHalfInput}
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="0"
                      value={brokerPctDisplay}
                      onChange={(e) => handleBrokerPctChange(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.saleTrashBtn}
                      onClick={() => setHasBroker(false)}
                      aria-label="מחק תיווך"
                    >🗑</button>
                  </div>
                  {brokerAmount > 0 && (
                    <p className={styles.saleExpenseHint}>= {fmt(brokerAmount)} שח (כולל מע&quot;מ 18%)</p>
                  )}
                </div>
              )}

              {/* Dynamic "other" rows */}
              {otherExpenses.map((row) => (
                <div className={styles.saleExpenseRowNew} key={row.id}>
                  <input
                    className={styles.saleHalfInput}
                    type="text"
                    placeholder="אחר"
                    value={row.label}
                    onChange={(e) => updateOtherExpenseLabel(row.id, e.target.value)}
                  />
                  <input
                    className={styles.saleHalfInput}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={row.amount !== null ? row.amount.toLocaleString('he-IL') : ''}
                    onChange={(e) => updateOtherExpenseAmount(row.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.saleTrashBtn}
                    onClick={() => removeOtherExpense(row.id)}
                    aria-label="מחק"
                  >🗑</button>
                </div>
              ))}

            </div>

            <button className={styles.addExpenseBtn} onClick={addOtherExpense}>
              + הוספת הוצאה
            </button>

          </div>

        </div>
        {/* ── end forms column ── */}

      </div>
    </main>
    </>
  );
}

// ─── SummaryPanel ─────────────────────────────────────────────────────────────

interface SummaryPanelProps {
  step1Result: Step1Result | null;
  step1Input: { propertyValue: number; propertyType: string; expenses: unknown[] } | null;
  step2Result: Step2Result | null;
  step2Input: { mortgageAmount: number; repaymentMethod: string; interestRate: number; loanTermYears: number; earlyRepaymentYears?: number } | null;
  step3Result: Step3Result | null;
  effectiveSalePrice: number;
  capitalGain: number;
  remainingMortgage: number;
  totalSaleExpenses: number;
  netProfitFromSale: number;
  capitalGainsTax: number;
  capitalGainsTaxWarning: boolean;
  isSingleApt: boolean;
  totalGain: number;
  purchaseFeesDeductible: number;
  purchaseTax: number;
  interestPaid: number;
  renovationCosts: number;
  propertyValue: number;
  totalCost: number;
  step1Open: boolean; onToggleStep1: () => void;
  step2Open: boolean; onToggleStep2: () => void;
  step3Open: boolean; onToggleStep3: () => void;
  taxOpen: boolean;   onToggleTax: () => void;
}

const REPAYMENT_LABELS: Record<string, string> = {
  spitzer: 'שפיצר (אנונה)',
  full_balloon: 'בלון מלא',
  partial_balloon: 'בלון חלקי',
};

function SummaryPanel(p: SummaryPanelProps) {
  const isPositive = p.netProfitFromSale >= 0;
  const hasData    = p.effectiveSalePrice > 0;

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

      {/* Accordion — Step 1 */}
      <Accordion
        label="סיכום פרטי הנכס ועלויות רכישה"
        open={p.step1Open}
        onToggle={p.onToggleStep1}
      >
        {p.step1Result && (
          <>
            <Row label="שווי הנכס"          value={`₪ ${fmt(p.propertyValue)}`} />
            <Row label="מס רכישה"           value={`₪ ${fmt(p.step1Result.purchaseTaxAmount)}`} />
            <Row label="עלויות נוספות"      value={`₪ ${fmt(p.step1Result.totalExpenses)}`} />
            <TotalRow label="עלות רכישה כוללת" value={`₪ ${fmt(p.step1Result.totalCost)}`} />
          </>
        )}
      </Accordion>

      {/* Accordion — Step 2 */}
      <Accordion
        label="סיכום המימון והמשכנתא"
        open={p.step2Open}
        onToggle={p.onToggleStep2}
      >
        {p.step2Result && p.step2Input && (
          <>
            <Row label="סכום משכנתא"   value={`₪ ${fmt(p.step2Input.mortgageAmount)}`} />
            <Row label="ריבית שנתית"   value={`${p.step2Input.interestRate}%`} />
            <Row label="תקופה"         value={`${p.step2Input.loanTermYears} שנים`} />
            <Row label="שיטת החזר"     value={REPAYMENT_LABELS[p.step2Input.repaymentMethod] ?? ''} />
            <TotalRow label="החזר חודשי" value={`₪ ${fmt(Math.round(p.step2Result.monthlyPayment))}`} />
          </>
        )}
      </Accordion>

      {/* Accordion — Step 3 */}
      <Accordion
        label="סיכום הכנסות והוצאות"
        open={p.step3Open}
        onToggle={p.onToggleStep3}
      >
        {p.step3Result && (
          <>
            <Row label="הכנסה חודשית"    value={`₪ ${fmt(p.step3Result.adjustedMonthlyIncome)}`} />
            <Row label="הוצאות חודשיות"  value={`₪ ${fmt(p.step3Result.totalMonthlyExpenses)}`} />
            <Row label="תשואה ברוטו"     value={`${p.step3Result.grossAnnualYield.toFixed(2)}%`} />
            <TotalRow label="תזרים חודשי נטו"
              value={`${p.step3Result.netMonthlyCashFlow >= 0 ? '+' : ''}${fmt(p.step3Result.netMonthlyCashFlow)} ₪`}
            />
          </>
        )}
      </Accordion>

      {/* Live calculations */}
      <div className={styles.liveSection}>
        <div className={styles.liveSectionTitle}>חישובי מכירה (צפוי)</div>

        <Row label="שווי מכירה צפוי"
          value={hasData ? `₪ ${fmt(p.effectiveSalePrice)}` : '—'} />
        <Row label="רווח מעליית ערך"
          value={hasData ? `₪ ${fmt(p.capitalGain)}` : '—'} />
        <Row label="מס שבח משוער"
          value={hasData ? (p.capitalGainsTax === 0 && !p.capitalGainsTaxWarning && p.isSingleApt ? 'פטור – דירה יחידה' : `₪ ${fmt(p.capitalGainsTax)}`) : '—'} />
        <Row label="יתרת משכנתא במועד המכירה"
          value={hasData ? `₪ ${fmt(p.remainingMortgage)}` : '—'} />
      </div>

      {/* Tax breakdown accordion */}
      <div className={styles.taxCollapseRow}>
        <div
          className={styles.collapseRowInner}
          onClick={p.onToggleTax}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') p.onToggleTax(); }}
          aria-expanded={p.taxOpen}
        >
          <span className={`${styles.collapseLabel} ${p.taxOpen ? styles.collapseLabelOpen : ''}`}>
            פירוט מס שבח
          </span>
          <span className={`${styles.collapseChevron} ${p.taxOpen ? styles.open : ''}`}>▼</span>
        </div>

        {p.taxOpen && (
          <div className={styles.collapseContent}>
            <Row label="מחיר מכירה"              value={`₪ ${fmt(p.effectiveSalePrice)}`} />
            <Row label="שווי הנכס ברכישה"        value={`− ₪ ${fmt(p.propertyValue)}`} />
            <Row label="מס רכישה"                value={`− ₪ ${fmt(p.purchaseTax)}`} />
            <Row label="הוצאות רכישה"            value={`− ₪ ${fmt(p.step1Result?.totalExpenses ?? 0)}`} />
            <Row label="הוצאות השבחה"            value={`− ₪ ${fmt(p.renovationCosts)}`} />
            <TotalRow label="שבח חייב במס"        value={`₪ ${fmt(Math.max(0, p.totalGain))}`} />
            <TotalRow
              label={p.isSingleApt ? 'מס שבח' : 'מס שבח (25%)'}
              value={p.capitalGainsTax === 0 && !p.capitalGainsTaxWarning && p.isSingleApt ? 'פטור – דירה יחידה' : `₪ ${fmt(p.capitalGainsTax)}`}
            />
            {p.capitalGainsTaxWarning && (
              <p style={{ fontSize: '12px', color: '#9CA6B6', margin: '4px 0 0', textAlign: 'right' }}>
                חישוב זה הוא הערכה בלבד. לדיוק מושלם נדרש ייעוץ פרטני
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className={styles.tipBox}>
        <div className={styles.tipTextBlock}>
          <div className={styles.tipTitle}>הדוח המלא כמעט מוכן! 🎉</div>
          <div className={styles.tipText}>
            בשלב הבא נסכם את כלל נתוני העסקה ונציג את הרווח הצפוי, התשואה הסופית ותמונת ההשקעה המלאה.
          </div>
        </div>
        <span className={styles.tipIcon}>💡</span>
      </div>

    </div>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────

function Accordion({
  label, open, onToggle, children,
}: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={styles.collapseRow}>
      <div
        className={styles.collapseRowInner}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        aria-expanded={open}
      >
        <span className={`${styles.collapseLabel} ${open ? styles.collapseLabelOpen : ''}`}>
          {label}
        </span>
        <span className={`${styles.collapseChevron} ${open ? styles.open : ''}`}>▼</span>
      </div>
      {open && <div className={styles.collapseContent}>{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.recapRow}>
      <span className={styles.recapLabel}>{label}</span>
      <span className={styles.recapValue}>{value}</span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.recapTotal}>
      <span className={styles.recapTotalLabel}>{label}</span>
      <span className={styles.recapTotalValue}>{value}</span>
    </div>
  );
}
