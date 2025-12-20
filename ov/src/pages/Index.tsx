import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Pricing from "@/components/Pricing";
import UnitList from "@/components/UnitList";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import PDFAccess from "@/components/PDFAccess";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ScrollToTop from "@/components/ScrollToTop";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>OV Notes - NVQ Level 4 Bridal & Beauty Complete Notes Collection</title>
        <meta name="description" content="Unlock all NVQ Level 4 Bridal & Beauty theory, practical notes, assignments & sample answers. Complete study materials by Oshadi Vidarshana." />
        <meta name="keywords" content="NVQ Level 4, Bridal, Beauty, Notes, Sri Lanka, Study Materials, Oshadi Vidarshana" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <Stats />
          <About />
          <Pricing />
          <UnitList />
          <Testimonials />
          <FAQ />
          <PDFAccess />
          <Contact />
        </main>
        <Footer />
        <FloatingWhatsApp />
        <ScrollToTop />
      </div>
    </>
  );
};

export default Index;
