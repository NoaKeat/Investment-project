import CalendlyButton from "@/components/CalendlyButton/CalendlyButton";
import styles from "./PromoBanner.module.css";
import promoStyles from "@/components/CalendlyButton/CalendlyButton.module.css";
interface PromoData {
  title: string;
  description?: string; // המשתנה שמכיל את פירוט הבדיקה
  buttonText: string;
}

interface PromoBannerProps {
  data: PromoData;
}

type Point = [number, number];

export default function PromoBanner({ data }: PromoBannerProps) {
  const TAG_W: number = 368.316;
  const RECT_W: number = 826.104;
  const H: number = 243.945;
  const W: number = TAG_W + RECT_W;
  const CUT: number = 30;
  const NOTCH_H: number = 24;

  const tagPoints: Point[] = [
    [0, 0], [TAG_W - CUT, 0], [TAG_W, NOTCH_H],
    [TAG_W, H - NOTCH_H], [TAG_W - CUT, H], [0, H],
  ];
  const tagPath: string = tagPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

const rectPoints: Point[] = [
    [TAG_W + CUT, 0], 
    [W - 2, 0], 
    [W - 2, H - 5], // הוספנו מרווח קטן מהקצה התחתון של ה-SVG
    [TAG_W + CUT, H - 5], // כאן זה מסתיים
    [TAG_W, H - NOTCH_H], 
    [TAG_W, NOTCH_H],
  ];
  const rectPath: string = rectPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  return (
    <section className={styles.section}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(115)">
            <stop offset="29.01%" stopColor="#E6B360" />
            <stop offset="51.11%" stopColor="#FFFCC1" />
            <stop offset="70.37%" stopColor="#E6B360" />
          </linearGradient>
        </defs>

        {/* צד שמאל - תמונה */}
        <image href="/images/meeting.png" x="0" y="0" width={TAG_W} height={H} preserveAspectRatio="xMidYMid slice" />

        {/* צד ימין - רקע כהה ומסגרת זהב */}
        <path d={rectPath} fill="#1b1e3b" />
        <path d={rectPath} fill="none" stroke="url(#gold-grad)" strokeWidth={1.5} />

        {/* פס זהב תחתון - משולב בצורה המדויקת */}
      

        {/* תוכן הטקסט */}
        <foreignObject x={TAG_W + 35} y={25} width={RECT_W - 70} height={H - 50}>
          <div className={styles.banner}>
            <div className={styles.textGroup}>
              {/* הכותרת בזהב */}
              <h2 className={styles.title}>{data.title}</h2>

              {/* שורת המחץ: זה מה שמציג את הטקסט הלבן במקום המספרים */}
              {data.description && (
                <p className={styles.description}>{data.description}</p>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <CalendlyButton className={promoStyles.button} />
            </div>
          </div>
        </foreignObject>
          
      </svg>
    </section>
  );
}