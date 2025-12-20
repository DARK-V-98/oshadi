
import { Award, Heart, Star, Timer, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";

const About = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-soft-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image/Avatar Section */}
            <div className="relative animate-fade-in">
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Decorative ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-rose-gold-light/40 animate-spin" style={{ animationDuration: "30s" }} />
                
                {/* Main circle */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-rose-gold-light/30 to-champagne/30 backdrop-blur-sm border border-border/30 overflow-hidden">
                  <Image src="/ov.png" alt="Oshadi Vidarshana, qualified bridal dresser" fill className="object-cover" />
                </div>

                {/* Floating badges */}
                <div className="absolute top-8 right-8 p-3 rounded-full bg-background shadow-card animate-float">
                  <Award className="w-6 h-6 text-gold" />
                </div>
                <div className="absolute bottom-12 left-4 p-3 rounded-full bg-background shadow-card animate-float" style={{ animationDelay: "0.5s" }}>
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute top-1/2 left-0 p-3 rounded-full bg-background shadow-card animate-float" style={{ animationDelay: "1s" }}>
                  <Star className="w-6 h-6 text-gold" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="animate-slide-in-right">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">About The Creator</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
                M.K.D Oshadi Vidarshana Perera
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Welcome! I'm a qualified <strong className="text-foreground">Bridal Dresser (NVQ Level 4)</strong>. This collection of notes was specially created for students studying for the NVQ Level 4 in Bridal & Beauty.
                </p>
                
                <div className="h-px bg-border my-8" />

                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">What You Get</h3>
                <ul className="space-y-3">
                  {[
                    "Complete NVQ Level 4 theory notes",
                    "Bridal & Beauty practical guidelines",
                    "Assignments & sample answers",
                    "Beginner-friendly study layouts",
                    "Clear, well-organised, easy-to-understand lessons",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-3 h-3 text-primary" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="h-px bg-border my-8" />

                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">Why Choose These Notes</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Timer, text: "Save valuable study time" },
                    { icon: Zap, text: "Learn faster & efficiently" },
                    { icon: ShieldCheck, text: "Prepare with confidence" },
                  ].map((item, index) => (
                    <div key={index} className="p-4 rounded-xl bg-background/50 border border-border/50 text-center flex flex-col items-center justify-center">
                      <item.icon className="w-8 h-8 text-primary mb-3" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
