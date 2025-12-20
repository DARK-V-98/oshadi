"use client";
import { Gem, Wand2, School, Heart } from 'lucide-react';
import Image from 'next/image';

const services = [
  {
    icon: Gem,
    title: 'Bridal Dressing',
    description: 'Complete bridal packages, from traditional to modern styles, ensuring you look breathtaking on your special day.',
  },
  {
    icon: Wand2,
    title: 'Special Occasion Makeup',
    description: 'Professional makeup artistry for parties, proms, photoshoots, and any event where you want to shine.',
  },
  {
    icon: School,
    title: 'Beauty Courses',
    description: 'Comprehensive training for aspiring beauticians, including my complete NVQ Level 4 notes collection.',
  },
  {
    icon: Heart,
    title: 'Personal Consultations',
    description: 'One-on-one sessions to help you with your personal beauty routine, skincare, and makeup skills.',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 md:py-32 bg-soft-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">What I Offer</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              My Services
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From bridal transformations to professional training, I offer a range of services tailored to your beauty needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group text-center p-8 rounded-2xl bg-background border border-border shadow-card hover:shadow-soft transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
