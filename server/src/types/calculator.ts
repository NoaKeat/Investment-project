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

export interface PurchaseExpense {
  id: string;
  // סוג ההוצאה — 'renovation' מקבל +10% בצ"מ בחישוב
  type: string;
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
}

// פירוט הוצאה אחת בתוצאת שלב 1
export interface Step1ExpenseBreakdown {
  id: string;
  type: string;
  label: string;
  baseAmount: number;      // הסכום שהמשתמש הזין
  adjustedAmount: number;  // baseAmount × 1.1 לשיפוץ, אחרת = baseAmount
  hasSurcharge: boolean;   // true רק לשיפוץ
}

// קלט לכל שלב
export interface Step1Input {
  propertyValue: number;
  propertyType: PropertyType;
  expenses: PurchaseExpense[];
}

export interface Step2Input {
  propertyValue: number;
  equity: number;
  mortgageAmount: number;
  mortgageType: MortgageType;
  interestRate: number;
  loanTermYears: number;
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

// תוצאות לכל שלב
export interface Step1Result {
  purchaseTaxAmount: number;       // מס רכישה בשקלים (חישוב מדורג)
  totalExpenses: number;           // סכום כל ההוצאות הנוספות (כולל בצ"מ)
  totalCost: number;               // שווי נכס + מס רכישה + הוצאות
  expenseBreakdown: Step1ExpenseBreakdown[]; // פירוט לתצוגה
}

export interface Step2Result {
  financingRate: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
}

export interface Step3Result {
  adjustedMonthlyIncome: number;
  totalMonthlyExpenses: number;
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
