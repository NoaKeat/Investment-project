
import CalendlyButton from "@/components/CalendlyButton/CalendlyButton";
import styles from "./PromoBanner.module.css";

interface PromoData {
  title: string;
  oldPrice: string;
  price: string;
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
  const W: number = TAG_W + RECT_W; // 1194.42
  const CUT: number = 30;
  const NOTCH_H: number = 24;

  const tagPoints: Point[] = [
    [0, 0],
    [TAG_W - CUT, 0],
    [TAG_W, NOTCH_H],
    [TAG_W, H - NOTCH_H],
    [TAG_W - CUT, H],
    [0, H],
  ];

  const tagPath: string =
    tagPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  const stripeW: number = TAG_W / 4;

  const rectPoints: Point[] = [
    [TAG_W + CUT, 0],
    [W, 0],
    [W, H],
    [TAG_W + CUT, H],
    [TAG_W, H - NOTCH_H],
    [TAG_W, NOTCH_H],
  ];

  const rectPath: string =
    rectPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  return (
    <section className={styles.section}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="tag-clip">
            <path d={tagPath} />
          </clipPath>

          <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity={0.06} />
            <stop offset="40%" stopColor="white" stopOpacity={0.02} />
            <stop offset="60%" stopColor="black" stopOpacity={0.02} />
            <stop offset="100%" stopColor="black" stopOpacity={0.06} />
          </linearGradient>

          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(115)">
            <stop offset="29.01%" stopColor="#E6B360" />
            <stop offset="51.11%" stopColor="#FFFCC1" />
            <stop offset="70.37%" stopColor="#E6B360" />
          </linearGradient>
        </defs>

    
          <image
            href="/images/meeting.png"
            x="0"
            y="0"
            width={TAG_W}
            height={H}
            preserveAspectRatio="xMidYMid slice"
          />
          
        

        {/* הצד הימני */}
        <path d={rectPath} fill="#1b1e3b" />
        <path
          d={rectPath}
          fill="none"
          stroke="url(#gold-grad)"
          strokeWidth={1.5}
          strokeLinejoin="miter"
        />

        {/* שכבת התוכן – בתוך ה-SVG */}
        <foreignObject
          x={TAG_W + 35}
          y={25}
          width={RECT_W - 70}
          height={H - 50}
        >
          <div className={styles.banner}>
            {/* חלק עליון - טקסטים */}
            <div className={styles.textGroup}>
              <h2 className={styles.title}>
                {data.title}
              </h2>
              <div className={styles.pricesGroup}>
                <span className={styles.oldPrice}>
                  {data.oldPrice}
                </span>
                <span className={styles.price}>
                  {data.price}
                </span>
              </div>
            </div>

            {/* חלק תחתון - כפתור */}
            <div className={styles.buttonGroup}>
              <CalendlyButton />
            </div>
          </div>
        </foreignObject>
      </svg>
    </section>
  );
}