"use client";
import { useState, useEffect } from "react";
import styles from "./ContactForm.module.css";


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
  buttons: { default: string; loading: string; };
  messages: { success: string; error: string; };
  apiEndpoint: string;
  contactLinks: { phone: string; whatsapp: string; }; // <--- להוסיף את זה
}

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState<ContactData | null>(null);

  useEffect(() => {
    fetch("/contact.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus("loading");


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

      form.reset();

      setTimeout(() => setStatus("idle"), 4000);

    } catch (err) {
      console.error("MAIL ERROR:", err);
      setStatus("error");
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

              {/* 1. איקון טלפון - משתמשים ב-SVG שלך */}
              <a href={`tel:${data?.contactLinks?.phone}`} className={styles.circle} aria-label="התקשר אלינו">
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
                  <g clipPath="url(#clip0)">
                    {/* זה ה-path המקורי שלך, הוא נראה כמו טלפון */}
                    <path d="M12.6333 6.46158L18.5467 0.82175C18.4783 0.80275 18.4067 0.792458 18.3333 0.792458H14.1667V0H18.3333C19.2392 0 19.9758 0.710125 19.9758 1.58333L20 5.53929L19.1667 5.54404L19.1425 1.58571C19.1425 1.52158 19.1342 1.45904 19.1183 1.39887L13.2242 7.0205L12.6333 6.46158ZM14.6058 10.9543L19.3392 15.451L16.9392 17.7302C16.0792 18.5487 14.9125 19 13.6558 19C7.65667 19 0 11.7262 0 6.02775C0 4.83313 0.475 3.72479 1.33667 2.90779L3.73583 0.627792L8.46917 5.12367L5.65917 7.79396C6.9 10.5727 8.9625 12.5337 11.7917 13.6278L14.6058 10.9543ZM18.1608 15.451L14.6058 12.0737L11.9967 14.5524L11.7442 14.4606C8.4775 13.2763 6.135 11.0509 4.78083 7.84858L4.67833 7.60554L7.29083 5.12367L3.73583 1.748L1.92583 3.4675C1.22083 4.13567 0.8325 5.04529 0.8325 6.02775C0.8325 11.2646 8.14167 18.2083 13.655 18.2083C14.6892 18.2083 15.6458 17.8394 16.3492 17.1697L18.16 15.4502L18.1608 15.451Z" fill="#1A1B3A" />
                  </g>
                  <defs>
                    <clipPath id="clip0">
                      <rect width="20" height="19" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>

              <a
                href={`https://wa.me/${data?.contactLinks?.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.circle}
                aria-label="שלח הודעה בוואטסאפ"
              >
                {/* אייקון וואטסאפ: בועה דקה + טלפון גדול בולט */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* הבועה החיצונית */}
                  <path
                    d="M12.01 2c5.52 0 9.99 4.47 9.99 9.98 0 1.92-.54 3.73-1.48 5.28L22 22l-4.94-1.38c-1.51.85-3.23 1.33-5.05 1.33-5.52 0-9.99-4.47-9.99-9.98C2.02 6.47 6.49 2 12.01 2z"
                    stroke="#1A1B3A"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* הטלפון - מוגדל משמעותית (scale 1.4) וממורכז */}
                  <path
                    d="M16.12 14.84l-1.09-.55c-.2-.1-.4-.05-.53.1l-.64.81c-.13.16-.33.16-.54.06a7.43 7.43 0 01-3.08-3.08c-.1-.2-.1-.4.06-.53l.81-.64c.15-.13.2-.33.1-.53l-.55-1.09c-.1-.2-.3-.25-.49-.15l-.64.32c-.37.19-.54.62-.36 1.01.69 1.49 2.02 2.82 3.51 3.51.39.18.82.01 1.01-.36l.32-.64c.1-.19.05-.39-.15-.49z"
                    stroke="#1A1B3A"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="scale(1.4) translate(-4, -3.5)"
                  />
                </svg>
              </a>
            </div>

            <button
              className={`${styles.button} 
  ${status === "success" ? styles.success : ""} 
  ${status === "error" ? styles.error : ""}`}
              disabled={status === "loading"}
            >
              {status === "loading"
                ? data.buttons.loading
                : status === "success"
                  ? data.messages.success
                  : status === "error"
                    ? data.messages.error
                    : data.buttons.default}
            </button>

          </div>

          {/* הודעת סטטוס */}

        </form>

      </div>
    </section>
  );
}