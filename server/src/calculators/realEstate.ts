import type {
  Step1Input, Step1Result, Step1ExpenseBreakdown,
  Step2Input, Step2Result,
  Step3Input, Step3Result,
  Step4Input, Step4Result,
} from '../types/calculator.js';

// ─── מס רכישה מדורג ──────────────────────────────────────────────────────────

interface TaxBracket {
  from: number;
  to: number;   // Infinity לסוף הסולם
  rate: number; // ערך עשרוני (0.035 = 3.5%)
}

const FIRST_APARTMENT_BRACKETS: TaxBracket[] = [
  { from: 0,          to: 1_978_745,  rate: 0     },
  { from: 1_978_745,  to: 2_347_040,  rate: 0.035 },
  { from: 2_347_040,  to: 6_055_070,  rate: 0.05  },
  { from: 6_055_070,  to: Infinity,   rate: 0.08  },
];

const SECOND_APARTMENT_BRACKETS: TaxBracket[] = [
  { from: 0,          to: 6_055_070,  rate: 0.08  },
  { from: 6_055_070,  to: Infinity,   rate: 0.10  },
];

/**
 * מחשב מס רכישה מדורג — כמו מס הכנסה.
 * כל מדרגה מחושבת על החלק שבתוכה בלבד.
 *
 * בדיקות:
 *   calculatePurchaseTax(1_000_000, 'first_apartment')   === 0
 *   calculatePurchaseTax(2_000_000, 'first_apartment')   === 744   (21,255 × 3.5%)
 *   calculatePurchaseTax(10_000_000, 'first_apartment')  === 513_886
 *   calculatePurchaseTax(2_000_000, 'second_apartment')  === 160_000
 *   calculatePurchaseTax(10_000_000, 'second_apartment') === 878_899
 *
 * הערה: בדיקה 2 בפרומפט (755 ₪) אינה מדויקת — הערך המחושב הנכון הוא 744 ₪.
 */
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

export function calculateStep2(input: Step2Input): Step2Result {
  const financingRate = (input.mortgageAmount / input.propertyValue) * 100;
  const r = input.interestRate / 100 / 12;
  const n = input.loanTermYears * 12;
  const monthlyPayment =
    r === 0
      ? input.mortgageAmount / n
      : (input.mortgageAmount * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1);
  const totalPayments = monthlyPayment * n;
  const totalInterest = totalPayments - input.mortgageAmount;
  return {
    financingRate: Math.round(financingRate * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayments: Math.round(totalPayments * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

// ─── שלב 3 ───────────────────────────────────────────────────────────────────

export function calculateStep3(input: Step3Input): Step3Result {
  const adjustedMonthlyIncome = input.monthlyRent * (input.occupancyRate / 100);
  const totalMonthlyExpenses = input.expenses.reduce((sum, e) => {
    const amount = e.amount ?? 0;
    return sum + (e.frequency === 'annual' ? amount / 12 : amount);
  }, 0);
  const grossMonthlyCashFlow = adjustedMonthlyIncome - totalMonthlyExpenses;
  const netMonthlyCashFlow = grossMonthlyCashFlow - input.monthlyPayment;
  const grossAnnualYield = ((adjustedMonthlyIncome * 12) / input.totalCost) * 100;
  const netAnnualYield = ((netMonthlyCashFlow * 12) / input.totalCost) * 100;
  return {
    adjustedMonthlyIncome: Math.round(adjustedMonthlyIncome),
    totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
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
  const totalSaleExpenses = input.saleExpenses.reduce(
    (sum, e) => sum + (e.amount ?? 0),
    0
  );
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
