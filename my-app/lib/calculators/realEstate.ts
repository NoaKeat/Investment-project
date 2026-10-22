// לוגיקת חישובי הנדל"ן — הועברה מ-server/src/calculators/realEstate.ts כדי
// שתרוץ כ-Next API route (same-origin), בלי בק-אנד express נפרד.
import type {
  Step1Input, Step1Result, Step1ExpenseBreakdown,
  Step2Input, Step2Result,
  Step3Input, Step3Result,
  Step4Input, Step4Result,
} from '@/components/calculator/types';

// ─── מס רכישה מדורג ──────────────────────────────────────────────────────────

interface TaxBracket {
  from: number;
  to: number;   // Infinity לסוף הסולם
  rate: number; // ערך עשרוני (0.035 = 3.5%)
}

const FIRST_APARTMENT_BRACKETS: TaxBracket[] = [
  { from: 0, to: 1_978_745, rate: 0 },
  { from: 1_978_745, to: 2_347_040, rate: 0.035 },
  { from: 2_347_040, to: 6_055_070, rate: 0.05 },
  { from: 6_055_070, to: Infinity, rate: 0.08 },
];

const SECOND_APARTMENT_BRACKETS: TaxBracket[] = [
  { from: 0, to: 6_055_070, rate: 0.08 },
  { from: 6_055_070, to: Infinity, rate: 0.10 },
];


export function calculatePurchaseTax(
  propertyValue: number,
  propertyType: 'first_apartment' | 'second_apartment'
): number {
  const brackets =
    propertyType === 'first_apartment'
      ? FIRST_APARTMENT_BRACKETS
      : SECOND_APARTMENT_BRACKETS;

  let tax = 0;
  for (const bracket of brackets) {
    if (propertyValue <= bracket.from) break;
    const taxableInBracket = Math.min(propertyValue, bracket.to) - bracket.from;
    tax += taxableInBracket * bracket.rate;
  }
  return Math.round(tax);
}

// ─── שלב 1 ───────────────────────────────────────────────────────────────────

const RENOVATION_SURCHARGE = 0.1; // 10% בצ"מ

export function calculateStep1(input: Step1Input): Step1Result {
  // מס רכישה — מדורג. סוגים אחרים (land/commercial/other) = 0 לעת עתה
  const purchaseTaxAmount =
    input.propertyType === 'first_apartment' ||
      input.propertyType === 'second_apartment'
      ? calculatePurchaseTax(input.propertyValue, input.propertyType)
      : 0;

  // פירוט הוצאות + חישוב שיפוץ
  const expenseBreakdown: Step1ExpenseBreakdown[] = [];
  let totalExpenses = 0;

  for (const e of input.expenses) {
    const base = e.amount ?? 0;
    if (base <= 0) continue; // שורות ריקות לא נכנסות לחישוב

    const hasSurcharge = e.type === 'renovation';
    const adjusted = hasSurcharge ? Math.round(base * (1 + RENOVATION_SURCHARGE)) : base;

    expenseBreakdown.push({
      id: e.id,
      type: e.type,
      label: e.label,
      baseAmount: base,
      adjustedAmount: adjusted,
      hasSurcharge,
    });

    totalExpenses += adjusted;
  }

  const totalCost = input.propertyValue + purchaseTaxAmount + totalExpenses;

  return {
    purchaseTaxAmount,
    totalExpenses,
    totalCost,
    expenseBreakdown,
  };
}

// ─── שלב 2 ───────────────────────────────────────────────────────────────────

function round2(n: number): number { return Math.round(n * 100) / 100; }

