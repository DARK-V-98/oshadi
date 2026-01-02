import { Check, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const pricingData = {
  sinhala: {
    title: "Sinhala Medium Packages",
    categories: [
      {
        name: "Bridal Dresser",
        packs: [
          { name: "Full Note Pack (20)", price: "5,800" },
          { name: "Full Assignment Pack (20)", price: "7,800" },
        ],
        single: [
          { name: "Note", price: "300" },
          { name: "Assignment", price: "400" },
          { name: "Note 3", price: "800" },
          { name: "Assignment 3", price: "1,100" },
          { name: "Note 5", price: "1,400" },
          { name: "Assignment 5", price: "1,800" },
        ],
      },
      {
        name: "Beauty",
        packs: [
          { name: "Full Note Pack (12)", price: "3,500" },
          { name: "Full Assignment Pack (12)", price: "4,700" },
        ],
        single: [
            { name: "Note", price: "300" },
            { name: "Assignment", price: "400" },
            { name: "Note 3", price: "800" },
            { name: "Assignment 3", price: "1,100" },
            { name: "Note 5", price: "1,400" },
            { name: "Assignment 5", price: "1,800" },
        ],
      },
      {
        name: "Hair Dresser",
        packs: [
          { name: "Full Note Pack (17)", price: "5,000" },
          { name: "Full Assignment Pack (17)", price: "6,600" },
        ],
        single: [
            { name: "Note", price: "300" },
            { name: "Assignment", price: "400" },
            { name: "Note 3", price: "800" },
            { name: "Assignment 3", price: "1,100" },
            { name: "Note 5", price: "1,400" },
            { name: "Assignment 5", price: "1,800" },
        ],
      },
    ],
  },
  english: {
    title: "English Medium Packages",
    categories: [
      {
        name: "Bridal Dresser",
        packs: [
          { name: "Full Note Pack (20)", price: "7,800" },
          { name: "Full Assignment Pack (20)", price: "9,800" },
        ],
        single: [
          { name: "Note", price: "400" },
          { name: "Assignment", price: "500" },
          { name: "Note 3", price: "1,100" },
          { name: "Assignment 3", price: "1,400" },
          { name: "Note 5", price: "1,900" },
          { name: "Assignment 5", price: "2,400" },
        ],
      },
      {
        name: "Beauty",
        packs: [
          { name: "Full Note Pack (12)", price: "4,600" },
          { name: "Full Assignment Pack (12)", price: "5,700" },
        ],
        single: [
          { name: "Note", price: "400" },
          { name: "Assignment", price: "500" },
          { name: "Note 3", price: "1,100" },
          { name: "Assignment 3", price: "1,400" },
          { name: "Note 5", price: "1,900" },
          { name: "Assignment 5", price: "2,400" },
        ],
      },
      {
        name: "Hair Dresser",
        packs: [
          { name: "Full Note Pack (17)", price: "6,600" },
          { name: "Full Assignment Pack (17)", price: "8,300" },
        ],
        single: [
          { name: "Note", price: "400" },
          { name: "Assignment", price: "500" },
          { name: "Note 3", price: "1,100" },
          { name: "Assignment 3", price: "1,400" },
          { name: "Note 5", price: "1,900" },
          { name: "Assignment 5", price: "2,400" },
        ],
      },
    ],
  },
};


const Pricing = () => {

  const handleBuyClick = (itemName: string, price: string) => {
    const message = encodeURIComponent(`Hi! I'm interested in buying the *${itemName}* for Rs. ${price}. Can you please provide more information?`);
    window.open(`https://wa.me/94754420805?text=${message}`, '_blank');
  };

  const renderCategory = (category: any, medium: string) => (
    <div key={category.name} className="bg-card border rounded-2xl p-6 shadow-card">
      <h4 className="font-heading text-2xl font-bold text-center mb-6">{category.name}</h4>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {category.packs.map((pack:any) => (
          <div key={pack.name} className="relative p-6 rounded-2xl border transition-all duration-300 animate-fade-in-up bg-gradient-to-br from-primary/5 via-rose-gold-light/10 to-champagne/10 border-primary/30 shadow-soft">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-soft">
                  <Sparkles className="w-4 h-4" />
                  Full Pack
                </span>
              </div>
              <div className="text-center mb-4 pt-4">
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">{pack.name}</h3>
              </div>
              <div className="text-center mb-6">
                <span className="font-heading text-4xl font-bold text-foreground">Rs. {pack.price}</span>
              </div>
              <Button
                onClick={() => handleBuyClick(`${category.name} ${pack.name} (${medium})`, pack.price)}
                variant="hero"
                size="lg"
                className="w-full"
              >
                Buy Now
              </Button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {category.single.map((item:any) => (
            <div key={item.name} className="p-4 rounded-xl bg-background border text-center">
                <h5 className="font-heading text-lg font-semibold">{item.name}</h5>
                <p className="text-xl font-bold text-primary my-2">Rs. {item.price}</p>
                <Button
                    onClick={() => handleBuyClick(`${category.name} - ${item.name} (${medium})`, item.price)}
                    size="sm"
                    variant="outline"
                >
                    Buy
                </Button>
            </div>
        ))}
      </div>
    </div>
  )

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
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

          {/* Medium Sections */}
          {Object.entries(pricingData).map(([key, mediumData]) => (
            <div key={key} className="mb-20">
                <h3 className="font-heading text-3xl md:text-4xl font-bold text-center mb-10 text-gradient-rose">{mediumData.title}</h3>
                <div className="grid lg:grid-cols-1 gap-8">
                    {mediumData.categories.map(category => renderCategory(category, key))}
                </div>
            </div>
          ))}

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
