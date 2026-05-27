import styles from "./Statement.module.css";
import data from "@/data/statement.json";

export default function Statement() {
  return (
    <section className={styles.statementSection}>
      <div className={styles.statementInner}>
      <div className={styles.backgroundShape}>
        {/* SVG גדול */}
        <svg
          className={styles.shapeBig}
          viewBox="0 0 500 552"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M499.903 551.691H417.318C417.311 551.691 417.304 551.688 417.299 551.683L17.3693 154.08C17.3526 154.064 17.3241 154.075 17.3241 154.099V245.975C17.3241 245.982 17.3208 245.989 17.3151 245.994L0.0439343 261.14C0.0268207 261.155 0 261.143 0 261.12V29.3655C0 29.342 0.0291275 29.3308 0.0458095 29.3474L447.45 476.485C447.466 476.502 447.496 476.49 447.496 476.467V0.0494204C447.496 0.0256082 447.525 0.0139011 447.541 0.0310302L499.994 54.3473C499.998 54.3522 500.001 54.3588 500.001 54.3657L499.93 551.664C499.93 551.679 499.918 551.691 499.903 551.691Z" fill="#fff" />
          <path d="M421.376 415.432V0.0265138C421.376 0.00688295 421.355 -0.00591834 421.338 0.00278203L302.254 58.8786C302.245 58.8831 302.239 58.8923 302.239 58.9024V296.349C302.239 296.356 302.242 296.363 302.247 296.367L421.331 415.451C421.348 415.468 421.376 415.456 421.376 415.432Z" fill="#fff" opacity="0.6" />
        </svg>

        {/* SVG קטן */}
        <svg
          className={styles.shapeSmall}
          viewBox="0 0 339 339"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0.0264903 338.45H338.423C338.447 338.45 338.458 338.421 338.442 338.404L0.045213 0.00785953C0.0285333 -0.00882022 0 0.00299357 0 0.0265823V338.423C0 338.438 0.0118673 338.45 0.0264903 338.45Z" fill="#fff" opacity="0.4" />
        </svg>
      </div>

      {/* מרכאות */}
      <div className={styles.quoteIcon}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="116"
          height="94"
          viewBox="0 0 116 94"
          fill="none"
        >
          <path d="M20.2178 0.500122H50.0449V49.4415C50.0328 60.9733 45.8123 72.0216 38.3203 80.1642C30.9479 88.1769 21.0026 92.7267 10.6094 92.881V82.8947C17.7211 82.7555 24.5706 79.9555 29.998 74.965C35.5515 69.8586 39.2597 62.7899 40.4756 55.0118L40.5654 54.4347H0.5V21.9738C0.500065 16.2658 2.58713 10.799 6.29004 6.77454C9.99163 2.75161 15.0025 0.500201 20.2178 0.500122Z" stroke="url(#paint0)" />
          <path d="M85.3428 0.500244H115.17V49.4417C115.158 60.9735 110.937 72.0217 103.445 80.1643C96.0729 88.177 86.1276 92.7269 75.7344 92.8811V82.8948C82.8461 82.7556 89.6956 79.9556 95.123 74.9651C100.677 69.8587 104.385 62.7901 105.601 55.012L105.69 54.4348H65.625V21.9739C65.6251 16.2659 67.7121 10.7992 71.415 6.77466C75.1166 2.75173 80.1275 0.500323 85.3428 0.500244Z" stroke="url(#paint1)" />
          <defs>
            <linearGradient id="paint0">
              <stop offset="0.36" stopColor="#E6B360" />
              <stop offset="0.54" stopColor="#FFFCC1" />
              <stop offset="0.71" stopColor="#E6B360" />
            </linearGradient>
            <linearGradient id="paint1">
              <stop offset="0.36" stopColor="#E6B360" />
              <stop offset="0.54" stopColor="#FFFCC1" />
              <stop offset="0.71" stopColor="#E6B360" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* טקסט */}
      <div className={styles.statementText}>
        {data.quote}
        <br />
        <span className={styles.goldText}>
          {data.quoteBold}
        </span>
      </div>
      </div>

    </section>
  );
}