export function calculateStep2(input: Step2Input): Step2Result {
  const {
    mortgageAmount,
    interestRate,
    loanTermYears,
    repaymentMethod,
    propertyValue,
    totalCost,
    earlyRepaymentYears,
  } = input;

  const r = interestRate / 100 / 12;   // ריבית חודשית
  const n = loanTermYears * 12;         // מספר חודשים כולל

  // ── נתונים בסיסיים ──────────────────────────────────────────────────────
  const financingRate   = (mortgageAmount / propertyValue) * 100;
  const requiredEquity  = totalCost - mortgageAmount;

  // ── משתנים שיאוכלסו לפי שיטה ────────────────────────────────────────────
  let monthlyPayment    = 0;
  let totalPayments     = 0;
  let totalInterest     = 0;
  let balloonPayment:      number | undefined;
  let remainingBalance:    number | undefined;
  let totalCostUntilExit:    number | undefined;
  let totalPaidUntilExit:    number | undefined;

  // משתנה עזר לבדיקה האם יש פירעון מוקדם תקין
  const hasEarlyRepayment = earlyRepaymentYears && earlyRepaymentYears > 0 && earlyRepaymentYears < loanTermYears;
  const k = hasEarlyRepayment ? earlyRepaymentYears * 12 : n;

  // ════════════════════════════════════════════════════════════════════════
  // שיטה 1 — שפיצר
  // ════════════════════════════════════════════════════════════════════════
  if (repaymentMethod === 'spitzer') {

    monthlyPayment = r === 0
      ? mortgageAmount / n
      : (mortgageAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    // חישוב לתקופה מלאה (ללא פירעון)
    totalPayments = monthlyPayment * n;
    totalInterest = totalPayments - mortgageAmount;

    if (hasEarlyRepayment) {
      // יתרת קרן לפירעון בחודש k
      remainingBalance = r === 0
        ? mortgageAmount * (n - k) / n
        : mortgageAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, k)) / (Math.pow(1 + r, n) - 1);

      totalPaidUntilExit  = monthlyPayment * k; // מה ששולם בשוטף עד היציאה
      totalCostUntilExit  = totalPaidUntilExit + remainingBalance; // סך הכל עלות בפועל כולל סגירה

      // עדכון המשתנים הראשיים כדי שהמשתמש יראה את "השורה התחתונה" החדשה שלו!
      totalPayments = totalCostUntilExit;
      totalInterest = totalPayments - mortgageAmount;
    }

  // ════════════════════════════════════════════════════════════════════════
  // שיטה 2 — בלון מלא
  // ════════════════════════════════════════════════════════════════════════
  } else if (repaymentMethod === 'full_balloon') {

    monthlyPayment = 0;

    const futureDebt = mortgageAmount * Math.pow(1 + r, n);
    balloonPayment   = futureDebt;
    totalPayments    = futureDebt;
    totalInterest    = futureDebt - mortgageAmount;

    if (hasEarlyRepayment) {
      const debtAtExit    = mortgageAmount * Math.pow(1 + r, k);
      remainingBalance    = debtAtExit;
      totalPaidUntilExit  = 0;
      totalCostUntilExit  = debtAtExit;

      // עדכון המשתנים הראשיים - מראה חיסכון עצום בריבית דריבית שנחתכה
      totalPayments = totalCostUntilExit;
      totalInterest = totalPayments - mortgageAmount;
    }

  // ════════════════════════════════════════════════════════════════════════
  // שיטה 3 — בלון חלקי
  // ════════════════════════════════════════════════════════════════════════
  } else if (repaymentMethod === 'partial_balloon') {

    monthlyPayment  = mortgageAmount * r;
    balloonPayment  = mortgageAmount;
    totalInterest   = monthlyPayment * n;
    totalPayments   = totalInterest + mortgageAmount;

    if (hasEarlyRepayment) {
      const interestPaid  = monthlyPayment * k;
      remainingBalance    = mortgageAmount;  // הקרן נשארת קבועה
      totalPaidUntilExit  = interestPaid;
      totalCostUntilExit  = interestPaid + mortgageAmount;

      // עדכון המשתנים הראשיים - חוסך את כל חודשי הריבית הנותרים
      totalPayments = totalCostUntilExit;
      totalInterest = totalPayments - mortgageAmount;
    }
  }

  // ── החזרת התוצאה ─────────────────────────────────────────────────────────
  return {
    financingRate:   round2(financingRate),
    requiredEquity:  Math.round(requiredEquity),

    monthlyPayment:  round2(monthlyPayment),
    totalPayments:   round2(totalPayments),
    totalInterest:   round2(totalInterest),

    balloonPayment:
      balloonPayment !== undefined ? round2(balloonPayment) : undefined,

    remainingBalance:
      remainingBalance !== undefined ? Math.round(remainingBalance) : undefined,

    totalPaidUntilExit:
      totalPaidUntilExit !== undefined ? Math.round(totalPaidUntilExit) : undefined,

    totalCostUntilExit:
      totalCostUntilExit !== undefined ? Math.round(totalCostUntilExit) : undefined,
  };
}
// ─── שלב 3 ───────────────────────────────────────────────────────────────────

