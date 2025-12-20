import { Mail, Phone, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Contact via WhatsApp",
    href: "https://wa.me/94XXXXXXXXX",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Mail,
    title: "Email",
    value: "oshadi@example.com",
    href: "mailto:oshadi@example.com",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+94 XX XXX XXXX",
    href: "tel:+94XXXXXXXXX",
    color: "bg-gold/10 text-gold",
  },
];

const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Get In Touch</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Contact Support
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions about the notes or need help with your access code? I'm here to help!
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-1">{method.title}</h3>
                <p className="text-muted-foreground text-sm">{method.value}</p>
              </a>
            ))}
          </div>

          {/* CTA Card */}
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-rose-gold-light/10 to-champagne/10 border border-border overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 text-center">
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Get complete access to all NVQ Level 4 Bridal & Beauty notes and accelerate your learning today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl">
                  <Send className="w-5 h-5" />
                  Buy Notes Now
                </Button>
                <Button variant="hero-outline" size="xl">
                  <MessageCircle className="w-5 h-5" />
                  Ask a Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
