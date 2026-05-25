import { notFound } from "next/navigation";
import servicesData from "@/data/services.json";
import serviceDetails from "@/data/meetings.json";
import MeetingPage from "@/components/MeetingPage/MeetingPage";
// או false תלוי בהגדרות
type ServiceDetails = {
  subtitle: string;
  bullets: string[];
  hasCalendar: boolean;
  image: string;
  promo?: {
    title: string;
    oldPrice: string;
    price: string;
    buttonText: string;
  };
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. נסיון למצוא נתונים כלליים מ-services.json (אופציונלי)
  const data = servicesData.services.find(
    (item) => item.slug === slug
  );

  // 2. שליפת הפרטים מתוך meetings.json (זה הקובץ הקובע)
  const details = serviceDetails[
    slug as keyof typeof serviceDetails
  ] as ServiceDetails;

  // 3. התיקון: אנחנו מחזירים 404 רק אם המידע לא קיים ב-meetings.json
  // הורדנו את התלות ב-data (services.json)
  if (!details) return notFound();

  // סינון שאר השירותים להצגה בתחתית העמוד (אם תרצי)
  const otherServices = servicesData.services.filter(
    (item) => item.slug !== slug
  );

  return (
    <MeetingPage
      // אם data לא נמצא, נשתמש בכותרת ברירת מחדל או בטקסט חלופי
      title={data?.title || "בדיקת עסקה"} 
      subtitle={details.subtitle}
      bullets={details.bullets}
      hasCalendar={details.hasCalendar}
      promo={details?.promo}
      otherServices={otherServices.slice(0, 3)} // מציגים רק 3 שירותים קשורים
      image={details.image} 
    />
  );
}