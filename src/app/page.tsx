"use client";

import { useState } from "react";
import Navbar from "@/components/ov/Navbar";
import Hero from "@/components/ov/Hero";
import Stats from "@/components/ov/Stats";
import About from "@/components/ov/About";
import Pricing from "@/components/ov/Pricing";
import UnitList from "@/components/ov/UnitList";
import Testimonials from "@/components/ov/Testimonials";
import FAQ from "@/components/ov/FAQ";
import PDFAccess from "@/components/ov/PDFAccess";
import Contact from "@/components/ov/Contact";
import Footer from "@/components/ov/Footer";
import FloatingWhatsApp from "@/components/ov/FloatingWhatsApp";
import ScrollToTop from "@/components/ov/ScrollToTop";

const Home = () => {
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onUnlockClick={() => setIsUnlockModalOpen(true)} />
      <main>
        <Hero onUnlockClick={() => setIsUnlockModalOpen(true)} />
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
  );
};

export default Home;
