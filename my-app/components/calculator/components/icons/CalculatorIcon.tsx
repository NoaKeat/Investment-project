const CalculatorIcon = () => (
  <svg
    width="19"
    height="25"
    viewBox="0 0 19 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* מסגרת חיצונית */}
    <rect
      x="0.6"
      y="0.6"
      width="17.8"
      height="23.8"
      rx="2.4"
      stroke="url(#calcGold)"
      strokeWidth="1.2"
    />

    {/* מסך תצוגה */}
    <rect
      x="2.5"
      y="2.8"
      width="14"
      height="5.2"
      rx="0.8"
      fill="url(#calcGold)"
      opacity="0.55"
    />

    {/* שורת כפתורים 1 */}
    <rect x="2.5"  y="10.5" width="3.5" height="3" rx="0.6" fill="url(#calcGold)" />
    <rect x="7.75" y="10.5" width="3.5" height="3" rx="0.6" fill="url(#calcGold)" />
    <rect x="13"   y="10.5" width="3.5" height="3" rx="0.6" fill="url(#calcGold)" />

    {/* שורת כפתורים 2 */}
    <rect x="2.5"  y="15" width="3.5" height="3" rx="0.6" fill="url(#calcGold)" />
    <rect x="7.75" y="15" width="3.5" height="3" rx="0.6" fill="url(#calcGold)" />
    <rect x="13"   y="15" width="3.5" height="3" rx="0.6" fill="url(#calcGold)" />

    {/* שורת כפתורים 3 — כפתור רחב + כפתור */}
    <rect x="2.5"  y="19.5" width="8.75" height="3" rx="0.6" fill="url(#calcGold)" />
    <rect x="13"   y="19.5" width="3.5"  height="3" rx="0.6" fill="url(#calcGold)" />

    <defs>
      <linearGradient
        id="calcGold"
        x1="0"
        y1="0"
        x2="19"
        y2="25"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.29" stopColor="#E6B360" />
        <stop offset="0.51" stopColor="#FFFCC1" />
        <stop offset="0.70" stopColor="#E6B360" />
      </linearGradient>
    </defs>
  </svg>
);

export default CalculatorIcon;
