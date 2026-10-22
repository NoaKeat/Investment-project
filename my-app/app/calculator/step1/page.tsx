'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Step1Page.module.css';
import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import { useCalculatorStore } from '@/components/calculator/store/calculatorStore';
import { useCalculatorApi } from '@/components/calculator/hooks/useCalculatorApi';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import CalcIcon from '@/components/ui/CalcIcon';
import {
  type ExpenseOptionId,
  type PurchaseExpense,
  type Step1Result,
} from '@/components/calculator/types/index';

// ─── Local state type (type can be null before the user selects) ───────────

interface LocalExpense {
  id: string;
  type: ExpenseOptionId | null;
  label: string;
  amount: number | null; // תמיד ₪ (עבור עו"ד — מחושב מ-pct)
  pct?: number | null;   // רק עבור 'lawyer' — האחוז שהמשתמש הזין
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('he-IL');
}

// ─── Component ───────────────────────────────────────────────────────────

export default function Step1Page() {
  const hydrated = useLocalStorageSync();
  const router = useRouter();
  const { calcStep1, loading } = useCalculatorApi();

  const setStep1Result = useCalculatorStore((s) => s.setStep1Result);
  const setStep1Input = useCalculatorStore((s) => s.setStep1Input);
  const savedInput = useCalculatorStore((s) => s.step1Input);

  // ── form state ──────────────────────────────────────────────────────────
  const [propertyValue, setPropertyValue] = useState<number | null>(null);
  const [propertyValueDisplay, setPropertyValueDisplay] = useState('');
  const [propertyType, setPropertyType] = useState<'first_apartment' | 'second_apartment'>('first_apartment');
  const [expenses, setExpenses] = useState<LocalExpense[]>([
    { id: 'broker-fixed', type: 'broker', label: 'תיווך רכישה', amount: null, pct: 2 },
    { id: 'lawyer-fixed', type: 'lawyer', label: 'עורך דין קונה', amount: null },
    { id: 'advisor-fixed', type: 'mortgage_advisor', label: 'יועץ משכנתאות', amount: null },
  ]);

  // ── server result state ─────────────────────────────────────────────────
  const [result, setResult] = useState<Step1Result | null>(null);
  const [initialized, setInitialized] = useState(false);

  // ── restore from localStorage after hydration ───────────────────────────
  useEffect(() => {
    if (!hydrated || initialized) return;

    if (savedInput) {
      setPropertyValue(savedInput.propertyValue || null);
      if (savedInput.propertyValue) {
        setPropertyValueDisplay(formatNum(savedInput.propertyValue));
      }
      setPropertyType(savedInput.propertyType);
      if (savedInput.expenses.length > 0) {
        const savedBroker = savedInput.expenses.find((e) => e.type === 'broker');
        const savedLawyer = savedInput.expenses.find((e) => e.type === 'lawyer');
        const savedAdvisor = savedInput.expenses.find((e) => e.type === 'mortgage_advisor');
        const savedOthers = savedInput.expenses.filter(
          (e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor'
        );
        // שחזור אחוז התיווך מהסכום השמור (לא נשמר ישירות) — אחרת ברירת מחדל 2%
        const restoredBrokerPct =
          savedBroker?.amount && savedInput.propertyValue
            ? Math.round((savedBroker.amount / (savedInput.propertyValue * 1.18)) * 1000) / 10
            : 2;
        setExpenses([
          { id: savedBroker?.id ?? 'broker-fixed', type: 'broker', label: 'תיווך רכישה', amount: savedBroker?.amount ?? null, pct: restoredBrokerPct },
          { id: savedLawyer?.id ?? 'lawyer-fixed', type: 'lawyer', label: 'עורך דין קונה', amount: savedLawyer?.amount ?? null },
          { id: savedAdvisor?.id ?? 'advisor-fixed', type: 'mortgage_advisor', label: 'יועץ משכנתאות', amount: savedAdvisor?.amount ?? null },
          ...savedOthers.map((e) => ({ id: e.id, type: 'other' as ExpenseOptionId, label: e.label || 'אחר', amount: e.amount })),
        ]);
      }
    }

    setInitialized(true);
  }, [hydrated, initialized, savedInput]);

  // ── auto-save draft to store ─────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    setStep1Input({
      propertyValue: propertyValue ?? 0,
      propertyType,
      expenses: expenses
        .filter((e) => e.type !== null)
        .map((e) => ({
          id: e.id,
          type: e.type as string,
          label: e.label,
          amount: e.amount,
        })),
    });
  }, [propertyValue, propertyType, expenses, initialized, setStep1Input]);

  // ── calculation (debounce 600ms) ─────────────────────────────────────────
  useEffect(() => {
    if (!propertyValue) {
      setResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      const validExpenses: PurchaseExpense[] = expenses
        .filter((e): e is LocalExpense & { type: ExpenseOptionId; amount: number } =>
          e.type !== null && e.amount !== null && e.amount > 0
        )
        .map((e) => ({
          id: e.id,
          type: e.type,
          label: e.label,
          amount: e.amount,
        }));

      const res = await calcStep1({ propertyValue, propertyType, expenses: validExpenses });
      if (res) {
        setResult(res);
        setStep1Result(res);
      }
    }, 600);

    return () => clearTimeout(timer);
    // calcStep1 is stable — omitting from deps to avoid re-triggering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyValue, propertyType, expenses]);

  // ── handlers ─────────────────────────────────────────────────────────────

  const handlePropertyValueChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const num = digits ? parseInt(digits, 10) : null;
    setPropertyValue(num);
    setPropertyValueDisplay(num ? formatNum(num) : '');
  };

  const handlePropertyValueBlur = () => {
    if (propertyValue) setPropertyValueDisplay(formatNum(propertyValue));
  };

  const handlePropertyValueFocus = () => {
    // Show raw digits while editing to avoid re-parsing commas
    if (propertyValue) setPropertyValueDisplay(String(propertyValue));
  };

  const addExpense = () => {
    const otherCount = expenses.filter((e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor').length;
    if (otherCount >= 6) return;
    setExpenses((prev) => [
      ...prev,
      { id: `exp-${Date.now()}`, type: 'other' as ExpenseOptionId, label: 'אחר', amount: null },
    ]);
  };

  const updateExpenseLabel = (id: string, label: string) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, label } : e)));
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpenseAmount = (id: string, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const amount = digits ? parseInt(digits, 10) : null;
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, amount } : e)));
  };

  const updateBrokerPct = (id: string, raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const pct = cleaned ? parseFloat(cleaned) : null;
    const amount =
      pct !== null && propertyValue
        ? Math.round((pct / 100) * propertyValue * 1.18)
        : null;
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, pct: pct ?? null, amount } : e))
    );
  };

  // כשמשתמש משנה שווי הנכס — מעדכן סכום תיווך אוטומטית (כולל מע"מ)
  useEffect(() => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.type === 'broker' && e.pct != null) {
          return {
            ...e,
            amount: propertyValue ? Math.round((e.pct / 100) * propertyValue * 1.18) : null,
          };
        }
        return e;
      })
    );
  }, [propertyValue]);

  const handleNext = () => {
    if (!result || !propertyValue) return;
    setStep1Result(result);
    setStep1Input({
      propertyValue,
      propertyType,
      expenses: expenses
        .filter((e) => e.type !== null)
        .map((e) => ({
          id: e.id,
          type: e.type as string,
          label: e.label,
          amount: e.amount,
        })),
    });
    router.push('/calculator/step2');
  };

  // ── derived ──────────────────────────────────────────────────────────────

  const canProceed = Boolean(result && propertyValue);

  // ── step navigation ───────────────────────────────────────────────────────

  const handleStepClick = (step: 1 | 2 | 3 | 4 | 'summary') => {
    if (step === 1) router.push('/calculator/step1');
    if (step === 2) router.push('/calculator/step2');
    if (step === 3) router.push('/calculator/step3');
    if (step === 4) router.push('/calculator/step4');
    if (step === 'summary') router.push('/calculator/summary');
  };

  if (!hydrated) return null;

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <main className={styles.pageWrapper} dir="rtl">

      {/* ── Progress bar ── */}
      <ProgressBar currentStep={1} onStepClick={handleStepClick} />

      {/* ── Nav row: step icon + title + nav buttons ── */}
      <div className={styles.navRow}>

        {/* גוש ימני: אייקון וכותרת */}
        <div className={styles.navTitleGroup}>
          <div className={styles.stepIcon}>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-outside-1_1438_428" maskUnits="userSpaceOnUse" x="-0.900391" y="-0.399902" width="22" height="21" fill="black">
                <rect fill="white" x="-0.900391" y="-0.399902" width="22" height="21" />
                <path d="M7.59961 2.6001C7.59961 1.23291 8.73242 0.100098 10.0996 0.100098H17.5996C18.9668 0.100098 20.0996 1.23291 20.0996 2.6001V17.6001C20.0996 18.9673 18.9668 20.1001 17.5996 20.1001H2.59961C1.23242 20.1001 0.0996094 18.9673 0.0996094 17.6001V7.6001C0.0996094 6.23291 1.23242 5.1001 2.59961 5.1001H7.59961V2.6001ZM7.59961 6.3501H2.59961C1.89648 6.3501 1.34961 6.89697 1.34961 7.6001V17.6001C1.34961 18.3032 1.89648 18.8501 2.59961 18.8501H7.95117C7.7168 18.4985 7.59961 18.0688 7.59961 17.6001V6.3501ZM10.0996 18.8501H17.5996C18.3027 18.8501 18.8496 18.3032 18.8496 17.6001V2.6001C18.8496 1.89697 18.3027 1.3501 17.5996 1.3501H10.0996C9.39648 1.3501 8.84961 1.89697 8.84961 2.6001V17.6001C8.84961 18.3032 9.39648 18.8501 10.0996 18.8501ZM14.7871 4.1626C14.7871 3.81104 15.0605 3.5376 15.4121 3.5376H16.0371C16.3887 3.5376 16.6621 3.81104 16.6621 4.1626V4.7876C16.6621 5.13916 16.3887 5.4126 16.0371 5.4126H15.4121C15.0605 5.4126 14.7871 5.13916 14.7871 4.7876V4.1626ZM11.6621 3.5376H12.2871C12.6387 3.5376 12.9121 3.81104 12.9121 4.1626V4.7876C12.9121 5.13916 12.6387 5.4126 12.2871 5.4126H11.6621C11.3105 5.4126 11.0371 5.13916 11.0371 4.7876V4.1626C11.0371 3.81104 11.3105 3.5376 11.6621 3.5376ZM14.7871 7.9126C14.7871 7.56104 15.0605 7.2876 15.4121 7.2876H16.0371C16.3887 7.2876 16.6621 7.56104 16.6621 7.9126V8.5376C16.6621 8.88916 16.3887 9.1626 16.0371 9.1626H15.4121C15.0605 9.1626 14.7871 8.88916 14.7871 8.5376V7.9126ZM11.6621 7.2876H12.2871C12.6387 7.2876 12.9121 7.56104 12.9121 7.9126V8.5376C12.9121 8.88916 12.6387 9.1626 12.2871 9.1626H11.6621C11.3105 9.1626 11.0371 8.88916 11.0371 8.5376V7.9126C11.0371 7.56104 11.3105 7.2876 11.6621 7.2876ZM3.53711 9.1626C3.53711 8.81104 3.81055 8.5376 4.16211 8.5376H4.78711C5.13867 8.5376 5.41211 8.81104 5.41211 9.1626V9.7876C5.41211 10.1392 5.13867 10.4126 4.78711 10.4126H4.16211C3.81055 10.4126 3.53711 10.1392 3.53711 9.7876V9.1626ZM11.6621 11.0376H12.2871C12.6387 11.0376 12.9121 11.311 12.9121 11.6626V12.2876C12.9121 12.6392 12.6387 12.9126 12.2871 12.9126H11.6621C11.3105 12.9126 11.0371 12.6392 11.0371 12.2876V11.6626C11.0371 11.311 11.3105 11.0376 11.6621 11.0376ZM3.53711 12.9126C3.53711 12.561 3.81055 12.2876 4.16211 12.2876H4.78711C5.13867 12.2876 5.41211 12.561 5.41211 12.9126V13.5376C5.41211 13.8892 5.13867 14.1626 4.78711 14.1626H4.16211C3.81055 14.1626 3.53711 13.8892 3.53711 13.5376V12.9126ZM15.4121 11.0376H16.0371C16.3887 11.0376 16.6621 11.311 16.6621 11.6626V12.2876C16.6621 12.6392 16.3887 12.9126 16.0371 12.9126H15.4121C15.0605 12.9126 14.7871 12.6392 14.7871 12.2876V11.6626C14.7871 11.311 15.0605 11.0376 15.4121 11.0376Z" />
              </mask>
              <path d="M7.59961 2.6001C7.59961 1.23291 8.73242 0.100098 10.0996 0.100098H17.5996C18.9668 0.100098 20.0996 1.23291 20.0996 2.6001V17.6001C20.0996 18.9673 18.9668 20.1001 17.5996 20.1001H2.59961C1.23242 20.1001 0.0996094 18.9673 0.0996094 17.6001V7.6001C0.0996094 6.23291 1.23242 5.1001 2.59961 5.1001H7.59961V2.6001ZM7.59961 6.3501H2.59961C1.89648 6.3501 1.34961 6.89697 1.34961 7.6001V17.6001C1.34961 18.3032 1.89648 18.8501 2.59961 18.8501H7.95117C7.7168 18.4985 7.59961 18.0688 7.59961 17.6001V6.3501ZM10.0996 18.8501H17.5996C18.3027 18.8501 18.8496 18.3032 18.8496 17.6001V2.6001C18.8496 1.89697 18.3027 1.3501 17.5996 1.3501H10.0996C9.39648 1.3501 8.84961 1.89697 8.84961 2.6001V17.6001C8.84961 18.3032 9.39648 18.8501 10.0996 18.8501ZM14.7871 4.1626C14.7871 3.81104 15.0605 3.5376 15.4121 3.5376H16.0371C16.3887 3.5376 16.6621 3.81104 16.6621 4.1626V4.7876C16.6621 5.13916 16.3887 5.4126 16.0371 5.4126H15.4121C15.0605 5.4126 14.7871 5.13916 14.7871 4.7876V4.1626ZM11.6621 3.5376H12.2871C12.6387 3.5376 12.9121 3.81104 12.9121 4.1626V4.7876C12.9121 5.13916 12.6387 5.4126 12.2871 5.4126H11.6621C11.3105 5.4126 11.0371 5.13916 11.0371 4.7876V4.1626C11.0371 3.81104 11.3105 3.5376 11.6621 3.5376ZM14.7871 7.9126C14.7871 7.56104 15.0605 7.2876 15.4121 7.2876H16.0371C16.3887 7.2876 16.6621 7.56104 16.6621 7.9126V8.5376C16.6621 8.88916 16.3887 9.1626 16.0371 9.1626H15.4121C15.0605 9.1626 14.7871 8.88916 14.7871 8.5376V7.9126ZM11.6621 7.2876H12.2871C12.6387 7.2876 12.9121 7.56104 12.9121 7.9126V8.5376C12.9121 8.88916 12.6387 9.1626 12.2871 9.1626H11.6621C11.3105 9.1626 11.0371 8.88916 11.0371 8.5376V7.9126C11.0371 7.56104 11.3105 7.2876 11.6621 7.2876ZM3.53711 9.1626C3.53711 8.81104 3.81055 8.5376 4.16211 8.5376H4.78711C5.13867 8.5376 5.41211 8.81104 5.41211 9.1626V9.7876C5.41211 10.1392 5.13867 10.4126 4.78711 10.4126H4.16211C3.81055 10.4126 3.53711 10.1392 3.53711 9.7876V9.1626ZM11.6621 11.0376H12.2871C12.6387 11.0376 12.9121 11.311 12.9121 11.6626V12.2876C12.9121 12.6392 12.6387 12.9126 12.2871 12.9126H11.6621C11.3105 12.9126 11.0371 12.6392 11.0371 12.2876V11.6626C11.0371 11.311 11.3105 11.0376 11.6621 11.0376ZM3.53711 12.9126C3.53711 12.561 3.81055 12.2876 4.16211 12.2876H4.78711C5.13867 12.2876 5.41211 12.561 5.41211 12.9126V13.5376C5.41211 13.8892 5.13867 14.1626 4.78711 14.1626H4.16211C3.81055 14.1626 3.53711 13.8892 3.53711 13.5376V12.9126ZM15.4121 11.0376H16.0371C16.3887 11.0376 16.6621 11.311 16.6621 11.6626V12.2876C16.6621 12.6392 16.3887 12.9126 16.0371 12.9126H15.4121C15.0605 12.9126 14.7871 12.6392 14.7871 12.2876V11.6626C14.7871 11.311 15.0605 11.0376 15.4121 11.0376Z" fill="#E5B260" />
              <path d="M7.59961 5.1001V5.2001H7.69961V5.1001H7.59961ZM7.59961 6.3501H7.69961V6.2501H7.59961V6.3501ZM7.95117 18.8501V18.9501H8.13802L8.03438 18.7946L7.95117 18.8501ZM7.59961 2.6001H7.69961C7.69961 1.28814 8.78765 0.200098 10.0996 0.200098V0.100098V9.72748e-05C8.67719 9.72748e-05 7.49961 1.17768 7.49961 2.6001H7.59961ZM10.0996 0.100098V0.200098H17.5996V0.100098V9.72748e-05H10.0996V0.100098ZM17.5996 0.100098V0.200098C18.9116 0.200098 19.9996 1.28814 19.9996 2.6001H20.0996H20.1996C20.1996 1.17768 19.022 9.72748e-05 17.5996 9.72748e-05V0.100098ZM20.0996 2.6001H19.9996V17.6001H20.0996H20.1996V2.6001H20.0996ZM20.0996 17.6001H19.9996C19.9996 18.9121 18.9116 20.0001 17.5996 20.0001V20.1001V20.2001C19.022 20.2001 20.1996 19.0225 20.1996 17.6001H20.0996ZM17.5996 20.1001V20.0001H2.59961V20.1001V20.2001H17.5996V20.1001ZM2.59961 20.1001V20.0001C1.28765 20.0001 0.19961 18.9121 0.19961 17.6001H0.0996094H-0.000391006C-0.000391006 19.0225 1.17719 20.2001 2.59961 20.2001V20.1001ZM0.0996094 17.6001H0.19961V7.6001H0.0996094H-0.000391006V17.6001H0.0996094ZM0.0996094 7.6001H0.19961C0.19961 6.28814 1.28765 5.2001 2.59961 5.2001V5.1001V5.0001C1.17719 5.0001 -0.000391006 6.17768 -0.000391006 7.6001H0.0996094ZM2.59961 5.1001V5.2001H7.59961V5.1001V5.0001H2.59961V5.1001ZM7.59961 5.1001H7.69961V2.6001H7.59961H7.49961V5.1001H7.59961ZM7.59961 6.3501V6.2501H2.59961V6.3501V6.4501H7.59961V6.3501ZM2.59961 6.3501V6.2501C1.84126 6.2501 1.24961 6.84174 1.24961 7.6001H1.34961H1.44961C1.44961 6.9522 1.95171 6.4501 2.59961 6.4501V6.3501ZM1.34961 7.6001H1.24961V17.6001H1.34961H1.44961V7.6001H1.34961ZM1.34961 17.6001H1.24961C1.24961 18.3585 1.84126 18.9501 2.59961 18.9501V18.8501V18.7501C1.95171 18.7501 1.44961 18.248 1.44961 17.6001H1.34961ZM2.59961 18.8501V18.9501H7.95117V18.8501V18.7501H2.59961V18.8501ZM7.95117 18.8501L8.03438 18.7946C7.81258 18.4619 7.69961 18.0523 7.69961 17.6001H7.59961H7.49961C7.49961 18.0854 7.62101 18.5351 7.86797 18.9056L7.95117 18.8501ZM7.59961 17.6001H7.69961V6.3501H7.59961H7.49961V17.6001H7.59961ZM10.0996 18.8501V18.9501H17.5996V18.8501V18.7501H10.0996V18.8501ZM17.5996 18.8501V18.9501C18.358 18.9501 18.9496 18.3585 18.9496 17.6001H18.8496H18.7496C18.7496 18.248 18.2475 18.7501 17.5996 18.7501V18.8501ZM18.8496 17.6001H18.9496V2.6001H18.8496H18.7496V17.6001H18.8496ZM18.8496 2.6001H18.9496C18.9496 1.84174 18.358 1.2501 17.5996 1.2501V1.3501V1.4501C18.2475 1.4501 18.7496 1.9522 18.7496 2.6001H18.8496ZM17.5996 1.3501V1.2501H10.0996V1.3501V1.4501H17.5996V1.3501ZM10.0996 1.3501V1.2501C9.34126 1.2501 8.74961 1.84174 8.74961 2.6001H8.84961H8.94961C8.94961 1.9522 9.45171 1.4501 10.0996 1.4501V1.3501ZM8.84961 2.6001H8.74961V17.6001H8.84961H8.94961V2.6001H8.84961ZM8.84961 17.6001H8.74961C8.74961 18.3585 9.34126 18.9501 10.0996 18.9501V18.8501V18.7501C9.45171 18.7501 8.94961 18.248 8.94961 17.6001H8.84961ZM14.7871 4.1626H14.8871C14.8871 3.86626 15.1158 3.6376 15.4121 3.6376V3.5376V3.4376C15.0053 3.4376 14.6871 3.75581 14.6871 4.1626H14.7871ZM15.4121 3.5376V3.6376H16.0371V3.5376V3.4376H15.4121V3.5376ZM16.0371 3.5376V3.6376C16.3334 3.6376 16.5621 3.86626 16.5621 4.1626H16.6621H16.7621C16.7621 3.75581 16.4439 3.4376 16.0371 3.4376V3.5376ZM16.6621 4.1626H16.5621V4.7876H16.6621H16.7621V4.1626H16.6621ZM16.6621 4.7876H16.5621C16.5621 5.08393 16.3334 5.3126 16.0371 5.3126V5.4126V5.5126C16.4439 5.5126 16.7621 5.19439 16.7621 4.7876H16.6621ZM16.0371 5.4126V5.3126H15.4121V5.4126V5.5126H16.0371V5.4126ZM15.4121 5.4126V5.3126C15.1158 5.3126 14.8871 5.08393 14.8871 4.7876H14.7871H14.6871C14.6871 5.19439 15.0053 5.5126 15.4121 5.5126V5.4126ZM14.7871 4.7876H14.8871V4.1626H14.7871H14.6871V4.7876H14.7871ZM11.6621 3.5376V3.6376H12.2871V3.5376V3.4376H11.6621V3.5376ZM12.2871 3.5376V3.6376C12.5834 3.6376 12.8121 3.86626 12.8121 4.1626H12.9121H13.0121C13.0121 3.75581 12.6939 3.4376 12.2871 3.4376V3.5376ZM12.9121 4.1626H12.8121V4.7876H12.9121H13.0121V4.1626H12.9121ZM12.9121 4.7876H12.8121C12.8121 5.08393 12.5834 5.3126 12.2871 5.3126V5.4126V5.5126C12.6939 5.5126 13.0121 5.19439 13.0121 4.7876H12.9121ZM12.2871 5.4126V5.3126H11.6621V5.4126V5.5126H12.2871V5.4126ZM11.6621 5.4126V5.3126C11.3658 5.3126 11.1371 5.08393 11.1371 4.7876H11.0371H10.9371C10.9371 5.19439 11.2553 5.5126 11.6621 5.5126V5.4126ZM11.0371 4.7876H11.1371V4.1626H11.0371H10.9371V4.7876H11.0371ZM11.0371 4.1626H11.1371C11.1371 3.86626 11.3658 3.6376 11.6621 3.6376V3.5376V3.4376C11.2553 3.4376 10.9371 3.75581 10.9371 4.1626H11.0371ZM14.7871 7.9126H14.8871C14.8871 7.61626 15.1158 7.3876 15.4121 7.3876V7.2876V7.1876C15.0053 7.1876 14.6871 7.50581 14.6871 7.9126H14.7871ZM15.4121 7.2876V7.3876H16.0371V7.2876V7.1876H15.4121V7.2876ZM16.0371 7.2876V7.3876C16.3334 7.3876 16.5621 7.61626 16.5621 7.9126H16.6621H16.7621C16.7621 7.50581 16.4439 7.1876 16.0371 7.1876V7.2876ZM16.6621 7.9126H16.5621V8.5376H16.6621H16.7621V7.9126H16.6621ZM16.6621 8.5376H16.5621C16.5621 8.83393 16.3334 9.0626 16.0371 9.0626V9.1626V9.2626C16.4439 9.2626 16.7621 8.94439 16.7621 8.5376H16.6621ZM16.0371 9.1626V9.0626H15.4121V9.1626V9.2626H16.0371V9.1626ZM15.4121 9.1626V9.0626C15.1158 9.0626 14.8871 8.83393 14.8871 8.5376H14.7871H14.6871C14.6871 8.94439 15.0053 9.2626 15.4121 9.2626V9.1626ZM14.7871 8.5376H14.8871V7.9126H14.7871H14.6871V8.5376H14.7871ZM11.6621 7.2876V7.3876H12.2871V7.2876V7.1876H11.6621V7.2876ZM12.2871 7.2876V7.3876C12.5834 7.3876 12.8121 7.61626 12.8121 7.9126H12.9121H13.0121C13.0121 7.50581 12.6939 7.1876 12.2871 7.1876V7.2876ZM12.9121 7.9126H12.8121V8.5376H12.9121H13.0121V7.9126H12.9121ZM12.9121 8.5376H12.8121C12.8121 8.83393 12.5834 9.0626 12.2871 9.0626V9.1626V9.2626C12.6939 9.2626 13.0121 8.94439 13.0121 8.5376H12.9121ZM12.2871 9.1626V9.0626H11.6621V9.1626V9.2626H12.2871V9.1626ZM11.6621 9.1626V9.0626C11.3658 9.0626 11.1371 8.83393 11.1371 8.5376H11.0371H10.9371C10.9371 8.94439 11.2553 9.2626 11.6621 9.2626V9.1626ZM11.0371 8.5376H11.1371V7.9126H11.0371H10.9371V8.5376H11.0371ZM11.0371 7.9126H11.1371C11.1371 7.61626 11.3658 7.3876 11.6621 7.3876V7.2876V7.1876C11.2553 7.1876 10.9371 7.50581 10.9371 7.9126H11.0371ZM3.53711 9.1626H3.63711C3.63711 8.86626 3.86578 8.6376 4.16211 8.6376V8.5376V8.4376C3.75532 8.4376 3.43711 8.75581 3.43711 9.1626H3.53711ZM4.16211 8.5376V8.6376H4.78711V8.5376V8.4376H4.16211V8.5376ZM4.78711 8.5376V8.6376C5.08344 8.6376 5.31211 8.86626 5.31211 9.1626H5.41211H5.51211C5.51211 8.75581 5.1939 8.4376 4.78711 8.4376V8.5376ZM5.41211 9.1626H5.31211V9.7876H5.41211H5.51211V9.1626H5.41211ZM5.41211 9.7876H5.31211C5.31211 10.0839 5.08344 10.3126 4.78711 10.3126V10.4126V10.5126C5.1939 10.5126 5.51211 10.1944 5.51211 9.7876H5.41211ZM4.78711 10.4126V10.3126H4.16211V10.4126V10.5126H4.78711V10.4126ZM4.16211 10.4126V10.3126C3.86578 10.3126 3.63711 10.0839 3.63711 9.7876H3.53711H3.43711C3.43711 10.1944 3.75532 10.5126 4.16211 10.5126V10.4126ZM3.53711 9.7876H3.63711V9.1626H3.53711H3.43711V9.7876H3.53711ZM11.6621 11.0376V11.1376H12.2871V11.0376V10.9376H11.6621V11.0376ZM12.2871 11.0376V11.1376C12.5834 11.1376 12.8121 11.3663 12.8121 11.6626H12.9121H13.0121C13.0121 11.2558 12.6939 10.9376 12.2871 10.9376V11.0376ZM12.9121 11.6626H12.8121V12.2876H12.9121H13.0121V11.6626H12.9121ZM12.9121 12.2876H12.8121C12.8121 12.5839 12.5834 12.8126 12.2871 12.8126V12.9126V13.0126C12.6939 13.0126 13.0121 12.6944 13.0121 12.2876H12.9121ZM12.2871 12.9126V12.8126H11.6621V12.9126V13.0126H12.2871V12.9126ZM11.6621 12.9126V12.8126C11.3658 12.8126 11.1371 12.5839 11.1371 12.2876H11.0371H10.9371C10.9371 12.6944 11.2553 13.0126 11.6621 13.0126V12.9126ZM11.0371 12.2876H11.1371V11.6626H11.0371H10.9371V12.2876H11.0371ZM11.0371 11.6626H11.1371C11.1371 11.3663 11.3658 11.1376 11.6621 11.1376V11.0376V10.9376C11.2553 10.9376 10.9371 11.2558 10.9371 11.6626H11.0371ZM3.53711 12.9126H3.63711C3.63711 12.6163 3.86578 12.3876 4.16211 12.3876V12.2876V12.1876C3.75532 12.1876 3.43711 12.5058 3.43711 12.9126H3.53711ZM4.16211 12.2876V12.3876H4.78711V12.2876V12.1876H4.16211V12.2876ZM4.78711 12.2876V12.3876C5.08344 12.3876 5.31211 12.6163 5.31211 12.9126H5.41211H5.51211C5.51211 12.5058 5.1939 12.1876 4.78711 12.1876V12.2876ZM5.41211 12.9126H5.31211V13.5376H5.41211H5.51211V12.9126H5.41211ZM5.41211 13.5376H5.31211C5.31211 13.8339 5.08344 14.0626 4.78711 14.0626V14.1626V14.2626C5.1939 14.2626 5.51211 13.9444 5.51211 13.5376H5.41211ZM4.78711 14.1626V14.0626H4.16211V14.1626V14.2626H4.78711V14.1626ZM4.16211 14.1626V14.0626C3.86578 14.0626 3.63711 13.8339 3.63711 13.5376H3.53711H3.43711C3.43711 13.9444 3.75532 14.2626 4.16211 14.2626V14.1626ZM3.53711 13.5376H3.63711V12.9126H3.53711H3.43711V13.5376H3.53711ZM15.4121 11.0376V11.1376H16.0371V11.0376V10.9376H15.4121V11.0376ZM16.0371 11.0376V11.1376C16.3334 11.1376 16.5621 11.3663 16.5621 11.6626H16.6621H16.7621C16.7621 11.2558 16.4439 10.9376 16.0371 10.9376V11.0376ZM16.6621 11.6626H16.5621V12.2876H16.6621H16.7621V11.6626H16.6621ZM16.6621 12.2876H16.5621C16.5621 12.5839 16.3334 12.8126 16.0371 12.8126V12.9126V13.0126C16.4439 13.0126 16.7621 12.6944 16.7621 12.2876H16.6621ZM16.0371 12.9126V12.8126H15.4121V12.9126V13.0126H16.0371V12.9126ZM15.4121 12.9126V12.8126C15.1158 12.8126 14.8871 12.5839 14.8871 12.2876H14.7871H14.6871C14.6871 12.6944 15.0053 13.0126 15.4121 13.0126V12.9126ZM14.7871 12.2876H14.8871V11.6626H14.7871H14.6871V12.2876H14.7871ZM14.7871 11.6626H14.8871C14.8871 11.3663 15.1158 11.1376 15.4121 11.1376V11.0376V10.9376C15.0053 10.9376 14.6871 11.2558 14.6871 11.6626H14.7871Z" fill="#E5B260" mask="url(#path-1-outside-1_1438_428)" />
            </svg>




          </div>
          <div className={styles.stepTitleBlock}>
            <h1 className={styles.stepTitle}>בואו נכיר את העסקה</h1>
            <span className={styles.stepSubtitle}>פרטי הנכס ועלויות רכישה</span>
          </div>
        </div>

        {/* גוש שמאלי: כפתורי ניווט ושמירה */}
        <div className={styles.navButtonsGroup}>
          <button className={styles.saveBtn}>
            שמור וחזור מאוחר יותר 🔖
          </button>
          <button
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={!canProceed}
          >
            המשך לשלב הבא←
          </button>
        </div>

      </div>

      {/* ── Content row: summary (right in RTL) + forms (left in RTL) ── */}
      <div className={styles.contentRow}>

        {/* ──── Summary column (first in DOM = right in RTL) ──── */}
        <div className={styles.summaryColumn}>
          <SummaryCard
            propertyValue={propertyValue}
            result={result}
            isLoading={loading}
          />
        </div>

        {/* ──── Forms column ──── */}
        <div className={styles.formsColumn}>

          {/* Card 1: Property details */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>פרטי הנכס</h2>

            <div className={styles.fieldsRow}>

              {/* Property value — first in DOM = right in RTL */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>שווי הנכס</label>
                <div className={styles.inputWithSymbol}>
                  <span className={styles.currencySymbol}>₪</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="מהו שווי הנכס?"
                    value={propertyValueDisplay}
                    onChange={(e) => handlePropertyValueChange(e.target.value)}
                    onFocus={handlePropertyValueFocus}
                    onBlur={handlePropertyValueBlur}
                  />
                </div>
              </div>

              {/* Property type toggle — second in DOM = left in RTL */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>סוג רכישה</label>
                <div className={styles.propertyTypeToggle}>
                  <button
                    type="button"
                    className={`${styles.typeOption} ${propertyType === 'second_apartment' ? styles.typeOptionSelected : ''}`}
                    onClick={() => setPropertyType('second_apartment')}
                  >
                    דירה להשקעה 🏢
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeOption} ${propertyType === 'first_apartment' ? styles.typeOptionSelected : ''}`}
                    onClick={() => setPropertyType('first_apartment')}
                  >
                    דירה יחידה 🏠
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Purchase expenses */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>עלויות רכישה נוספות</h2>
            <p className={styles.cardSubtitle}>
              הזינו את העלויות החד פעמיות הנלוות לרכישת הנכס
            </p>

            <div className={styles.expensesBody}>

              {/* ROW 1: עורך דין */}
              {(() => {
                const lawyerRow = expenses.find((e) => e.type === 'lawyer');
                return lawyerRow ? (
                  <div className={styles.newExpenseRow}>
                    <div className={styles.halfLabel}>עורך דין</div>
                    <input
                      className={`${styles.expenseInput} ${styles.halfInput}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={lawyerRow.amount !== null ? lawyerRow.amount.toLocaleString('he-IL') : ''}
                      onChange={(e) => updateExpenseAmount(lawyerRow.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.trashIcon}
                      onClick={() => removeExpense(lawyerRow.id)}
                      aria-label="מחק עורך דין"
                    >
                      🗑
                    </button>
                  </div>
                ) : null;
              })()}

              {/* ROW 2: יועץ משכנתאות */}
              {(() => {
                const advisorRow = expenses.find((e) => e.type === 'mortgage_advisor');
                return advisorRow ? (
                  <div className={styles.newExpenseRow}>
                    <div className={styles.halfLabel}>יועץ משכנתאות</div>
                    <input
                      className={`${styles.expenseInput} ${styles.halfInput}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={advisorRow.amount !== null ? advisorRow.amount.toLocaleString('he-IL') : ''}
                      onChange={(e) => updateExpenseAmount(advisorRow.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.trashIcon}
                      onClick={() => removeExpense(advisorRow.id)}
                      aria-label="מחק יועץ משכנתאות"
                    >
                      🗑
                    </button>
                  </div>
                ) : null;
              })()}

              {/* ROW 3: תיווך */}
              {(() => {
                const brokerRow = expenses.find((e) => e.type === 'broker');
                return brokerRow ? (
                  <div className={styles.fixedExpenseSection}>
                    <div className={styles.newExpenseRow}>
                      <div className={styles.halfLabel}>תיווך %</div>
                      <input
                        className={`${styles.expenseInput} ${styles.halfInput}`}
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0"
                        value={brokerRow.pct ?? ''}
                        onChange={(e) => updateBrokerPct(brokerRow.id, e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.trashIcon}
                        onClick={() => removeExpense(brokerRow.id)}
                        aria-label="מחק תיווך"
                      >
                        🗑
                      </button>
                    </div>
                    {brokerRow.amount !== null && (
                      <p className={styles.vatHint}>= {formatNum(brokerRow.amount)} שח (כולל מע״מ 18%)</p>
                    )}
                  </div>
                ) : null;
              })()}

              {/* שורות אחר — דינמיות */}
              {expenses.filter((e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor').map((expense) => (
                <div className={styles.newExpenseRow} key={expense.id}>
                  <input
                    className={`${styles.expenseInput} ${styles.halfInput}`}
                    type="text"
                    placeholder="אחר"
                    value={expense.label}
                    onChange={(e) => updateExpenseLabel(expense.id, e.target.value)}
                  />
                  <input
                    className={`${styles.expenseInput} ${styles.halfInput}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={expense.amount !== null ? expense.amount.toLocaleString('he-IL') : ''}
                    onChange={(e) => updateExpenseAmount(expense.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.trashIcon}
                    onClick={() => removeExpense(expense.id)}
                    aria-label="מחק שורה"
                  >
                    🗑
                  </button>
                </div>
              ))}

            </div>

            {expenses.filter((e) => e.type !== 'broker' && e.type !== 'lawyer' && e.type !== 'mortgage_advisor').length < 6 && (
              <button
                type="button"
                className={styles.addExpenseBtn}
                onClick={addExpense}
              >
                + הוספת הוצאה
              </button>
            )}
          </div>

        </div>
        {/* ──── end forms column ──── */}

      </div>
    </main>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

interface SummaryCardProps {
  propertyValue: number | null;
  result: Step1Result | null;
  isLoading: boolean;
}

function SummaryCard({ propertyValue, result, isLoading }: SummaryCardProps) {
  const shimmer = isLoading ? styles.shimmer : '';
  const pv = propertyValue ?? 0;

  return (
    <div className={styles.summaryCard}>

      {/* ── Header ── */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryTitleBlock}>
          <h3 className={styles.summaryTitle}>סיכום רכישה</h3>
          <span className={styles.summarySubtitle}>הסיכום מתעדכן בזמן אמת</span>
        </div>
        <div className={styles.summaryIcon}>
          <CalcIcon size={22} />
        </div>
      </div>

      {/* ── Content: empty or data ── */}
      {!propertyValue ? (
        <div className={styles.summaryEmpty}>
          <div className={styles.summaryEmptyTitle}>עוד רגע הכל יסתדר כאן</div>
          <div className={styles.summaryEmptyText}>
            כאן תוכלו לעקוב אחר התמונה המלאה של העסקה בזמן אמת, הסיכום יתעדכן אוטומטית לפי הנתונים שתזינו לאורך הדרך.
          </div>
        </div>
      ) : (
        <>
          {/* Property value */}
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>שווי הנכס</span>
            <span className={styles.summaryRowValue}>{formatNum(pv)} ₪</span>
          </div>

          {/* Purchase tax */}
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>מס רכישה (אוטומטי)</span>
            <span className={`${styles.summaryRowValue} ${shimmer}`}>
              {result ? `${formatNum(result.purchaseTaxAmount)} ₪` : '—'}
            </span>
          </div>
          <p className={styles.taxNote}>✓ חושב לפי שווי הנכס וסוג הרכישה</p>

          {/* Additional expenses breakdown */}
          {result && result.expenseBreakdown.length > 0 && (
            <>
              <hr className={styles.divider} />
              <div className={styles.summarySectionLabel}>עלויות נוספות</div>
              {result.expenseBreakdown.map((exp) => (
                <div className={styles.summaryRow} key={exp.id}>
                  <span className={styles.summaryRowLabel}>
                    {exp.label}
                    {exp.hasSurcharge && (
                      <span style={{ color: '#E6B360', fontSize: '12px' }}>
                        {' '}(כולל 10% בצ״מ)
                      </span>
                    )}
                  </span>
                  <span className={styles.summaryRowValue}>
                    {formatNum(exp.adjustedAmount)} ₪
                  </span>
                </div>
              ))}
            </>
          )}

          <hr className={styles.divider} />

          {/* Total */}
          <div className={styles.summaryTotalRow}>
            <span className={styles.summaryTotalLabel}>עלות רכישה כוללת</span>
            <span className={`${styles.summaryTotalValue} ${shimmer}`}>
              {result ? `${formatNum(result.totalCost)} ₪` : '—'}
            </span>
          </div>

          <div className={styles.summaryFooter}>
            📍 זו רק ההתחלה — בשלבים הבאים נחשב את המימון, ההכנסות והרווח הצפוי
          </div>
        </>
      )}

    </div>
  );
}
