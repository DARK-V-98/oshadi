'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Star, Quote } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';

interface Testimonial {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number;
  role?: string; // Add role if you have it in your data
}

const staticTestimonials = [
  {
    id: "static-1",
    userName: "Sanduni Perera",
    role: "Bride",
    content: "Oshadi made my wedding day absolutely perfect! The makeup was flawless and lasted all day. She understood my vision perfectly. Highly recommend!",
    rating: 5,
  },
  {
    id: "static-2",
    userName: "Nimali Fernando",
    role: "Beauty Student",
    content: "The best teacher for NVQ Level 4! Oshadi's practical guidelines helped me so much during my assessments. Thank you for your guidance!",
    rating: 5,
  },
];

const Testimonials = () => {
  const firestore = useFirestore();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4); // static + initial fetched

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const testimonialsRef = collection(firestore, 'testimonials');
    const q = query(
      testimonialsRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTestimonials: Testimonial[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Testimonial));
      setTestimonials(fetchedTestimonials);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching testimonials:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const allTestimonials = [...staticTestimonials, ...testimonials];
  const totalTestimonials = allTestimonials.length;

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 4);
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

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
            {loading && Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-6 md:p-8 rounded-2xl bg-background border border-border">
                    <Skeleton className="w-10 h-10 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-6" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </div>
            ))}
            {!loading && allTestimonials.slice(0, visibleCount).map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="group p-6 md:p-8 rounded-2xl bg-background border border-border shadow-card hover:shadow-soft transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">{testimonial.content}</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={testimonial.userAvatar} alt={testimonial.userName} />
                        <AvatarFallback>{getInitials(testimonial.userName)}</AvatarFallback>
                    </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.userName}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role || 'Student'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {!loading && visibleCount < totalTestimonials && (
            <div className="text-center mt-12">
              <Button variant="hero-outline" onClick={loadMore}>
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
