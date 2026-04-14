import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Services from "@/components/Services/Services";
import GalleryShowcase from "@/components/GalleryShowcase/GalleryShowcase"
import PropertyShowcase from "@/components/PropertyShowcase/PropertyShowcase"
import Statement from "@/components/Statement/Statement"
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Services/>
      <GalleryShowcase/>
      <PropertyShowcase/>
      <Statement/>

    </>
  );
}