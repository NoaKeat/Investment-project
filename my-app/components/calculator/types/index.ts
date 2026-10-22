// Mirror of server/src/types/calculator.ts
// עדכן את שני הקבצים ביחד כשמשנים types

export type PropertyType =
  | 'first_apartment'
  | 'second_apartment'
  | 'land'
  | 'commercial'
  | 'other';

export type MortgageType =
  | 'prime'
  | 'fixed_unlinked'
  | 'fixed_linked'
  | 'variable_linked'
  | 'variable_5y'
  | 'other';

export type RepaymentMethod = 'spitzer' | 'full_balloon' | 'partial_balloon';

export interface PurchaseExpense {
  id: string;
  type: string;   // 'renovation' מקבל +10% בצ"מ
  label: string;
  amount: number | null;
}

export interface OperatingExpense {
  id: string;
  label: string;
  amount: number | null;
  frequency: 'monthly' | 'annual';
}

export interface SaleExpense {
  id: string;
  label: string;
  amount: number | null;
  unit?: 'auto' | 'percent' | 'ils'; // percent = תיווך באחוזים (יחושב × מחיר מכירה × מע״מ)
}

export interface Step1Input {
  propertyValue: number;
  propertyType: PropertyType;
  expenses: PurchaseExpense[];
}

export interface Step2Input {
  propertyValue: number;
  totalCost: number;
  mortgageAmount: number;
  repaymentMethod: RepaymentMethod;
  interestRate: number;
  loanTermYears: number;
  earlyRepaymentYears?: number;
}

export interface Step3Input {
  propertyValue: number;
  totalCost: number;
  monthlyPayment: number;
  monthlyRent: number;
  occupancyRate: number;
  expenses: OperatingExpense[];
}

export interface Step4Input {
  propertyValue: number;
  totalCost: number;
  monthlyPayment: number;
  adjustedMonthlyIncome: number;
  totalMonthlyExpenses: number;
  futureSalePrice: number;
  holdingYears: number;
  saleExpenses: SaleExpense[];
}

export interface Step1ExpenseBreakdown {
  id: string;
  type: string;
  label: string;
  baseAmount: number;
  adjustedAmount: number;
  hasSurcharge: boolean;
}

export interface Step1Result {
  purchaseTaxAmount: number;
  totalExpenses: number;
  totalCost: number;
  expenseBreakdown: Step1ExpenseBreakdown[];
}

export interface Step2Result {
  financingRate: number;
  requiredEquity: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  balloonPayment?: number;
  remainingBalance?: number;
  totalPaidUntilExit?: number;
  totalCostUntilExit?: number;
}

export interface Step3Result {
  adjustedMonthlyIncome: number;
  totalMonthlyExpenses: number;
  totalAnnualExpenses: number;
  grossMonthlyCashFlow: number;
  netMonthlyCashFlow: number;
  grossAnnualYield: number;
  netAnnualYield: number;
}

export interface Step4Result {
  capitalGain: number;
  totalRentCollected: number;
  totalOperatingExpenses: number;
  totalMortgagePayments: number;
  totalSaleExpenses: number;
  grossProfit: number;
  netProfit: number;
  totalROI: number;
  annualROI: number;
}

// ─── הוצאות רכישה — רשימת הבחירות ───────────────────────────────────────────

export const PURCHASE_EXPENSE_OPTIONS = [
  { id: 'broker',           label: 'תיווך רכישה' },
  { id: 'lawyer',           label: 'עורך דין קונה' },
  { id: 'other',            label: 'אחר' },
  { id: 'appraiser',        label: 'שמאי' },
  { id: 'mortgage_advisor', label: 'יועץ משכנתאות' },
  { id: 'registration',     label: 'אגרת רישום' },
  { id: 'renovation',       label: 'שיפוץ וריהוט' },
] as const;

export type ExpenseOptionId = typeof PURCHASE_EXPENSE_OPTIONS[number]['id'];
