'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaDownload,
  FaCoins,
  FaCircleQuestion,
  FaArrowTrendUp,
  FaWallet,
  FaChartLine,
  FaChevronDown,
  FaPen,
} from 'react-icons/fa6';
import { generateSummaryPDF } from '@/lib/generateSummaryPDF';
import styles from './DealSummary.module.css';

const CalcStepIcon = () => (
  <svg width="20" height="20" viewBox="1255 164 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1262.25 167.625V167.664C1261.82 167.703 1261.43 167.742 1261 167.781V167.625C1261 167.039 1261.35 166.531 1261.74 166.18C1262.17 165.828 1262.76 165.516 1263.42 165.281C1264.75 164.773 1266.55 164.5 1268.5 164.5C1270.45 164.5 1272.25 164.773 1273.58 165.281C1274.24 165.516 1274.83 165.828 1275.26 166.18C1275.69 166.531 1276 167.039 1276 167.625V176.141C1276 176.727 1275.69 177.234 1275.26 177.625C1274.83 178.016 1274.24 178.328 1273.58 178.562C1273.38 178.68 1273.11 178.758 1272.88 178.797V177.508C1272.95 177.469 1273.07 177.43 1273.15 177.391C1273.73 177.195 1274.16 176.922 1274.44 176.688C1274.71 176.453 1274.75 176.258 1274.75 176.141V173.562C1274.4 173.758 1274.01 173.953 1273.58 174.109C1273.34 174.227 1273.11 174.305 1272.88 174.383V173.055C1272.95 173.016 1273.07 172.977 1273.15 172.977C1273.73 172.742 1274.16 172.508 1274.44 172.234C1274.67 172 1274.75 171.805 1274.75 171.688V169.422C1274.4 169.656 1274.01 169.812 1273.58 169.969C1273.11 170.164 1272.56 170.32 1271.94 170.438C1271.78 170.203 1271.59 170.047 1271.43 169.891C1271.23 169.695 1271 169.5 1270.77 169.344C1271.66 169.227 1272.48 169.031 1273.15 168.797C1273.73 168.602 1274.16 168.367 1274.44 168.133C1274.71 167.898 1274.75 167.703 1274.75 167.625C1274.75 167.547 1274.71 167.352 1274.44 167.117C1274.16 166.883 1273.73 166.648 1273.15 166.453C1271.98 166.023 1270.34 165.75 1268.5 165.75C1266.66 165.75 1265.02 166.023 1263.85 166.453C1263.27 166.648 1262.84 166.883 1262.56 167.117C1262.29 167.352 1262.25 167.547 1262.25 167.625ZM1257.25 172.625C1257.25 172.703 1257.29 172.898 1257.56 173.133C1257.84 173.367 1258.27 173.602 1258.85 173.797C1260.02 174.227 1261.66 174.5 1263.5 174.5C1265.34 174.5 1266.98 174.227 1268.15 173.797C1268.73 173.602 1269.16 173.367 1269.44 173.133C1269.71 172.898 1269.75 172.703 1269.75 172.625C1269.75 172.547 1269.71 172.352 1269.44 172.117C1269.16 171.883 1268.73 171.648 1268.15 171.453C1266.98 171.023 1265.34 170.75 1263.5 170.75C1261.66 170.75 1260.02 171.023 1258.85 171.453C1258.27 171.648 1257.84 171.883 1257.56 172.117C1257.29 172.352 1257.25 172.547 1257.25 172.625ZM1256 172.625C1256 172.039 1256.35 171.531 1256.74 171.18C1257.17 170.828 1257.76 170.516 1258.42 170.281C1259.75 169.773 1261.55 169.5 1263.5 169.5C1265.45 169.5 1267.25 169.773 1268.58 170.281C1269.24 170.516 1269.83 170.828 1270.26 171.18C1270.69 171.531 1271 172.039 1271 172.625V181.141C1271 181.727 1270.69 182.234 1270.26 182.625C1269.83 183.016 1269.24 183.328 1268.58 183.562C1267.25 184.07 1265.45 184.383 1263.5 184.383C1261.55 184.383 1259.75 184.07 1258.42 183.562C1257.76 183.328 1257.17 183.016 1256.74 182.625C1256.31 182.234 1256 181.727 1256 181.141V172.625ZM1269.75 174.422C1269.4 174.656 1269.01 174.812 1268.58 174.969C1267.25 175.477 1265.45 175.75 1263.5 175.75C1261.55 175.75 1259.75 175.477 1258.42 174.969C1257.99 174.812 1257.6 174.656 1257.25 174.422V176.688C1257.25 176.805 1257.33 177 1257.6 177.234C1257.84 177.469 1258.27 177.742 1258.85 177.938C1260.02 178.406 1261.66 178.68 1263.5 178.68C1265.34 178.68 1266.98 178.406 1268.15 177.938C1268.73 177.742 1269.16 177.469 1269.44 177.234C1269.67 177 1269.75 176.805 1269.75 176.688V174.422ZM1257.25 181.141C1257.25 181.258 1257.33 181.453 1257.6 181.688C1257.84 181.922 1258.27 182.195 1258.85 182.391C1260.02 182.859 1261.66 183.133 1263.5 183.133C1265.34 183.133 1266.98 182.859 1268.15 182.391C1268.73 182.195 1269.16 181.922 1269.44 181.688C1269.67 181.453 1269.75 181.258 1269.75 181.141V178.562C1269.4 178.758 1269.01 178.953 1268.58 179.109C1267.25 179.617 1265.45 179.93 1263.5 179.93C1261.55 179.93 1259.75 179.617 1258.42 179.109C1257.99 178.953 1257.6 178.758 1257.25 178.562V181.141Z" fill="currentColor"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DealData {
  // Step 1
  purchasePrice: number;
  totalPurchaseCost: number;   // purchasePrice + purchaseTax + additionalCosts
  buyingCosts: number;
  purchaseTax: number;
  additionalCosts: number;
  // Step 2
  mortgageAmount: number;
  monthlyMortgagePayment: number;
  equityInvested: number;
  interestRate: number;
  totalInterestPaid: number;
  remainingMortgageAtSale: number;
  // Step 3
  monthlyRent: number;
  monthlyExpenses: number;
  holdingPeriodYears: number;
  monthlyNOI: number;
  grossYield: number;
  netYield: number;
  // Step 4
  expectedSalePrice: number;
  sellingCosts: number;
  capitalGainsTax: number;
  capitalGainsTaxRate: number;
  annualAppreciation: number;
  renovationCosts: number;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatCurrency = (num: number) => {
  const abs = Math.round(Math.abs(num)).toLocaleString('he-IL', { maximumFractionDigits: 0 });
  return num < 0 ? `₪-${abs}` : `₪${abs}`;
};

const fv = (n: number) =>
  '₪ ' + new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 }).format(Math.round(Math.abs(n)));

