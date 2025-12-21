import { Check, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const packages = [
  {
    name: "Full Note Bundle",
    price: "Rs. 2,800",
    description: "Best value for notes - get all units at a discounted price.",
    features: [
      "All Unit Notes PDFs",
      "Complete Theory + Practical notes",
    ],
    popular: true,
    cta: "Buy Full Note Bundle",
    type: 'note'
  },
  {
    name: "Full Assignment Bundle",
    price: "Rs. 3,300",
    description: "Best value for assignments - get all units at a discounted price.",
    features: [
      "All Unit Assignments PDFs",
      "Complete Sample Answers",
      "No watermarks",
    ],
    popular: true,
    cta: "Buy Full Assignment Bundle",
    type: 'assignment'
  },
];

const singlePackages = [
    { name: "Note 1", price: "Rs. 300", cta: "Buy Note 1", type: 'note'},
    { name: "Assignment 1", price: "Rs. 350", cta: "Buy Assignment 1", type: 'assignment' },
    { name: "Note 3", price: "Rs. 800", cta: "Buy Note 3", type: 'note' },
    { name: "Assignment 3", price: "Rs. 1,000", cta: "Buy Assignment 3", type: 'assignment' },
    { name: "Note 5", price: "Rs. 1,400", cta: "Buy Note 5", type: 'note' },
    { name: "Assignment 5", price: "Rs. 1,600", cta: "Buy Assignment 5", type: 'assignment' },
]

const Pricing = () => {

  const handleBuyClick = (itemName: string, price: string) => {
    const message = encodeURIComponent(`Hi! I'm interested in buying the *${itemName}* for ${price}. Can you please provide more information?`);
    window.open(`https://wa.me/94754420805?text=${message}`, '_blank');
  };

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

          {/* Bundle Cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
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
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-soft">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>
                <div className="text-center mb-6">
                  <span className="font-heading text-4xl md:text-5xl font-bold text-foreground">{pkg.price}</span>
                </div>
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
                <Button
                  onClick={() => handleBuyClick(pkg.name, pkg.price)}
                  variant={pkg.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {pkg.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Single Item Cards Header */}
           <div className="text-center mb-12 animate-fade-in">
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-3 mb-4">
                Individual Packages
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                Purchase notes or assignments for specific units.
                </p>
          </div>

          {/* Single Item Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
             {singlePackages.map((pkg, index) => (
                <div 
                    key={index}
                    className="p-4 rounded-xl bg-card border border-border shadow-card text-center"
                >
                    <h4 className="font-heading text-lg font-semibold">{pkg.name}</h4>
                    <p className="text-xl font-bold text-primary my-2">{pkg.price}</p>
                    <Button
                        onClick={() => handleBuyClick(pkg.name, pkg.price)}
                        size="sm"
                        variant={pkg.type === 'note' ? 'default' : 'elegant'}
                    >
                        {pkg.cta}
                    </Button>
                </div>
             ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-16 text-center">
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
