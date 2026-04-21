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

export default function CalculatorSection() {
  const [data, setData] = useState<CalculatorData | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [expensesState, setExpensesState] = useState({
    lawyer: false,
    mortgage: false,
  });

  useEffect(() => {
    fetch("/calculator.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return null;

  const toggleExpense = (key: "lawyer" | "mortgage") => {
    setExpensesState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const currentStep = data.steps[activeStep];

  const price = currentStep.formFields?.find(f => f.id === "price");
  const dealType = currentStep.formFields?.find(f => f.id === "dealType");
  const expenses = currentStep.formFields?.find(f => f.id === "expenses");
  const expenseAmount = currentStep.formFields?.find(f => f.id === "expenseAmount");

  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>

        {/* שלבים */}
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

            {/* כותרת */}
            <h2 className={styles.title}>
              שלב {currentStep.number} - {currentStep.label}
            </h2>

            {/* תיאור */}
            <p className={styles.desc}>
              בשלב זה ממלאים את פרטי הרכש כדי שנוכל להתחיל בחישוב.
            </p>

            {/* מחיר */}
            {price && (
              <div className={`${styles.fieldWrapper} ${styles.price}`}>
                <span className={styles.fieldLabel}>
                  {price.required && "*"} {price.label}
                </span>
                <input
                  type={price.type}
                  className={styles.input}
                  placeholder={price.placeholder}
                />
              </div>
            )}

            {/* סוג עסקה */}
            {dealType && (
              <div className={`${styles.fieldWrapper} ${styles.dealType}`}>
                <span className={styles.fieldLabel}>
                  {dealType.required && "*"} {dealType.label}
                </span>

                <div className={styles.selectWrapper}>
                  <select className={styles.input}>
                    <option>{dealType.placeholder}</option>
                    {dealType.options?.map((opt) => (
                      <option key={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 🔥 הקופסה הכחולה */}
            <div className={styles.blueGroup}>
              {expenses && (
                <div className={styles.fieldWrapper}>
                  <span className={styles.fieldLabel}>
                    {expenses.required && "*"} {expenses.label}
                  </span>

                  <div className={styles.selectWrapper}>
                    <select className={styles.input}>
                      <option>{expenses.placeholder}</option>
                      {expenses.options?.map((opt) => (
                        <option key={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {expenseAmount && (
                <div className={styles.fieldWrapper}>
                  <span className={styles.fieldLabel}>
                    {expenseAmount.required && "*"} {expenseAmount.label}
                  </span>

                  <input
                    type="number"
                    className={styles.input}
                    placeholder={expenseAmount.placeholder}
                  />
                </div>
              )}

              <div className={styles.checkIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <circle cx="14" cy="14" r="14" fill="white" />
                  <path
                    d="M12.2086 18C11.9937 18.0004 11.7808 17.9625 11.5823 17.8885C11.3837 17.8146 11.2033 17.7061 11.0514 17.5691L8 14.8219L8.77145 14.1267L11.8229 16.8745C11.9252 16.9666 12.0639 17.0183 12.2086 17.0183C12.3532 17.0183 12.492 16.9666 12.5943 16.8745L20.2286 10L21 10.6947L13.3657 17.5691C13.2139 17.7061 13.0335 17.8146 12.8349 17.8885C12.6363 17.9625 12.4235 18.0004 12.2086 18Z"
                    fill="#1D1E44"
                  />
                </svg>
              </div>
            </div>

            {/* סיכום הוצאות */}
            <div className={styles.summaryExpenses}>
              <span className={styles.summaryTitle}>
                {data.expensesSection.title}
              </span>

              <div className={styles.expensesRow}>
                {data.expensesSection.items.map((item) => (
                  <div
                    key={item.key}
                    className={`${styles.expenseItem} ${expensesState[item.key] ? styles.active : ""
                      }`}
                    onClick={() => toggleExpense(item.key)}
                  >
                    <span>
                      {item.label}: {item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* כפתורים */}
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

          {/* צד שמאל */}
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