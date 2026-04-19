"use client";
import styles from "./CalculatorSection.module.css";
import { useEffect, useState } from "react";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
}

interface Step {
  id: number;
  number: string;
  label: string;
  formFields?: FormField[];
}

interface CalculatorData {
  steps: Step[];
  summaryBox: {
    title: string;
    example: string;
    noDataMessage: string;
  };
  buttons: {
    prev: string;
    next: string;
  };
}

export default function CalculatorSection() {
  const [data, setData] = useState<CalculatorData | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    fetch("/calculator.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return null;

  const currentStep = data.steps[activeStep];

  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <div className={styles.stepsWrapper}>
          {data.steps.map((step, index) => (
            <span
              key={step.id}
              className={index === activeStep ? styles.activeStep : styles.step}
              onClick={() => setActiveStep(index)}
            >
              שלב {step.number} - {step.label}
            </span>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.formBox}>
            <h2 className={styles.title}>שלב {currentStep.number} - {currentStep.label}</h2>
            <p className={styles.desc}>
              בשלב זה ממלאים את פרטי הרכש כדי שנוכל להתחיל בחישוב.
            </p>

            {currentStep.formFields && currentStep.formFields.map((field) => (
              <div key={field.id} className={`${styles.fieldWrapper} ${styles[field.id]}`}>
                <span className={styles.fieldLabel}>
                  {field.required && "*"} {field.label}
                </span>
                {field.type === "select" ? (
                  <div className={styles.selectWrapper}>
                    <select className={styles.input}>
                      <option>{field.placeholder}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    className={styles.input}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            <div className={styles.actions}>
              <button
                className={styles.outline}
                disabled={activeStep === 0}
                onClick={() => setActiveStep(activeStep - 1)}
              >
                {data.buttons.prev}
              </button>
              <button
                className={styles.filled}
                disabled={activeStep === data.steps.length - 1}
                onClick={() => setActiveStep(activeStep + 1)}
              >
                {data.buttons.next}
              </button>
            </div>
          </div>

          {/* סיכום */}
          <div className={styles.summaryBox}>
            <h3>{data.summaryBox.title}</h3>
            <p>{data.summaryBox.example}</p>
            <p>{data.summaryBox.noDataMessage}</p>
          </div>
        </div>
      </div>
    </section>
  );
}