import { BookOpen, Unlock, MessageCircle } from "lucide-react";
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
        alt="Elegant bridal background"
        fill
        className="object-cover bg-center bg-no-repeat"
        data-ai-hint="bridal background"
        priority
      />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-gold-light/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-champagne/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-soft-pink/20 rounded-full blur-3xl" />
      </div>

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a87c' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">NVQ Level 4 Certified Notes</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="block">Bridal & Beauty</span>
            <span className="text-gradient-rose">NVQ Level 4</span>
            <span className="block text-3xl sm:text-4xl md:text-5xl mt-2 font-medium">Complete Notes Collection</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Unlock all NVQ Level 4 theory, practical, assignments & sample answers in one place!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              <BookOpen className="w-5 h-5" />
              Buy Notes
            </Button>
            <Button variant="hero-outline" size="xl" onClick={onUnlockClick}>
              <Unlock className="w-5 h-5" />
              Unlock PDF
            </Button>
            <Button variant="ghost" size="xl">
              <MessageCircle className="w-5 h-5" />
              Contact Us
            </Button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {["Overview", "What You Get", "Unit List", "Buy Notes", "Unlock PDF", "Contact Support"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
