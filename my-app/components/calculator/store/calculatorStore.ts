import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Step1Result,
  Step2Result,
  Step3Result,
  Step4Result,
  PurchaseExpense,
  RepaymentMethod,
} from '../types/index';

type CurrentStep = 1 | 2 | 3 | 4 | 'summary';

// קלט שלב 1 ששמור ל-localStorage לשחזור הטופס ברענון
interface Step1InputStore {
  propertyValue: number;
  propertyType: 'first_apartment' | 'second_apartment';
  expenses: PurchaseExpense[];
}

// קלט שלב 2 ששמור ל-localStorage לשחזור הטופס ברענון
interface Step2InputStore {
  mortgageAmount: number;
  repaymentMethod: RepaymentMethod;
  interestRate: number;
  loanTermYears: number;
  earlyRepaymentYears?: number;
}

// קלט שלב 3 ששמור ל-localStorage לשחזור הטופס ברענון
interface Step3ExpenseStore {
  id: number;
  type: string;
  amount: number | null;
}

interface Step3IncomeRowStore {
  id: number;
  label: string;
  amount: number | null;
}

interface Step3InputStore {
  monthlyRent: number | null;
  annualRentIncrease: number;
  expenses: Step3ExpenseStore[];
  additionalIncome: Step3IncomeRowStore[];
}

// קלט שלב 4 ששמור ל-localStorage לשחזור הטופס ברענון
interface Step4ExpenseStore {
  id: number;
  type: string;
  unit: string;
  amount: number | null;
  readOnly?: boolean;
}

interface Step4InputStore {
  holdingYears: number;
  salePrice: number | null;
  autoCalculate: boolean;
  annualAppreciation: number;
  renovationCosts: number | null;
  saleExpenses: Step4ExpenseStore[];
}

interface CalculatorState {
  step1Result: Step1Result | null;
  step2Result: Step2Result | null;
  step3Result: Step3Result | null;
  step4Result: Step4Result | null;
  step1Input: Step1InputStore | null;
  step2Input: Step2InputStore | null;
  step3Input: Step3InputStore | null;
  step4Input: Step4InputStore | null;
  currentStep: CurrentStep;
  _hasHydrated: boolean;

  setStep1Result: (result: Step1Result) => void;
  setStep2Result: (result: Step2Result) => void;
  setStep3Result: (result: Step3Result) => void;
  setStep4Result: (result: Step4Result) => void;
  setStep1Input: (input: Step1InputStore) => void;
  setStep2Input: (input: Step2InputStore) => void;
  setStep3Input: (input: Step3InputStore) => void;
  setStep4Input: (input: Step4InputStore) => void;
  setCurrentStep: (step: CurrentStep) => void;
  setHasHydrated: (value: boolean) => void;
  resetCalculator: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      step1Result: null,
      step2Result: null,
      step3Result: null,
      step4Result: null,
      step1Input: null,
      step2Input: null,
      step3Input: null,
      step4Input: null,
      currentStep: 1,
      _hasHydrated: false,

      setStep1Result: (result) => set({ step1Result: result }),
      setStep2Result: (result) => set({ step2Result: result }),
      setStep3Result: (result) => set({ step3Result: result }),
      setStep4Result: (result) => set({ step4Result: result }),
      setStep1Input: (input) => set({ step1Input: input }),
      setStep2Input: (input) => set({ step2Input: input }),
      setStep3Input: (input) => set({ step3Input: input }),
      setStep4Input: (input) => set({ step4Input: input }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      resetCalculator: () =>
        set({
          step1Result: null,
          step2Result: null,
          step3Result: null,
          step4Result: null,
          step1Input: null,
          step2Input: null,
          step3Input: null,
          step4Input: null,
          currentStep: 1,
        }),
    }),
    {
      name: 'calculator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step1Result: state.step1Result,
        step2Result: state.step2Result,
        step3Result: state.step3Result,
        step4Result: state.step4Result,
        step1Input: state.step1Input,
        step2Input: state.step2Input,
        step3Input: state.step3Input,
        step4Input: state.step4Input,
        currentStep: state.currentStep,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
