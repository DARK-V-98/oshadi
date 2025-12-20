"use client";

import { useState } from "react";
import Navbar from "@/components/ov/Navbar";
import Hero from "@/components/ov/Hero";
import Stats from "@/components/ov/Stats";
import About from "@/components/ov/About";
import Services from "@/components/ov/Services";
import Portfolio from "@/components/ov/Portfolio";
import Testimonials from "@/components/ov/Testimonials";
import Contact from "@/components/ov/Contact";
import Footer from "@/components/ov/Footer";
import FloatingWhatsApp from "@/components/ov/FloatingWhatsApp";
import ScrollToTop from "@/components/ov/ScrollToTop";
import UnlockPdfDialog from "@/components/UnlockPdfDialog";


const Home = () => {
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onUnlockClick={() => setIsUnlockModalOpen(true)} />
      <main>
        <Hero onUnlockClick={() => setIsUnlockModalOpen(true)} />
        <Stats />
        <About />
        <Services />
        <Portfolio />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
      <UnlockPdfDialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen} />
    </div>
  );
};

export default Home;
