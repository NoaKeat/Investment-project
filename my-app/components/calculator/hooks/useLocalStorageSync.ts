'use client';

import { useEffect } from 'react';
import { useCalculatorStore } from '../store/calculatorStore';

/**
 * מחזיר true ברגע שה-Zustand persist סיים לטעון מ-localStorage.
 * יש לקרוא לו בכל עמוד מחשבון — מונע flash of empty state בטעינה ראשונה.
 *
 * שימוש:
 *   const hydrated = useLocalStorageSync();
 *   if (!hydrated) return null;
 */
export function useLocalStorageSync(): boolean {
  const hasHydrated = useCalculatorStore((s) => s._hasHydrated);
  const setHasHydrated = useCalculatorStore((s) => s.setHasHydrated);

  useEffect(() => {
    // גיבוי: אם onRehydrateStorage לא נקרא (למשל אין נתונים ב-localStorage)
    // עדיין מסמנים hydrated אחרי ה-mount הראשון
    if (!hasHydrated) {
      setHasHydrated(true);
    }
  }, [hasHydrated, setHasHydrated]);

  return hasHydrated;
}
