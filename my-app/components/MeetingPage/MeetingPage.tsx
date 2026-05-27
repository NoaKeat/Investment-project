import Header from "@/components/Header/Header";
import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./MeetingPage.module.css";
import { PopupWidget } from "react-calendly";
import CalendlyButton from "@/components/CalendlyButton/CalendlyButton";
import calendlyStyles from "@/components/CalendlyButton/CalendlyButton.module.css";
import ServiceCard from "../ServiceCard/ServiceCard";
import servicesStyles from "@/components/Services/Services.module.css";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection2";
import PromoBanner from "@/components/PromoBanner/PromoBanner"
import MeetingContent from "@/components/MeetingContent/MeetingContent"
import data from "@/data/meetingPage.json"
import meetings from "@/data/meetings.json"

type MeetingDetail = {
    image: string;
    imageMobile?: string;
};

function getMobileHeroImage(image: string): string {
    const entry = Object.values(meetings as Record<string, MeetingDetail>).find(
        (item) => item.image === image
    );

    return entry?.imageMobile ?? image;
}

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

    const mobileHeroImage = getMobileHeroImage(image);

    return (
        <>
            <Header />

            {/* HERO */}
            <section className={styles.hero}>
                <div
                    className={styles.heroBg}
                    style={{
                        ["--hero-bg-desktop" as string]: `url(${image})`,
                        ["--hero-bg-mobile" as string]: `url(${mobileHeroImage})`,
                    }}
                />

                <div className={styles.heroContent}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    {hasCalendar && (
                        <div className={styles.heroCta}>
                            <CalendlyButton className={calendlyStyles.button} />
                        </div>
                    )}
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