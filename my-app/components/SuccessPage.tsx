'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InlineWidget } from 'react-calendly';

// 2. הקומפוננטה הפנימית שמבצעת את הלוגיקה
const SuccessPageContent = () => {
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // בודקים שהפרמטר Response שווה ל-000 (אישור מטרנזיליה)
    const responseCode = searchParams.get('Response'); 
    
    if (responseCode === '000') {
      setIsAuthorized(true);
    }
  }, [searchParams]);

  return (
    <div className="p-8">
      {isAuthorized ? (
        <>
          <h1 className="text-2xl font-bold mb-4">תודה רבה! התשלום בוצע בהצלחה.</h1>
          <p>כעת ניתן לקבוע את הפגישה שלך ביומן למטה:</p>
          
          <div style={{ height: '700px' }}>
            {/* כאן תכניסי את הלינק המלא של קלנדלי שלך */}
            <InlineWidget url="https://calendly.com/YOUR_LINK" />
          </div>
        </>
      ) : (
        <h1 className="text-red-500">משהו השתבש, לא ניתן לאמת את התשלום.</h1>
      )}
    </div>
  );
};

// 3. הקומפוננטה הראשית שעוטפת הכל ב-Suspense (חובה ב-Next.js)
export default function SuccessPage() {
  return (
    <Suspense fallback={<div>טוען את הדף...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}