"use client";

import { useState } from "react";
import Navbar from "@/components/ov/Navbar";
import Hero from "@/components/ov/Hero";
import About from "@/components/ov/About";
import Services from "@/components/ov/Services";
import Portfolio from "@/components/ov/Portfolio";
import Testimonials from "@/components/ov/Testimonials";
import Contact from "@/components/ov/Contact";
import Footer from "@/components/ov/Footer";
import FloatingWhatsApp from "@/components/ov/FloatingWhatsApp";
import ScrollToTop from "@/components/ov/ScrollToTop";
import AuthForm from "@/components/AuthForm";
import UnitList from "@/components/ov/UnitList";
import Pricing from "@/components/ov/Pricing";
import FAQ from "@/components/ov/FAQ";
import PDFAccess from "@/components/ov/PDFAccess";


const Home = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
      <main>
        <Hero onUnlockClick={() => setIsAuthModalOpen(true)} />
        <About />
        <Services />
        <UnitList />
        <Portfolio />
        <Testimonials />
        {/* <Pricing /> */}
        {/* <FAQ /> */}
        {/* <PDFAccess /> */}
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
      <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
};

export default Home;
