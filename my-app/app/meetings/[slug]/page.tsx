import { notFound } from "next/navigation";
import servicesData from "@/data/services.json";
import serviceDetails from "@/data/meetings.json";
import MeetingPage from "@/components/MeetingPage/MeetingPage";
type Slug = keyof typeof serviceDetails;
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
  const { slug } = await params; // 🔥 זה התיקון

  const data = servicesData.services.find(
    (item) => item.slug === slug
  );

  const details = serviceDetails[
  slug as keyof typeof serviceDetails
] as ServiceDetails;

  const otherServices = servicesData.services.filter(
    (item) => item.slug !== slug
  );

  if (!data || !details) return notFound();

  return (
    <MeetingPage
      title={data.title}
      subtitle={details.subtitle}
      bullets={details.bullets}
      hasCalendar={details.hasCalendar}
      promo={details?.promo}
      otherServices={otherServices}
      image={details.image} 
    />
  );
}