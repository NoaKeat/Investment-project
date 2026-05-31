import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Step1Result,
  Step2Result,
  Step3Result,
  Step4Result,
  PurchaseExpense,
} from '../types/index';

type CurrentStep = 1 | 2 | 3 | 4 | 'summary';

// קלט שלב 1 ששמור ל-localStorage לשחזור הטופס ברענון
interface Step1InputStore {
  propertyValue: number;
  propertyType: 'first_apartment' | 'second_apartment';
  expenses: PurchaseExpense[];
}

interface CalculatorState {
  step1Result: Step1Result | null;
  step2Result: Step2Result | null;
  step3Result: Step3Result | null;
  step4Result: Step4Result | null;
  step1Input: Step1InputStore | null;   // נשמר בזמן אמת לשחזור ברענון
  currentStep: CurrentStep;
  _hasHydrated: boolean;

  setStep1Result: (result: Step1Result) => void;
  setStep2Result: (result: Step2Result) => void;
  setStep3Result: (result: Step3Result) => void;
  setStep4Result: (result: Step4Result) => void;
  setStep1Input: (input: Step1InputStore) => void;
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
      currentStep: 1,
      _hasHydrated: false,

      setStep1Result: (result) => set({ step1Result: result }),
      setStep2Result: (result) => set({ step2Result: result }),
      setStep3Result: (result) => set({ step3Result: result }),
      setStep4Result: (result) => set({ step4Result: result }),
      setStep1Input: (input) => set({ step1Input: input }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      resetCalculator: () =>
        set({
          step1Result: null,
          step2Result: null,
          step3Result: null,
          step4Result: null,
          step1Input: null,
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
        currentStep: state.currentStep,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
