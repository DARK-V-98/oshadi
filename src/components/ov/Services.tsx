"use client";
import { FileText, Edit } from 'lucide-react';

const services = [
  {
    icon: FileText,
    title: 'NVQ Level 4 Notes',
    description: 'Complete, well-organized theory and practical notes for all units to help you excel in your exams.',
  },
  {
    icon: Edit,
    title: 'Assignments & Answers',
    description: 'A comprehensive collection of assignments and sample answers to guide your studies and preparation.',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 md:py-32 bg-soft-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">What I Offer</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Educational Resources
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              High-quality, curated materials to support your NVQ Level 4 journey in Bridal & Beauty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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