const fmtPct = (n: number) => n.toFixed(2) + '%';

const safe = (n: number, fmt: (x: number) => string) => (n === 0 ? '—' : fmt(n));

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({ text, textColor }: { text: string; textColor?: string }) {
  const [on, setOn] = useState(false);
  return (
    <span className={styles.tooltipAnchor}>
      <span
        className={styles.tooltipIcon}
        onMouseEnter={() => setOn(true)}
        onMouseLeave={() => setOn(false)}
        onClick={() => setOn(v => !v)}
        role="button"
        tabIndex={0}
        aria-label="מידע נוסף"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOn(v => !v); }}
      >
        <FaCircleQuestion />
      </span>
      {on && <span className={styles.tooltipBox} style={textColor ? { color: textColor } : undefined}>{text}</span>}
    </span>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionItem({
  icon, title, onEdit, children,
}: {
  icon: React.ReactNode; title: string; onEdit: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.accordionItem}>
      <div
        className={styles.accordionHeader}
        role="button"
        tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(v => !v); }}
      >
        {/* RTL DOM order: first=rightmost, last=leftmost */}
        <div className={styles.accordionIconCircle}>{icon}</div>
        <p className={styles.accordionTitle}>{title}</p>
        <div className={styles.accordionControls}>
          {/* Within controls (RTL): first=rightmost=edit, last=leftmost=chevron */}
          <button
            type="button"
            className={styles.editPill}
            onClick={e => { e.stopPropagation(); onEdit(); }}
          >
            <FaPen size={12} />
            עריכה
          </button>
          <span className={`${styles.chevronCircle} ${open ? styles.open : ''}`}>
            <FaChevronDown />
          </span>
        </div>
      </div>
      {open && <div className={styles.accordionBody}>{children}</div>}
    </div>
  );
}

