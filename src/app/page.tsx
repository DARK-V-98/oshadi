"use client";

import { useState } from "react";
import Head from 'next/head';
import Navbar from "@/components/ov/Navbar";
import Hero from "@/components/ov/Hero";
import About from "@/components/ov/About";
import Pricing from "@/components/ov/Pricing";
import Testimonials from "@/components/ov/Testimonials";
import Contact from "@/components/ov/Contact";
import Footer from "@/components/ov/Footer";
import FloatingWhatsApp from "@/components/ov/FloatingWhatsApp";
import ScrollToTop from "@/components/ov/ScrollToTop";
import AuthForm from "@/components/AuthForm";
import NotesList from "@/components/ov/NotesList";


const Home = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
    <Head>
        <title>Oshadi Vidarshana | NVQ Level 4 Bridal & Beauty Notes Sri Lanka</title>
        <meta
          name="description"
          content="Your premier resource for NVQ Level 4 Bridal & Beauty notes in Sri Lanka. Get comprehensive theory, practical guides, and assignments by qualified bridal dresser Oshadi Vidarshana."
        />
      </Head>
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
      <main>
        <Hero onUnlockClick={() => setIsAuthModalOpen(true)} />
        <About />
        <Pricing />
        <NotesList />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
      <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
    </>
  );
};

export default Home;
