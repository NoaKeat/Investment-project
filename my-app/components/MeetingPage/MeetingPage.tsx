import Header from "@/components/Header/Header";
import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./MeetingPage.module.css";
import { PopupWidget } from "react-calendly";
import CalendlyButton from "@/components/CalendlyButton/CalendlyButton";
import ServiceCard from "../ServiceCard/ServiceCard";
import servicesStyles from "@/components/Services/Services.module.css";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection2";
import PromoBanner from "@/components/PromoBanner/PromoBanner"
import MeetingContent from "@/components/MeetingContent/MeetingContent"
import data from "@/data/meetingPage.json"
import promoStyles from "@/components/CalendlyButton/CalendlyButton.module.css";

type Service = {
    id: number;
    tag: string;
    title: string;
    description: string;
    buttonText: string;
    slug: string;
};
type PromoData = {
    title: string;
    oldPrice: string;
    price: string;
    buttonText: string;
};
export default function MeetingPage({
    title,
    subtitle,
    bullets,
    hasCalendar = false,
    promo,
    otherServices,
    image
}: {
    title: string;
    subtitle: string;
    bullets: string[];
    hasCalendar?: boolean;
    promo?: PromoData; // ✅ חשוב
    otherServices: Service[];
    image: string;
}) {

    console.log("image:", image);
    return (
        <>
            <Header />

            {/* HERO */}
            <section className={styles.hero}>
                <div
                    className={styles.heroBg}
                    style={{ backgroundImage: `url(${image})` }}
                />

                <div className={styles.heroContent}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    
                    {hasCalendar && <CalendlyButton className={promoStyles.button} />}
                </div>
            </section>

            {/* CONTENT */}
            <MeetingContent
                title={title}
                bullets={bullets}
                hasCalendar={hasCalendar}
            />

            {hasCalendar && promo && <PromoBanner data={promo} />}

            <TestimonialsSection />
            <div className={styles.moreServices}>
                <h3 className={styles.moreServicesTitle}>
                    {data.moreServicesTitle}
                </h3>
                <div className={`${servicesStyles.cardsWrapper} ${styles.threeFix}`}>
                    {otherServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
            <ContactForm />
        </>
    );
}