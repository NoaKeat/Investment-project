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
                aria-label="שלח הודעה בוואטסאפ"
                style={{
                  // הגדרות העיגול הצהוב
                  display: 'flex',
                  alignItems: 'center',       // מרכז אנכית
                  justifyContent: 'center',   // מרכז אופקית
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#E5B260',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                {/* האיקון - ממורכז אוטומטית ע"י ה-Flex של ה-a */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22.81"
                  height="23.24"
                  viewBox="0 0 23 24"
                  fill="#1A1B3A"
                >
                  <path d="M11.4053 0C17.7041 2.66502e-05 22.8105 5.10641 22.8105 11.4053C22.8104 17.704 17.7041 22.8105 11.4053 22.8105C9.67317 22.8105 8.0309 22.4243 6.56055 21.7334L1.05176 23.2393L2.10449 18.0068C0.779848 16.1438 5.56925e-05 13.8653 0 11.4053C3.85989e-05 5.10642 5.10643 3.86002e-05 11.4053 0ZM11.4053 0.768555C5.53098 0.768593 0.76957 5.53096 0.769531 11.4053C0.769587 13.7004 1.49542 15.8234 2.73047 17.5605L2.92285 17.832L2.0498 22.1689L6.35742 20.9912L6.63086 20.917L6.88672 21.0371C8.25702 21.681 9.78837 22.041 11.4053 22.041C17.2795 22.041 22.0409 17.2795 22.041 11.4053C22.041 5.53096 17.2796 0.768581 11.4053 0.768555ZM10.1895 8.54004L8.21973 10.5098C9.07871 12.5208 10.4949 13.937 12.4385 14.7354L14.4092 12.7656L17.7676 16.1182L17.7324 16.1543L16.0664 17.8203C15.46 18.4267 14.6355 18.7646 13.75 18.7646C11.6424 18.7645 9.25314 17.4211 7.39355 15.5615C5.53385 13.7018 4.19043 11.3118 4.19043 9.2041C4.19058 8.359 4.49866 7.57083 5.05371 6.96875H5.04297L6.79492 5.2168L6.83105 5.18164L10.1895 8.54004ZM5.59863 7.35352C5.11333 7.8333 4.84781 8.49061 4.84766 9.2041C4.84766 11.1076 6.11237 13.3331 7.86426 15.085C9.61614 16.8368 11.8416 18.1016 13.7451 18.1016C14.4584 18.1014 15.1101 17.8352 15.5957 17.3496L16.8271 16.1182L14.4102 13.7002L12.626 15.4844L12.6025 15.5068L12.5723 15.4951L12.4033 15.4277L11.9824 15.2549C9.913 14.347 8.4135 12.7645 7.52734 10.5518L7.45996 10.377L7.44824 10.3467L7.4707 10.3232L9.25977 8.53418L6.83203 6.12109L5.59863 7.35352Z" fill="#1A1B3A" />
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


        </form>

      </div>
    </section>
  );
}