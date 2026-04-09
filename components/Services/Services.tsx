import styles from "./Services.module.css";

export default function ServicesSection() {
    return (
        <section className={styles.servicesSection}>
            <div className={styles.inner}>
                <div className={styles.backgroundShape}></div>

                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>01</span>
                    <span className={styles.sectionTitle}>: מה אנחנו עושים   </span>
                </div>

                <div className={styles.cardsWrapper}>
                    <div className={styles.card}>
                        <span className={styles.tag}>עסקי</span>
                        <h3>פגישת אפיון</h3>
                        <p>
                            פגישת אפיון היא הצעד המכריע שעובר בין "חיפוש דירה" לבין השקעה חכמה.
                            מטרת הפגישה היא לזקק את המטרות הכלכליות שלך ולבנות אסטרטגיה מותאמת אישית, עוד לפני שבוחנים נכס ספציפי בשטח.
                        </p>
                        <button>לקביעת פגישה</button>

                    </div>
                    <div className={styles.card}>
                        <span className={styles.tag}>פרטי וטכני</span>
                        <h3>ניתוח עסקה</h3>
                        <p>
                            זהו תהליך שבו בוחנים את כדאיות ההשקעה באמצעות חישוב תשואה, תזרים מזומנים ופוטנציאל השבחה.
                            ניתוח מקצועי מנטרל רגשות ומבטיח שהעסקה אכן רווחית ותואמת את היעדים הפיננסיים שלך.
                        </p>
                        <button>לקביעת פגישה</button>
                    </div>


                    <div className={styles.card}>
                        <span className={styles.tag}>פרטי</span>
                        <h3>ליווי משקיעים</h3>
                        <p>
                            הליווי כולל אפיון צרכים וניתוח פיננסי, איתור הזדמנויות מתחת למחיר השוק, ניהול מו"מ קשוח וליווי צמוד עד לחתימה (ולעיתים גם בניהול הנכס).
                            המטרה היא לחסוך למשקיע זמן וטעויות יקרות, תוך מקסום התשואה וצמצום הסיכונים בעסקה..
                        </p>
                        <button>לקביעת פגישה</button>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.tag}>עסקי</span>
                        <h3>תיווך עסקאות זכויות</h3>
                        <p>המוקד הוא זיהוי פוטנציאל עתידי (התחדשות עירונית או שינוי ייעוד) ויצירת עסקאות "מחוץ לשוק" המבוססות על כדאיות כלכלית ותכנונית למימוש רווח מקסימלי.
                        </p>
                        <button>לקביעת פגישה</button>
                    </div>


                </div>
            </div>
        </section>
    );
}