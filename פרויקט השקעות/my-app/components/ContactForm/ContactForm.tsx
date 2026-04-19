"use client";
import { useState, useEffect } from "react";
import styles from "./ContactForm.module.css";
import FormStatus from "../FormStatus/FormStatus";

interface FormField {
  name: string;
  placeholder: string;
  label: string;
  type: string;
  required: boolean;
}

interface ContactData {
  title: string;
  subtitle: string;
  formFields: FormField[];
  buttons: {
    default: string;
    loading: string;
  };
  messages: {
    success: string;
    error: string;
  };
  apiEndpoint: string;
}

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<ContactData | null>(null);

  useEffect(() => {
    fetch("/contact.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus("loading");
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = Object.fromEntries(formData);

    try {
      const res = await fetch(data?.apiEndpoint || "/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Server error");

      setStatus("success");
      setMessage(data?.messages.success || "ההודעה נשלחה בהצלחה ✨");

      form.reset();

      setTimeout(() => setStatus("idle"), 4000);

    } catch (err) {
      console.error("MAIL ERROR:", err);
      setStatus("error");
      setMessage(data?.messages.error || "שליחה נכשלה, נסי שוב");
    }
  };

  if (!data) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        <h2 className={styles.title}>
          {data.title}
        </h2>

        <p className={styles.subtitle}>
          {data.subtitle}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.row}>
            {data.formFields.slice(0, 3).map((field) => (
              <div key={field.name} className={styles.field}>
                <label>{field.label}</label>
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={styles.input}
                  required={field.required}
                />
              </div>
            ))}
          </div>

          <div className={styles.fieldFull}>
            <label>{data.formFields[3]?.label}</label>
            <textarea
              name={data.formFields[3]?.name}
              placeholder={data.formFields[3]?.placeholder}
              className={styles.textarea}
            />
          </div>

          <div className={styles.bottomRow}>

            {/* אייקונים */}
            <div className={styles.icons}>

              <div className={styles.circle}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M16.125 1.5H1.875C0.8415 1.5 0 2.3415 0 3.375V16.5H18V3.375C18 2.3415 17.1585 1.5 16.125 1.5ZM1.875 2.25H16.125C16.5255 2.25 16.875 2.4615 17.0745 2.77725L10.8705 8.98125C10.374 9.477 9.7155 9.75 9.01125 9.75H8.9985C8.313 9.73725 7.629 9.48 7.1295 8.98125L0.9255 2.77725C1.125 2.4615 1.4745 2.25 1.875 2.25ZM0.75 15.75V3.66225L6.59925 9.5115C7.2375 10.1497 8.08425 10.5 8.982 10.5H9.015C9.9165 10.5 10.7632 10.1497 11.4015 9.5115L17.2507 3.66225V15.75H0.75Z" fill="#1A1B3A" />
                </svg>
              </div>

              <div className={styles.circle}>
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
                  <g clipPath="url(#clip0)">
                    <path d="M12.6333 6.46158L18.5467 0.82175C18.4783 0.80275 18.4067 0.792458 18.3333 0.792458H14.1667V0H18.3333C19.2392 0 19.9758 0.710125 19.9758 1.58333L20 5.53929L19.1667 5.54404L19.1425 1.58571C19.1425 1.52158 19.1342 1.45904 19.1183 1.39887L13.2242 7.0205L12.6333 6.46158ZM14.6058 10.9543L19.3392 15.451L16.9392 17.7302C16.0792 18.5487 14.9125 19 13.6558 19C7.65667 19 0 11.7262 0 6.02775C0 4.83313 0.475 3.72479 1.33667 2.90779L3.73583 0.627792L8.46917 5.12367L5.65917 7.79396C6.9 10.5727 8.9625 12.5337 11.7917 13.6278L14.6058 10.9543ZM18.1608 15.451L14.6058 12.0737L11.9967 14.5524L11.7442 14.4606C8.4775 13.2763 6.135 11.0509 4.78083 7.84858L4.67833 7.60554L7.29083 5.12367L3.73583 1.748L1.92583 3.4675C1.22083 4.13567 0.8325 5.04529 0.8325 6.02775C0.8325 11.2646 8.14167 18.2083 13.655 18.2083C14.6892 18.2083 15.6458 17.8394 16.3492 17.1697L18.16 15.4502L18.1608 15.451Z" fill="#1A1B3A" />
                  </g>
                  <defs>
                    <clipPath id="clip0">
                      <rect width="20" height="19" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>

            </div>

            <button
              className={styles.button}
              disabled={status === "loading"}
            >
              {status === "loading"
                ? data.buttons.loading
                : data.buttons.default}
            </button>

          </div>

          {/* הודעת סטטוס */}
          <FormStatus status={status} message={message} />

        </form>

      </div>
    </section>
  );
}