"use client";

import { useState } from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import AuthorIntro from '@/components/landing/AuthorIntro';
import Features from '@/components/landing/Features';
import UnitList from '@/components/landing/UnitList';
import PdfAccessGuide from '@/components/landing/PdfAccessGuide';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';
import UnlockPdfDialog from '@/components/UnlockPdfDialog';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUnlockClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <Header onUnlockClick={handleUnlockClick} />
      <main className="flex-1">
        <Hero onUnlockClick={handleUnlockClick} />
        <AuthorIntro />
        <Features />
        <UnitList onUnlockClick={handleUnlockClick} />
        <PdfAccessGuide />
        <Contact />
      </main>
      <Footer />
      <UnlockPdfDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
