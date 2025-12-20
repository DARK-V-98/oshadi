import { Check, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const packages = [
  {
    name: "Single Unit",
    price: "Rs. 500",
    description: "Perfect for focusing on one specific unit",
    features: [
      "1 Unit PDF of your choice",
      "Theory + Practical notes",
      "Sample answers included",
      "One-time access code",
    ],
    popular: false,
    cta: "Buy Single Unit",
  },
  {
    name: "Complete Bundle",
    price: "Rs. 3,500",
    originalPrice: "Rs. 5,500",
    description: "Best value - Get all 11 units at a discounted price",
    features: [
      "All 11 Unit PDFs",
      "Theory + Practical notes",
      "All assignments & sample answers",
      "Health & Safety guide",
      "Priority support",
      "Lifetime access",
    ],
    popular: true,
    cta: "Get Complete Bundle",
  },
  {
    name: "Study Pack",
    price: "Rs. 2,000",
    description: "5 units of your choice for targeted learning",
    features: [
      "Any 5 Unit PDFs",
      "Theory + Practical notes",
      "Sample answers included",
      "Study timeline guide",
      "Email support",
    ],
    popular: false,
    cta: "Choose 5 Units",
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Flexible options to fit your study needs and budget.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-300 animate-fade-in-up ${
                  pkg.popular
                    ? "bg-gradient-to-br from-primary/5 via-rose-gold-light/10 to-champagne/10 border-primary/30 shadow-soft scale-105"
                    : "bg-card border-border shadow-card hover:shadow-soft"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-soft">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Package Name */}
                <div className="text-center mb-6">
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-heading text-4xl md:text-5xl font-bold text-foreground">{pkg.price}</span>
                  </div>
                  {pkg.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">{pkg.originalPrice}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </span>
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={pkg.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {pkg.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
              <Star className="w-4 h-4 text-gold fill-gold" />
              <span className="text-sm text-muted-foreground">Trusted by 500+ NVQ students across Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
