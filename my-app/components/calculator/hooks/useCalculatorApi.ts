'use client';

import { useState } from 'react';
import type {
  Step1Input, Step1Result,
  Step2Input, Step2Result,
  Step3Input, Step3Result,
  Step4Input, Step4Result,
} from '../types/index';

// NEXT_PUBLIC_ — הערך נאפה ל-bundle בזמן build ונגיש בצד הלקוח
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function postToCalculator<TInput, TResult>(
  endpoint: string,
  input: TInput
): Promise<TResult> {
  const res = await fetch(`${API_URL}/api/calculator/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? `שגיאה בשלב ${endpoint}`);
  }
  return res.json() as Promise<TResult>;
}

export function useCalculatorApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calcStep1(input: Step1Input): Promise<Step1Result | null> {
    setLoading(true);
    setError(null);
    try {
      return await postToCalculator<Step1Input, Step1Result>('step1', input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function calcStep2(input: Step2Input): Promise<Step2Result | null> {
    setLoading(true);
    setError(null);
    try {
      return await postToCalculator<Step2Input, Step2Result>('step2', input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function calcStep3(input: Step3Input): Promise<Step3Result | null> {
    setLoading(true);
    setError(null);
    try {
      return await postToCalculator<Step3Input, Step3Result>('step3', input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function calcStep4(input: Step4Input): Promise<Step4Result | null> {
    setLoading(true);
    setError(null);
    try {
      return await postToCalculator<Step4Input, Step4Result>('step4', input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, calcStep1, calcStep2, calcStep3, calcStep4 };
}
