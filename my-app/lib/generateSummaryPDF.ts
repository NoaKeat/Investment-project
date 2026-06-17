import type { DealData } from '@/components/calculator/components/DealSummary';
import type { PDFFont, PDFPage } from 'pdf-lib';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  latinReg: PDFFont;
  latinBold: PDFFont;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fc(n: number): string {
  if (!n && n !== 0) return '--';
  const abs = Math.abs(Math.round(n)).toLocaleString('he-IL');
  return n < 0 ? `-${abs} שח` : `${abs} שח`;
}

function pct(n: number): string {
  return `${(n ?? 0).toFixed(2)}%`;
}

function safe(n: number | undefined): number { return n ?? 0; }

/**
 * Reverse word order so Hebrew strings render correctly in pdf-lib (which draws LTR).
 * "סיכום כדאיות עסקה" → drawn as "עסקה כדאיות סיכום" → visually reads RTL: סיכום כדאיות עסקה ✓
 * Numbers, ₪, and punctuation stay attached to their adjacent words — word-level reversal only.
 * Do NOT apply to values (₪ + digits) — those are LTR and correct as-is.
 */
function ph(text: string): string {
  return text.split(' ').reverse().join(' ');
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

function hex(h: string) {
  const n = parseInt(h.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

const NAVY  = hex('#252A62');
const GOLD  = hex('#E5B260');
const GREY  = hex('#718096');
const BLACK = hex('#1A1B3A');
const WHITE = { r: 1, g: 1, b: 1 };
const ALTBG = hex('#F9F9FC');

// ─── Page / layout constants ──────────────────────────────────────────────────

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_L = 40;
const MARGIN_R = 40;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

// ─── Font loader ──────────────────────────────────────────────────────────────

async function loadFonts(pdfDoc: import('pdf-lib').PDFDocument): Promise<Fonts> {
  // TTF (לא WOFF) — pdf-lib/fontkit לא מרנדר WOFF subset נכון, רק TTF/OTF
  const [hrReg, hrBold, laReg, laBold] = await Promise.all([
    fetch('/fonts/heebo-hebrew-400-normal.ttf').then(r => r.arrayBuffer()),
    fetch('/fonts/heebo-hebrew-700-normal.ttf').then(r => r.arrayBuffer()),
    fetch('/fonts/heebo-latin-400-normal.ttf').then(r => r.arrayBuffer()),
    fetch('/fonts/heebo-latin-700-normal.ttf').then(r => r.arrayBuffer()),
  ]);
  return {
    regular:   await pdfDoc.embedFont(hrReg),
    bold:      await pdfDoc.embedFont(hrBold),
    latinReg:  await pdfDoc.embedFont(laReg),
    latinBold: await pdfDoc.embedFont(laBold),
  };
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function drawRect(
  page: PDFPage,
  x: number, y: number, w: number, h: number,
  color: { r: number; g: number; b: number }
) {
  const { rgb } = require('pdf-lib');  // eslint-disable-line @typescript-eslint/no-var-requires
  page.drawRectangle({ x, y, width: w, height: h, color: rgb(color.r, color.g, color.b) });
}

/**
 * Returns true for characters that live in the Hebrew WOFF subset:
 *   U+0307-0308  Hebrew combining diacritics
 *   U+0590-05FF  Hebrew block (letters, punctuation, vowels)
 *   U+200C-2010  Zero-width / non-breaking chars
 *   U+20AA       ₪ SHEKEL SIGN  ← key character
 *   U+25CC       Dotted circle
 *   U+FB1D-FB4F  Hebrew presentation forms
 * Everything else (digits, ASCII punctuation, %, (, )) → Latin subset.
 */
function needsHebrewFont(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return (
    (c >= 0x0307 && c <= 0x0308) ||
    (c >= 0x0590 && c <= 0x05FF) ||
    (c >= 0x200C && c <= 0x2010) ||
    c === 0x20AA ||                   // ₪
    c === 0x25CC ||
    (c >= 0xFB1D && c <= 0xFB4F)
  );
}

/**
 * Draw a string that may mix Hebrew and Latin characters.
 * Splits the string into font-homogeneous runs and draws each run
 * with the correct font (Hebrew for ₪ + Hebrew letters; Latin for
 * digits, %, (, ), punctuation, etc.).
 *
 * rightAlign=true → total width is measured first, then drawing
 * starts at x - totalWidth (so the string ends at x).
 */
function drawMixed(
  page: PDFPage,
  text: string,
  x: number, y: number,
  hebrewFont: PDFFont,
  latinFont: PDFFont,
  size: number,
  color: { r: number; g: number; b: number } = BLACK,
  rightAlign = false
): void {
  const { rgb } = require('pdf-lib');  // eslint-disable-line @typescript-eslint/no-var-requires
  const col = rgb(color.r, color.g, color.b);

  // Build font-homogeneous segments
  const segments: { text: string; hebrew: boolean }[] = [];
  for (const ch of text) {
    const hebrew = needsHebrewFont(ch);
    const last = segments[segments.length - 1];
    if (last && last.hebrew === hebrew) {
      last.text += ch;
    } else {
      segments.push({ text: ch, hebrew });
    }
  }

  const widthOf = (seg: { text: string; hebrew: boolean }) =>
    (seg.hebrew ? hebrewFont : latinFont).widthOfTextAtSize(seg.text, size);

  let cx = rightAlign
    ? x - segments.reduce((sum, s) => sum + widthOf(s), 0)
    : x;

  for (const seg of segments) {
    const font = seg.hebrew ? hebrewFont : latinFont;
    page.drawText(seg.text, { x: cx, y, font, size, color: col });
    cx += widthOf(seg);
  }
}

// ─── Section header bar ───────────────────────────────────────────────────────

function drawSectionHeader(
  page: PDFPage,
  fonts: Fonts,
  label: string,
  y: number,
  bg: { r: number; g: number; b: number } = NAVY
): number {
  const H = 18;
  drawRect(page, MARGIN_L, y - 4, CONTENT_W, H, bg);
  drawMixed(page, ph(label), MARGIN_L + CONTENT_W - 4, y + 2, fonts.bold, fonts.latinBold, 11, WHITE, true);
  return y - H - 6;
}

// ─── KPI summary block (4 prominent cards) ────────────────────────────────────

interface KPICard { label: string; value: string; hero?: boolean }

function drawKPIBlock(
  page: PDFPage,
  fonts: Fonts,
  cards: KPICard[],
  startY: number
): number {
  const { rgb } = require('pdf-lib');  // eslint-disable-line @typescript-eslint/no-var-requires
  const CARD_H  = 46;
  const GAP     = 6;

  let y = startY;

  cards.forEach((card) => {
    const bg      = card.hero ? NAVY : hex('#F0F4FF');
    const lblCol  = card.hero ? { r: 0.78, g: 0.78, b: 0.88 } : GREY;
    const valCol  = card.hero ? WHITE : NAVY;

    drawRect(page, MARGIN_L, y - CARD_H, CONTENT_W, CARD_H, bg);

    // label — top-right inside card
    drawMixed(page, ph(card.label),
      MARGIN_L + CONTENT_W - 10, y - 10,
      fonts.regular, fonts.latinReg, 9, lblCol, true);

    // value — bottom-right, large
    drawMixed(page, card.value,
      MARGIN_L + CONTENT_W - 10, y - CARD_H + 8,
      card.hero ? fonts.bold : fonts.bold,
      card.hero ? fonts.latinBold : fonts.latinBold,
      card.hero ? 18 : 14, valCol, true);

    y -= CARD_H + GAP;
  });

  return y - 4;
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface TableRow { label: string; value: string; highlight?: boolean }

function drawTable(
  page: PDFPage,
  fonts: Fonts,
  rows: TableRow[],
  startY: number
): number {
  const { rgb } = require('pdf-lib');  // eslint-disable-line @typescript-eslint/no-var-requires
  const ROW_H   = 20;
  const COL1_W  = 130; // value column (left side visually → x = MARGIN_L)
  const COL2_W  = CONTENT_W - COL1_W;
  const FONT_SZ = 10;

  let y = startY;
  rows.forEach((row, i) => {
    const bg = row.highlight ? NAVY : i % 2 === 1 ? ALTBG : WHITE;
    const textColor = row.highlight ? WHITE : BLACK;
    const valColor  = row.highlight ? WHITE : NAVY;

    // row background
    drawRect(page, MARGIN_L, y - ROW_H + 4, CONTENT_W, ROW_H, bg);

    // label — right-aligned, may contain ASCII punctuation/digits alongside Hebrew
    drawMixed(page, row.label,
      MARGIN_L + CONTENT_W - 6, y - ROW_H + 8,
      row.highlight ? fonts.bold : fonts.regular,
      row.highlight ? fonts.latinBold : fonts.latinReg,
      FONT_SZ, textColor, true);

    // value — left-aligned, contains ₪ (Hebrew font) + digits/punctuation (Latin font)
    drawMixed(page, row.value,
      MARGIN_L + 6, y - ROW_H + 8,
      row.highlight ? fonts.bold : fonts.regular,
      row.highlight ? fonts.latinBold : fonts.latinReg,
      FONT_SZ, valColor);

    // bottom border
    if (!row.highlight) {
      page.drawLine({
        start: { x: MARGIN_L, y: y - ROW_H + 4 },
        end:   { x: MARGIN_L + CONTENT_W, y: y - ROW_H + 4 },
        thickness: 0.3,
        color: rgb(0.9, 0.9, 0.9),
      });
    }

    y -= ROW_H;
  });

  return y - 6;
}

// ─── Page factory ─────────────────────────────────────────────────────────────

function addPage(pdfDoc: import('pdf-lib').PDFDocument, fonts: Fonts, pageNum: number): { page: PDFPage; nextY: number } {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  const DIM = { r: 0.78, g: 0.78, b: 0.85 };

  // Header bar
  drawRect(page, 0, PAGE_H - 30, PAGE_W, 30, NAVY);
  drawMixed(page, ph('סיכום כדאיות עסקה'), PAGE_W - 14, PAGE_H - 20, fonts.bold,     fonts.latinBold, 13, GOLD, true);
  drawMixed(page, ph('מולי פשורסקי | נדל"ן והשקעות'), 14, PAGE_H - 20, fonts.regular, fonts.latinReg,  9,  DIM);

  // Footer bar
  drawRect(page, 0, 0, PAGE_W, 22, NAVY);
  drawMixed(page, new Date().toLocaleDateString('en-GB'), 14, 7, fonts.regular, fonts.latinReg, 8, DIM);
  drawMixed(page, ph(`עמוד ${pageNum}`), PAGE_W - 14, 7, fonts.regular, fonts.latinReg, 8, DIM, true);

  return { page, nextY: PAGE_H - 48 };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateSummaryPDF(dealData: DealData): Promise<void> {
  const { PDFDocument, rgb } = await import('pdf-lib');
  const fontkit = (await import('@pdf-lib/fontkit')).default;

  const d = dealData;

  // ── Calculations (matching DealSummary.tsx) ──────────────────────────────────
  const holdingMonths           = safe(d.holdingPeriodYears) * 12;
  const monthlyCashflow         = safe(d.monthlyRent) - safe(d.monthlyMortgagePayment) - safe(d.monthlyExpenses);
  const totalCashflowOverPeriod = monthlyCashflow * holdingMonths;
  const totalOperatingExpenses  = safe(d.monthlyExpenses) * holdingMonths;
  const grossAppreciation       = safe(d.expectedSalePrice) - safe(d.purchasePrice);
  const totalRentalIncome       = safe(d.monthlyRent) * holdingMonths;
  const totalIncome             = safe(d.expectedSalePrice) + totalRentalIncome;
  const totalExpenses           = safe(d.totalPurchaseCost) + safe(d.totalInterestPaid) + totalOperatingExpenses + safe(d.sellingCosts);
  const netProfit               = totalIncome - totalExpenses;
  const availableEquity         = safe(d.expectedSalePrice) - safe(d.remainingMortgageAtSale) - safe(d.sellingCosts);

  // ── PDF setup ────────────────────────────────────────────────────────────────
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fonts = await loadFonts(pdfDoc);

  let pageNum = 1;
  let { page, nextY: y } = addPage(pdfDoc, fonts, pageNum);

  const ensureY = (needed: number): void => {
    if (y - needed < 30) {
      pageNum++;
      const np = addPage(pdfDoc, fonts, pageNum);
      page = np.page;
      y = np.nextY;
    }
  };

  // ── Subtitle ──────────────────────────────────────────────────────────────────
  drawMixed(page,
    ph('ריכזנו עבורכם את כל נתוני העסקה, כולל הרווח הצפוי, התשואות והתזרים לאורך תקופת ההשקעה'),
    MARGIN_L + CONTENT_W, y, fonts.regular, fonts.latinReg, 9, GREY, true
  );
  y -= 18;

  // ══ מסקנות עיקריות ═══════════════════════════════════════════════════════════

  y = drawSectionHeader(page, fonts, 'מסקנות עיקריות', y, NAVY);

  y = drawKPIBlock(page, fonts, [
    { label: 'רווח נטו צפוי',                                                                   value: fc(netProfit),              hero: true },
    { label: 'הון עצמי זמין',                                                                   value: fc(availableEquity) },
    { label: 'סה״כ תזרים',                                                                      value: fc(totalCashflowOverPeriod) },
    { label: grossAppreciation >= 0 ? 'רווח ברוטו (מעליית ערך)' : 'הפסד ברוטו (מעליית ערך)', value: fc(grossAppreciation) },
  ], y);

  y -= 10;

  // ══ שלב 1 — פרטי הנכס ועלויות רכישה ════════════════════════════════════════

  ensureY(80);
  y = drawSectionHeader(page, fonts, 'שלב 1 — פרטי הנכס ועלויות רכישה', y, GOLD);

  y = drawTable(page, fonts, [
    { label: ph('שווי נכס'),           value: fc(safe(d.purchasePrice)) },
    { label: ph('מס רכישה'),          value: fc(safe(d.purchaseTax)) },
    { label: ph('עלויות נוספות'),     value: fc(safe(d.additionalCosts)) },
    { label: ph('עלות רכישה כוללת'), value: fc(safe(d.totalPurchaseCost)), highlight: true },
  ], y);

  y -= 10;

  // ══ שלב 2 — מימון ומשכנתא ════════════════════════════════════════════════════

  ensureY(120);
  y = drawSectionHeader(page, fonts, 'שלב 2 — מימון ומשכנתא', y, GOLD);

  y = drawTable(page, fonts, [
    { label: ph('גובה משכנתא'),              value: fc(safe(d.mortgageAmount)) },
    { label: ph('הון עצמי'),                value: fc(safe(d.equityInvested)) },
    { label: ph('ריבית שנתית'),            value: pct(safe(d.interestRate)) },
    { label: ph('החזר חודשי'),             value: fc(safe(d.monthlyMortgagePayment)) },
    { label: ph('סה״כ ריבית לתקופה'),     value: fc(safe(d.totalInterestPaid)) },
    { label: ph('יתרת משכנתא במכירה'),    value: fc(safe(d.remainingMortgageAtSale)) },
  ], y);

  y -= 10;

  // ══ שלב 3 — הכנסות והוצאות שוטפות ══════════════════════════════════════════

  ensureY(160);
  y = drawSectionHeader(page, fonts, 'שלב 3 — הכנסות והוצאות שוטפות', y, GOLD);

  y = drawTable(page, fonts, [
    { label: ph('שכירות חודשית'),                    value: fc(safe(d.monthlyRent)) },
    { label: ph('הוצאות חודשיות'),                  value: fc(safe(d.monthlyExpenses)) },
    { label: ph('תזרים חודשי נטו'),                 value: fc(monthlyCashflow) },
    { label: ph('הכנסת שכירות כוללת לתקופה'),      value: fc(totalRentalIncome) },
    { label: ph('הוצאות תפעול כולל לתקופה'),       value: fc(totalOperatingExpenses) },
    { label: ph('סה״כ תזרים לתקופה'),              value: fc(totalCashflowOverPeriod) },
    { label: ph('תשואה ברוטו'),                     value: pct(safe(d.grossYield)) },
    { label: ph('תשואה נטו'),                       value: pct(safe(d.netYield)) },
    { label: ph('תקופת החזקה'),                     value: `${safe(d.holdingPeriodYears)} שנים` },
  ], y);

  y -= 10;

  // ══ שלב 4 — מכירה עתידית ורווח ══════════════════════════════════════════════

  ensureY(140);
  y = drawSectionHeader(page, fonts, 'שלב 4 — מכירה עתידית ורווח', y, GOLD);

  drawTable(page, fonts, [
    { label: ph('מחיר מכירה'),        value: fc(safe(d.expectedSalePrice)) },
    { label: ph('עלויות מכירה'),     value: fc(safe(d.sellingCosts)) },
    { label: ph('מס שבח'),           value: fc(safe(d.capitalGainsTax)) },
    { label: ph('שיעור מס שבח'),     value: pct(safe(d.capitalGainsTaxRate)) },
    { label: ph('עליית ערך שנתית'), value: pct(safe(d.annualAppreciation)) },
    { label: ph('עלויות שיפוץ'),    value: fc(safe(d.renovationCosts)) },
  ], y);

  // ── Save ──────────────────────────────────────────────────────────────────────
  const bytes = await pdfDoc.save();
  const blob  = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = 'סיכום-כדאיות-עסקה.pdf';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
