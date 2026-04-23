"use client";
import { useState } from "react";

import CalculatorSection from "./CalculatorSection";
import CalculatorSection2 from "./CalculatorSection2";
import CalculatorSection3 from "./CalculatorSection3";

export default function CalculatorWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const steps = [
    <CalculatorSection
      onNext={next}
      data={formData}
      updateField={updateField}
    />,
    <CalculatorSection2
      onNext={next}
      onPrev={prev}
      data={formData}
      updateField={updateField}
    />,
    <CalculatorSection3
      onPrev={prev}
      data={formData}
    />,
  ];

  return steps[step] || steps[0];
}