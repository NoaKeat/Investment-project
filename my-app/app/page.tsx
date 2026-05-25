import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Services from "@/components/Services/Services";
import GalleryShowcase from "@/components/GalleryShowcase/GalleryShowcase"
import PropertyShowcase from "@/components/PropertyShowcase/PropertyShowcase"
import Statement from "@/components/Statement/Statement"
import Clients from "@/components/Clients/Clients"
import InvestmentHero from "@/components/InvestmentHero/InvestmentHero"
import CalculatorWizard from "@/components/CalculatorSection/CalculatorWizard"
import ContactForm from "@/components/ContactForm/ContactForm"
import BlogSection from "@/components/BlogSection/BlogSection"
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <section id="hero">
        <Services />
      </section>
      <GalleryShowcase />
      <section id="popertyShowcase">
        <PropertyShowcase />
      </section>

      <Statement />
      <Clients />
      <InvestmentHero />
      <section id="CalculatorSection">
        <CalculatorWizard />
      </section>
      <section id="blogSection">
        <BlogSection />
      </section>
      <section id="ContactForm">
        <ContactForm />
      </section>
    </>
  );
}