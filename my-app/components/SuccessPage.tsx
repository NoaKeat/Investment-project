'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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
          <p className="mb-6">קיבלנו את הפרטים שלך — נחזור אליך בהקדם לתיאום הפגישה. ניתן גם להשאיר פרטים ליצירת קשר:</p>

          <a
            href="/#contact"
            className="inline-block px-6 py-2 rounded-full border border-[#E6B360] text-[#E6B360] transition hover:bg-[#E6B360] hover:text-[#1A1B3A]"
          >
            לקביעת פגישה
          </a>
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