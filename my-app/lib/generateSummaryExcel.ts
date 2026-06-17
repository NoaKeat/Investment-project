import * as XLSX from 'xlsx';
import type { DealData } from '@/components/calculator/components/DealSummary';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cell(v: string | number, bold = false, bg?: string): XLSX.CellObject {
  const c: XLSX.CellObject = {
    v,
    t: typeof v === 'number' ? 'n' : 's',
    s: {
      font: { bold, name: 'Calibri', sz: 11 },
      alignment: { horizontal: 'right', readingOrder: 2 },
      ...(bg ? { fill: { fgColor: { rgb: bg }, patternType: 'solid' } } : {}),
    },
  };
  return c;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function generateSummaryExcel(dealData: DealData): void {
  const {
    purchasePrice, totalPurchaseCost, purchaseTax, additionalCosts,
    mortgageAmount, monthlyMortgagePayment, equityInvested, interestRate,
    totalInterestPaid, remainingMortgageAtSale,
    monthlyRent, monthlyExpenses, holdingPeriodYears, monthlyNOI, grossYield, netYield,
    expectedSalePrice, sellingCosts, capitalGainsTax, capitalGainsTaxRate,
    annualAppreciation, renovationCosts,
  } = dealData;

  const holdingMonths = holdingPeriodYears * 12;
  const monthlyCashflow = monthlyRent - monthlyMortgagePayment - monthlyExpenses;
  const totalCashflowOverPeriod = monthlyCashflow * holdingMonths;
  const totalOperatingExpenses = monthlyExpenses * holdingMonths;
  const grossAppreciation = expectedSalePrice - purchasePrice;
  const totalRentalIncome = monthlyRent * holdingMonths;
  const totalIncome = expectedSalePrice + totalRentalIncome;
  const totalExpenses = totalPurchaseCost + totalInterestPaid + totalOperatingExpenses + sellingCosts;
  const netProfit = totalIncome - totalExpenses;
  const availableEquity = expectedSalePrice - remainingMortgageAtSale - sellingCosts;

  const today = new Date().toLocaleDateString('en-GB');

  // ── Worksheet ────────────────────────────────────────────────────────────────

  const ws: XLSX.WorkSheet = {};

  // Helper: set a cell by row/col (0-based)
  const set = (r: number, c: number, obj: XLSX.CellObject) => {
    ws[XLSX.utils.encode_cell({ r, c })] = obj;
  };

  // ── Section adder ─────────────────────────────────────────────────────────

  type Row = [string, string | number | null];

  let row = 0;

  const addHeader = (title: string) => {
    set(row, 0, cell(title, true, 'D6DCF5'));
    set(row, 1, cell('', false, 'D6DCF5'));
    row++;
  };

  const addRow = (label: string, value: string | number | null) => {
    set(row, 0, cell(label));
    if (value !== null) {
      set(row, 1, cell(typeof value === 'number' ? Math.round(value) : value));
    }
    row++;
  };

  const addBlank = () => { row++; };

  // ── Company header ─────────────────────────────────────────────────────────

  set(0, 0, cell("מולי פשורסקי | נדל\"ן והשקעות", true));
  set(0, 1, cell(''));
  set(0, 2, cell(today));
  row = 1;
  addBlank();

  // ── מסקנות עיקריות ─────────────────────────────────────────────────────────

  addHeader('מסקנות עיקריות');
  addRow('רווח נטו צפוי (₪)', netProfit);
  addRow('הון עצמי זמין (₪)', availableEquity);
  addRow('סה״כ תזרים (₪)', totalCashflowOverPeriod);
  addRow(grossAppreciation >= 0 ? 'רווח ברוטו — מעליית ערך (₪)' : 'הפסד ברוטו — מעליית ערך (₪)', grossAppreciation);
  addBlank();

  // ── שלב 1 ──────────────────────────────────────────────────────────────────

  addHeader('שלב 1 — פרטי הנכס ועלויות רכישה');
  addRow('שווי נכס (₪)', purchasePrice);
  addRow('מס רכישה (₪)', purchaseTax);
  addRow('עלויות נוספות (₪)', additionalCosts);
  addRow('עלות רכישה כוללת (₪)', totalPurchaseCost);
  addBlank();

  // ── שלב 2 ──────────────────────────────────────────────────────────────────

  addHeader('שלב 2 — מימון ומשכנתא');
  addRow('גובה משכנתא (₪)', mortgageAmount);
  addRow('הון עצמי (₪)', equityInvested);
  addRow('ריבית שנתית (%)', interestRate);
  addRow('החזר חודשי (₪)', monthlyMortgagePayment);
  addRow('סה״כ ריבית לתקופה (₪)', totalInterestPaid);
  addRow('יתרת משכנתא במכירה (₪)', remainingMortgageAtSale);
  addBlank();

  // ── שלב 3 ──────────────────────────────────────────────────────────────────

  addHeader('שלב 3 — הכנסות והוצאות שוטפות');
  addRow('שכירות חודשית (₪)', monthlyRent);
  addRow('הוצאות חודשיות (₪)', monthlyExpenses);
  addRow('תזרים חודשי נטו (₪)', monthlyCashflow);
  addRow('הכנסת שכירות כוללת לתקופה (₪)', totalRentalIncome);
  addRow('הוצאות תפעול כולל לתקופה (₪)', totalOperatingExpenses);
  addRow('תשואה ברוטו (%)', grossYield);
  addRow('תשואה נטו (%)', netYield);
  addRow('תקופת החזקה (שנים)', holdingPeriodYears);
  addBlank();

  // ── שלב 4 ──────────────────────────────────────────────────────────────────

  addHeader('שלב 4 — מכירה עתידית ורווח');
  addRow('מחיר מכירה (₪)', expectedSalePrice);
  addRow('עלויות מכירה (₪)', sellingCosts);
  addRow('מס שבח (₪)', capitalGainsTax);
  addRow('שיעור מס שבח (%)', capitalGainsTaxRate);
  addRow('עליית ערך שנתית (%)', annualAppreciation);
  addRow('עלויות שיפוץ (₪)', renovationCosts);

  // ── Sheet metadata ──────────────────────────────────────────────────────────

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row - 1, c: 2 } });
  ws['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 14 }];
  ws['!views'] = [{ rightToLeft: true }];

  // ── Workbook ────────────────────────────────────────────────────────────────

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'סיכום כדאיות עסקה');
  XLSX.writeFile(wb, 'סיכום_עסקה.xlsx', { cellStyles: true });
}
