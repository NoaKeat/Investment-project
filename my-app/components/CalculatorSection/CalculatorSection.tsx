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
  comingSoon: string;
  steps: Step[];
  expensesSection: {
    title: string;
    items: {
      key: "lawyer" | "mortgage";
      label: string;
      amount: number;
    }[];
  };
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

export default function CalculatorSection({
  onNext,
  onPrev,
  data: formData,
  updateField,
}: any) {
  const [jsonData, setJsonData] = useState<CalculatorData | null>(null);
  const [expensesState, setExpensesState] = useState({
    lawyer: false,
    mortgage: false,
  });

  useEffect(() => {
    fetch("/calculator.json")
      .then((res) => res.json())
      .then((json) => setJsonData(json));
  }, []);

  if (!jsonData) return null;

  const currentStep = jsonData.steps[0];

  const price = currentStep.formFields?.find(f => f.id === "price");
  const dealType = currentStep.formFields?.find(f => f.id === "dealType");
  const expenses = currentStep.formFields?.find(f => f.id === "expenses");
  const expenseAmount = currentStep.formFields?.find(f => f.id === "expenseAmount");

  const toggleExpense = (key: "lawyer" | "mortgage") => {
    setExpensesState(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section className={styles.section}>
      <div
        className={styles.comingSoon}
      >
        {jsonData.comingSoon}
      </div>
      <div className={styles.wrapper}>

        {/* שלבים */}
        <div className={styles.stepsWrapper}>
          {jsonData.steps.map((step, index) => (
            <span
              key={step.id}
              className={index === 0 ? styles.activeStep : styles.step}
            >
              שלב {step.number} - {step.label}
            </span>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.formBox}>

            <h2 className={styles.title}>
              שלב {currentStep.number} - {currentStep.label}
            </h2>

            <p className={styles.desc}>
              בשלב זה ממלאים את פרטי הרכש כדי להתחיל חישוב
            </p>

            {/* מחיר */}
            {price && (
              <div className={`${styles.fieldWrapper} ${styles.price}`}>
                <span className={styles.fieldLabel}>{price.label}</span>
                <input
                  className={styles.input}
                  placeholder={price.placeholder}
                  value={formData.price || ""}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
            )}

            {/* סוג עסקה */}
            {dealType && (
              <div className={`${styles.fieldWrapper} ${styles.dealType}`}>
                <span className={styles.fieldLabel}>{dealType.label}</span>
                <select
                  className={styles.input}
                  value={formData.dealType || ""}
                  onChange={(e) => updateField("dealType", e.target.value)}
                >
                  <option>{dealType.placeholder}</option>
                  {dealType.options?.map((opt) => (
                    <option key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 🔥 קופסה כחולה */}
            <div className={styles.blueGroup}>

              {expenses && (
                <div className={styles.fieldWrapper}>
                  <span className={styles.fieldLabel}>{expenses.label}</span>
                  <select
                    className={styles.input}
                    value={formData.expenses || ""}
                    onChange={(e) => updateField("expenses", e.target.value)}
                  >
                    <option>{expenses.placeholder}</option>
                    {expenses.options?.map((opt) => (
                      <option key={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {expenseAmount && (
                <div className={styles.fieldWrapper}>
                  <span className={styles.fieldLabel}>{expenseAmount.label}</span>
                  <input
                    className={styles.input}
                    value={formData.expenseAmount || ""}
                    onChange={(e) => updateField("expenseAmount", e.target.value)}
                  />
                </div>
              )}

              {/* אייקון */}
              <div className={styles.checkIcon}>
                <svg width="28" height="28">
                  <circle cx="14" cy="14" r="14" fill="white" />
                  <path
                    d="M12 18L8 14L9 13L12 16L20 10L21 11L12 18Z"
                    fill="#1D1E44"
                  />
                </svg>
              </div>

            </div>

            {/* הוצאות */}
            <div className={styles.summaryExpenses}>
              <span className={styles.summaryTitle}>
                {jsonData.expensesSection.title}
              </span>

              <div className={styles.expensesRow}>
                {jsonData.expensesSection.items.map((item) => (
                  <div
                    key={item.key}
                    className={`${styles.expenseItem} ${expensesState[item.key] ? styles.active : ""
                      }`}
                    onClick={() => toggleExpense(item.key)}
                  >
                    {item.label}: {item.amount}
                  </div>
                ))}
              </div>
            </div>

            {/* כפתור */}
            <div className={styles.actions}>
              <button className={styles.outline} >
                {jsonData.buttons.prev}
              </button>
              <button className={styles.filled}
              // onClick={onNext}
              >
                {jsonData.buttons.next}
              </button>
            </div>

          </div>

          {/* צד שמאל */}
          <div className={styles.summaryBox}>
            <h3>{jsonData.summaryBox.title}</h3>
            <p>{jsonData.summaryBox.example}</p>
            <p>{jsonData.summaryBox.noDataMessage}</p>
          </div>

        </div>
      </div>
    </section>
  );
}