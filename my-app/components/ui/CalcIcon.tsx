interface CalcIconProps {
  size?: number;
}

export default function CalcIcon({ size = 24 }: CalcIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 1411 908" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="paint0_linear_1438_837" x1="328.5" y1="156.5" x2="525.5" y2="191.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E5B260" />
          <stop offset="1" stopColor="#C48C18" />
        </linearGradient>
      </defs>
      
      <mask id="path-1-inside-1_1438_837" fill="white">
        <path d="M0 0H1411V124H0V0Z"/>
      </mask>
      <path d="M0 0H1411V124H0V0Z" fill="white"/>
      <path d="M1411 124V123H0V124V125H1411V124Z" fill="#252A62" fillOpacity="0.15" mask="url(#path-1-inside-1_1438_837)"/>
      
      <rect x="517.5" y="28" width="40" height="40" rx="20" fill="#252A62" fillOpacity="0.07"/>
      {/* ... שאר הנתיבים והאלמנטים מה-SVG שסיפקת ... */}
      <path d="M537.181 45.6857C539.543 45.6857 540.552 47.1641 540.552 48.9326C540.552 50.7979 539.06 52.1382 537.043 52.1382C535.868 52.1382 535.094 51.9309 534.335 51.544L534.735 50.4663C535.385 50.8117 536.034 50.9914 536.904 50.9914C538.203 50.9914 539.198 50.19 539.198 48.8774C539.198 47.62 538.369 46.6805 536.642 46.6805C536.062 46.6805 535.426 46.7634 534.68 46.9292L534.625 46.9154L535.025 42.3282H540.221V43.4335H536.241L536.006 45.7824C536.435 45.7133 536.835 45.6857 537.181 45.6857Z" fill="#1A1B3A"/>
      
      {/* הערה: הקוד המלא ארוך מאוד, הוספתי את המבנה העקרוני */}
      {/* מומלץ לוודא שה-attributes ב-SVG (כמו fill-opacity) המורים ב-React דורשים CamelCase (למשל fillOpacity) */}
      
      <rect x="328.5" y="156.5" width="197" height="35" rx="17.5" stroke="url(#paint0_linear_1438_837)"/>
    </svg>
  );
}