function DR({ label, value, color }: { label: string; value: string; color?: 'red' | 'green' }) {
  return (
    <div className={styles.dataRow}>
      {/* RTL: label = right, value = left, space-between */}
      <span className={styles.dataLabel}>{label}</span>
      <span className={`${styles.dataValue} ${color === 'red' ? styles.red : color === 'green' ? styles.green : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DealSummary({ dealData }: { dealData: DealData }) {
  const router = useRouter();

  const {
    purchasePrice, totalPurchaseCost, buyingCosts, purchaseTax, additionalCosts,
    mortgageAmount, monthlyMortgagePayment, equityInvested, interestRate, totalInterestPaid, remainingMortgageAtSale,
    monthlyRent, monthlyExpenses, holdingPeriodYears, monthlyNOI, grossYield, netYield,
    expectedSalePrice, sellingCosts, capitalGainsTax, capitalGainsTaxRate, annualAppreciation, renovationCosts,
  } = dealData;

  // ── Calculations ─────────────────────────────────────────────────────────
  const holdingMonths = holdingPeriodYears * 12;

  // 3. תזרים חודשי = הכנסה חודשית − החזר משכנתא − הוצאות חודשיות
  const monthlyCashflow = monthlyRent - monthlyMortgagePayment - monthlyExpenses;

  // תזרים מצטבר לכל תקופת ההחזקה
  const totalCashflowOverPeriod = monthlyCashflow * holdingMonths;

  // סך הוצאות מצטברות (הוצאות חודשיות × מספר חודשים — ללא משכנתא)
  const totalOperatingExpenses = monthlyExpenses * holdingMonths;

  // 1. רווח ברוטו = שווי מכירה − עלות רכישה כוללת (נכס + מס + עלויות)
  const grossAppreciation = expectedSalePrice - purchasePrice;

  // הון עצמי זמין = מחיר מכירה − יתרת משכנתא − עלויות מכירה
  const availableEquity = expectedSalePrice - remainingMortgageAtSale - sellingCosts;

  // רווח נטו = כלל הכנסות − כלל ההוצאות
  const totalRentalIncome = monthlyRent * holdingMonths;
  const totalIncome = expectedSalePrice + totalRentalIncome;
  const totalExpenses = totalPurchaseCost + totalInterestPaid + totalOperatingExpenses + sellingCosts + renovationCosts;
  const netProfit = totalIncome - totalExpenses;

  // ── Tooltip texts ─────────────────────────────────────────────────────────
  const heroTip =
    `רווח נטו צפוי = כלל הכנסות − כלל הוצאות\n\nהכנסות (${formatCurrency(totalIncome)}):\nמחיר מכירה: ${formatCurrency(expectedSalePrice)}\nשכירות: ${formatCurrency(monthlyRent)} × ${holdingMonths} חודשים = ${formatCurrency(totalRentalIncome)}\n\nהוצאות (${formatCurrency(totalExpenses)}):\nעלות רכישה: ${formatCurrency(totalPurchaseCost)}\nריבית משכנתא: ${formatCurrency(totalInterestPaid)}\nהוצאות השבחה: ${formatCurrency(renovationCosts)}\nאחזקה: ${formatCurrency(totalOperatingExpenses)}\nעלויות מכירה: ${formatCurrency(sellingCosts)}`;

  const cf = monthlyCashflow;
  const cashflowDisplay =
    cf === 0 ? '—'
    : cf > 0 ? '₪ ' + Math.round(cf).toLocaleString('he-IL') + '+'
    : '−₪ ' + Math.round(Math.abs(cf)).toLocaleString('he-IL');

  return (
    <div className={styles.wrapper} dir="rtl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>סיכום כדאיות עסקה</h1>
          <p className={styles.pageSubtitle}>
            ריכזנו עבורכם את כל נתוני העסקה, כולל הרווח הצפוי, התשואות והתזרים לאורך תקופת ההשקעה
          </p>
        </div>
        <div className={styles.buttonsGroup}>
          <a href="/#contact" className={styles.btnGold}>
            קביעת פגישת ייעוץ
          </a>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={() => generateSummaryPDF(dealData)}
          >
            <FaDownload size={14} />
            הורדת דוח מלא (PDF)
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className={styles.contentRow}>
        <div className={styles.innerColumn}>

          {/* Hero card */}
          <div className={styles.heroCard}>
            <div className={styles.iconCircleGold}><FaCoins size={18} /></div>
            <div className={styles.heroContent}>
              <p className={styles.heroLabel}>רווח נטו צפוי</p>
              <p className={styles.heroValue} style={netProfit < 0 ? { color: '#E63946' } : undefined}>
                {netProfit === 0 ? '—' : `₪${netProfit < 0 ? '-' : ''}${Math.abs(netProfit).toLocaleString()}`}
              </p>
            </div>
            <div className={styles.heroFooter}>
              <Tooltip text={heroTip} />
              <p className={styles.footerText}>רווח נטו בסיום תקופת ההשקעה</p>
            </div>
          </div>

          {/* 3 stat cards */}
          <div className={styles.statRow}>

            <div className={styles.statCard}>
              <div className={styles.statIconCircle}><FaArrowTrendUp size={17} /></div>
              <div className={styles.statTextBlock}>
                <p className={styles.statTitle}>סה״כ תזרים</p>
                <p
                  className={styles.statValue}
                  style={totalCashflowOverPeriod < 0 ? { color: '#E63946' } : undefined}
                >
                  {totalCashflowOverPeriod === 0
                    ? '—'
                    : totalCashflowOverPeriod > 0
                      ? `₪${Math.round(Math.abs(totalCashflowOverPeriod)).toLocaleString()}+`
                      : `₪-${Math.round(Math.abs(totalCashflowOverPeriod)).toLocaleString()}`}
                </p>
              </div>
              <div className={styles.statFooter}>
                <Tooltip text={`סה״כ תזרים = תזרים חודשי × מספר חודשים.\nתזרים חודשי: ${formatCurrency(monthlyCashflow)} (הכנסה חודשית פחות משכנתא ופחות הוצאות אחזקה)\n× ${holdingMonths} חודשים (${holdingPeriodYears} שנים)\n= ${formatCurrency(totalCashflowOverPeriod)} סה״כ`} />
                <p className={styles.statFooterText}>{monthlyCashflow >= 0 ? 'הרווח החודשי סה״כ' : 'ההפסד החודשי סה״כ'}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconCircle}><FaWallet size={17} /></div>
              <div className={styles.statTextBlock}>
                <p className={styles.statTitle}>הון עצמי זמין</p>
                <p
                  className={styles.statValue}
                  style={availableEquity < 0 ? { color: '#E63946' } : undefined}
                >
                  {availableEquity === 0
                    ? '—'
                    : `₪${availableEquity < 0 ? '-' : ''}${Math.round(Math.abs(availableEquity)).toLocaleString('he-IL')}`}
                </p>
              </div>
              <div className={styles.statFooter}>
                <Tooltip text={`הון עצמי זמין = כמה כסף נשאר ביד ביום המכירה\n\nמחיר מכירה: ${formatCurrency(expectedSalePrice)}\n− יתרת משכנתא לסילוק: ${formatCurrency(remainingMortgageAtSale)}\n− עלויות מכירה ומיסים: ${formatCurrency(sellingCosts)}\n= ${formatCurrency(availableEquity)}`} />
                <p className={styles.statFooterText}>ההון העצמי שישאר אחרי המכירה</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconCircle}><FaChartLine size={17} /></div>
              <div className={styles.statTextBlock}>
                <p className={styles.statTitle}>{grossAppreciation >= 0 ? 'רווח ברוטו (מעליית ערך)' : 'הפסד ברוטו (מעליית ערך)'}</p>
                <p
                  className={styles.statValue}
                  style={grossAppreciation < 0 ? { color: '#E63946' } : undefined}
                >
                  {grossAppreciation === 0
                    ? '—'
                    : `₪${grossAppreciation < 0 ? '-' : ''}${Math.round(Math.abs(grossAppreciation)).toLocaleString('he-IL')}`}
                </p>
              </div>
              <div className={styles.statFooter}>
                <Tooltip text={`רווח/הפסד ברוטו = מחיר מכירה פחות מחיר הקנייה המקורי\n\nמחיר מכירה: ${formatCurrency(expectedSalePrice)}\nמחיר קנייה: ${formatCurrency(purchasePrice)}\n= ${formatCurrency(grossAppreciation)}`} />
                <p className={styles.statFooterText}>{grossAppreciation >= 0 ? 'רווח ממכירה פחות מחיר קנייה' : 'הפסד ממכירה פחות מחיר קנייה'}</p>
              </div>
            </div>

          </div>

          {/* 4 accordion rows */}
          <div className={styles.accordionList}>

            {/* Step 1 */}
            <AccordionItem
              icon={<CalcStepIcon />}
              title="פרטי הנכס ועלויות רכישה"
              onEdit={() => router.push('/calculator/step1')}
            >
              <DR label="מחיר קנייה"              value={fv(purchasePrice)} />
              <DR label="מס רכישה"              value={fv(purchaseTax)} />
              <DR label="עלויות נוספות"         value={fv(additionalCosts)} />
              <DR label="עלות רכישה כוללת"      value={fv(totalPurchaseCost)} />
            </AccordionItem>

            {/* Step 2 */}
            <AccordionItem
              icon={<CalcStepIcon />}
              title="מימון ומשכנתא"
              onEdit={() => router.push('/calculator/step2')}
            >
              <DR label="סכום משכנתא"       value={fv(mortgageAmount)} />
              <DR label="הון עצמי"           value={fv(equityInvested)} />
              <DR label="ריבית שנתית"        value={`${interestRate}%`} />
              <DR label="החזר חודשי"         value={fv(monthlyMortgagePayment)} />
              <DR label="סה״כ ריבית"         value={fv(totalInterestPaid)} />
              <DR label="יתרת משכנתא במכירה" value={fv(remainingMortgageAtSale)} />
            </AccordionItem>

            {/* Step 3 */}
            <AccordionItem
              icon={<CalcStepIcon />}
              title="הכנסות והוצאות שוטפות"
              onEdit={() => router.push('/calculator/step3')}
            >
              <DR label="שכ״ד חודשי"               value={fv(monthlyRent)} />
              <DR label="הוצאות חודשיות"            value={fv(monthlyExpenses)} />
              <DR label="NOI חודשי"                 value={fv(monthlyNOI)} />
              <DR
                label="תזרים חודשי נטו"
                value={cashflowDisplay}
                color={cf < 0 ? 'red' : cf > 0 ? 'green' : undefined}
              />
              <DR label="תשואה ברוטו" value={fmtPct(grossYield)} />
              <DR label="תשואה נטו על הון עצמי" value={fmtPct(netYield)} color={netYield < 0 ? 'red' : undefined} />
            </AccordionItem>

            {/* Step 4 */}
            <AccordionItem
              icon={<CalcStepIcon />}
              title="מכירה עתידית ורווח"
              onEdit={() => router.push('/calculator/step4')}
            >
              <DR label="מחיר מכירה צפוי"       value={fv(expectedSalePrice)} />
              <DR label={`מס שבח (${capitalGainsTaxRate}%)`} value={capitalGainsTax === 0 ? 'פטור' : fv(capitalGainsTax)} />
              {renovationCosts > 0 && <DR label="עלויות השבחה"  value={fv(renovationCosts)} />}
              <DR label="עלויות מכירה כוללות"   value={fv(sellingCosts)} />
              <DR label="תקופת החזקה"            value={`${holdingPeriodYears} שנים`} />
              {annualAppreciation > 0 && <DR label="עליית ערך שנתית" value={`${annualAppreciation}%`} />}
              <DR
                label="תזרים מצטבר"
                value={fv(totalCashflowOverPeriod)}
                color={totalCashflowOverPeriod < 0 ? 'red' : 'green'}
              />
              <DR
                label="רווח נטו סופי"
                value={fv(netProfit)}
                color={netProfit < 0 ? 'red' : 'green'}
              />
            </AccordionItem>

          </div>
        </div>
      </div>
    </div>
  );
}
