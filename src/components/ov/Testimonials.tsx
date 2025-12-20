import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sanduni Perera",
    role: "Bride",
    content: "Oshadi made my wedding day absolutely perfect! The makeup was flawless and lasted all day. She understood my vision perfectly. Highly recommend!",
    rating: 5,
    avatar: "SP",
  },
  {
    name: "Nimali Fernando",
    role: "Beauty Student",
    content: "The best teacher for NVQ Level 4! Oshadi's practical guidelines helped me so much during my assessments. Thank you for your guidance!",
    rating: 5,
    avatar: "NF",
  },
  {
    name: "Hasini Jayawardena",
    role: "Client",
    content: "I booked Oshadi for a special event and she did an amazing job. I received so many compliments. Very professional and talented!",
    rating: 5,
    avatar: "HJ",
  },
  {
    name: "Dilini Wickrama",
    role: "NVQ Student",
    content: "I was struggling with the theory part but her notes made everything so clear. The Sinhala explanations really helped me understand better.",
    rating: 5,
    avatar: "DW",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-soft-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Testimonials</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              What My Clients & Students Say
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Hear from people who have experienced my work and teaching firsthand.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group p-6 md:p-8 rounded-2xl bg-background border border-border shadow-card hover:shadow-soft transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-primary/20 mb-4" />

                {/* Content */}
                <p className="text-foreground mb-6 leading-relaxed">{testimonial.content}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-heading font-semibold text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