export function calculateStep3(input: Step3Input): Step3Result {
  const adjustedMonthlyIncome = input.monthlyRent * (input.occupancyRate / 100);
  const totalMonthlyExpenses = input.expenses.reduce((sum, e) => {
    const amount = e.amount ?? 0;
    return sum + (e.frequency === 'annual' ? amount / 12 : amount);
  }, 0);
  const grossMonthlyCashFlow = adjustedMonthlyIncome - totalMonthlyExpenses; // NOI חודשי (ללא משכנתא)
  const netMonthlyCashFlow = grossMonthlyCashFlow - input.monthlyPayment;    // תזרים בפועל (כולל משכנתא)
  // תשואה ברוטו: שכ"ד שנתי ברוטו ÷ עלות הרכישה הכוללת
  const grossAnnualYield = ((adjustedMonthlyIncome * 12) / input.totalCost) * 100;
  // תשואה נטו: NOI שנתי (בניכוי כלל ההוצאות השנתיות, ללא משכנתא) ÷ עלות הרכישה הכוללת
  const netAnnualYield = ((grossMonthlyCashFlow * 12) / input.totalCost) * 100;
  return {
    adjustedMonthlyIncome: Math.round(adjustedMonthlyIncome),
    totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
    totalAnnualExpenses: Math.round(totalMonthlyExpenses * 12),
    grossMonthlyCashFlow: Math.round(grossMonthlyCashFlow),
    netMonthlyCashFlow: Math.round(netMonthlyCashFlow),
    grossAnnualYield: Math.round(grossAnnualYield * 100) / 100,
    netAnnualYield: Math.round(netAnnualYield * 100) / 100,
  };
}

// ─── שלב 4 ───────────────────────────────────────────────────────────────────

export function calculateStep4(input: Step4Input): Step4Result {
  const capitalGain = input.futureSalePrice - input.propertyValue;
  const totalRentCollected = input.adjustedMonthlyIncome * 12 * input.holdingYears;
  const totalOperatingExpenses = input.totalMonthlyExpenses * 12 * input.holdingYears;
  const totalMortgagePayments = input.monthlyPayment * 12 * input.holdingYears;
  const SALE_VAT_RATE = 1.18; // מע״מ 18%
  const totalSaleExpenses = input.saleExpenses.reduce((sum, e) => {
    // שורת תיווך באחוזים — חישוב אחוז × מחיר מכירה × מע״מ (זהה לחישוב בפרונט)
    if (e.unit === 'percent') {
      return sum + (e.amount ? Math.round(input.futureSalePrice * e.amount / 100 * SALE_VAT_RATE) : 0);
    }
    return sum + (e.amount ?? 0);
  }, 0);
  const grossProfit = input.futureSalePrice + totalRentCollected - input.propertyValue;
  const netProfit =
    grossProfit - totalOperatingExpenses - totalMortgagePayments - totalSaleExpenses;
  const totalROI = (netProfit / input.totalCost) * 100;
  const annualROI = totalROI / input.holdingYears;
  return {
    capitalGain: Math.round(capitalGain),
    totalRentCollected: Math.round(totalRentCollected),
    totalOperatingExpenses: Math.round(totalOperatingExpenses),
    totalMortgagePayments: Math.round(totalMortgagePayments),
    totalSaleExpenses: Math.round(totalSaleExpenses),
    grossProfit: Math.round(grossProfit),
    netProfit: Math.round(netProfit),
    totalROI: Math.round(totalROI * 100) / 100,
    annualROI: Math.round(annualROI * 100) / 100,
  };
}
