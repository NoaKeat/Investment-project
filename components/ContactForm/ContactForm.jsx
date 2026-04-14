import styles from "./ContactForm.module.css";

export default function ContactForm() {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            message: formData.get("message"),
        };

        await fetch("/api/contact", {
            method: "POST",
            body: JSON.stringify(data),
        });

        alert("נשלח בהצלחה 🎉");
    };
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* כותרת */}
                <h2 className={styles.title}>
                    מתכננים את ההשקעה הבאה שלכם?
                    <br />
                    נשמח ללוות אתכם בדרך.
                </h2>

                <p className={styles.subtitle}>
                    נשמח לשמוע כל שאלה או פנייה, ונחזור אליכם בהקדם
                </p>

                {/* טופס */}
                <form className={styles.form}>

                    <div className={styles.row}>
                        <input className={styles.input} placeholder="שם" />
                        <input className={styles.input} placeholder="טלפון" />
                        <input className={styles.input} placeholder="אימייל" />
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder="כתבו את אשר על ליבכם..."
                    />

                    <div className={styles.bottomRow}>
                        <button className={styles.button}>
                            שלחו וניצור קשר בהקדם
                        </button>

                        <div className={styles.icons}>
                            <div className={styles.circle}></div>
                            <div className={styles.circle}></div>
                        </div>
                    </div>

                </form>
            </div>
        </section>
    );
}