"use client";
import { BookOpen, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type HeroProps = {
  onUnlockClick: () => void;
};


const Hero = ({ onUnlockClick }: HeroProps) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <Image 
        src="/bg.jpg"
        alt="Elegant bridal makeup and hairstyle background"
        fill
        className="object-cover bg-center bg-no-repeat"
        data-ai-hint="bridal makeup"
        priority
      />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 -left-40 w-72 h-72 bg-rose-gold-light/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-champagne/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <Image src="/ov.png" alt="Oshadi Vidarshana Logo" width={100} height={100} className="rounded-full mx-auto shadow-lg" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-sm font-medium text-muted-foreground">Professional Bridal Dresser & Beautician</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-gradient-rose">Oshadi Vidarshana</span>
             <span className="block text-2xl sm:text-4xl mt-2 font-medium">NVQ Level 4 Notes & Bridal Services</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Your expert resource for NVQ Level 4 study materials and professional bridal services in Sri Lanka.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild variant="hero" size="xl">
              <a href="#notes">
                <BookOpen className="w-5 h-5" />
                View Course Notes
              </a>
            </Button>
            <Button asChild variant="hero-outline" size="xl">
               <a href="#contact">
                <MessageCircle className="w-5 h-5" />
                Get in Touch
               </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
