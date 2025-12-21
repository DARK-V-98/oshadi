'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";


interface Testimonial {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number;
  role?: string; 
}

const staticTestimonials: Testimonial[] = [
  {
    id: "static-1",
    userName: "Sanduni Perera",
    role: "Bride",
    content: "Oshadi made my wedding day absolutely perfect! The makeup was flawless and lasted all day. She understood my vision perfectly. Highly recommend!",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/sanduni/100/100"
  },
  {
    id: "static-2",
    userName: "Nimali Fernando",
    role: "Beauty Student",
    content: "The best teacher for NVQ Level 4! Oshadi's practical guidelines helped me so much during my assessments. Thank you for your guidance!",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/nimali/100/100"
  },
  {
    id: "static-3",
    userName: "Hasini Jayawardena",
    role: "NVQ Student",
    content: "I bought the full note bundle and it was a lifesaver! Everything is so well-organized. The Sinhala explanations really helped me understand complex topics.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/hasini/100/100"
  },
  {
    id: "static-4",
    userName: "Fathima Rizwan",
    role: "Beautician Trainee",
    content: "The assignment pack is worth every rupee. The sample answers are detailed and helped me structure my own assignments perfectly. Saved me so much time.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/fathima/100/100"
  },
  {
    id: "static-5",
    userName: "Priya Silva",
    role: "Salon Owner",
    content: "Excellent service and professionalism. Oshadi did the makeup for my entire bridal party and everyone looked stunning. She's a true artist.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/priya/100/100"
  },
  {
    id: "static-6",
    userName: "Anusha Kumari",
    role: "NVQ Student",
    content: "I was struggling with the practicals, but the notes on Manicure & Pedicure and Facials were incredibly detailed. Passed my exam with flying colors!",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/anusha/100/100"
  },
  {
    id: "static-7",
    userName: "Ravi Sharma",
    role: "Makeup Artist",
    content: "Learning from Oshadi has elevated my skills. Her techniques are modern and she has a deep understanding of her craft. The notes are a great reference.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/ravi/100/100"
  },
  {
    id: "static-8",
    userName: "Chamari Atapattu",
    role: "NVQ Aspirant",
    content: "I was hesitant to buy notes online, but these are top quality. The content directly matches the VTA syllabus. Highly recommended for anyone serious about NVQ.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/chamari/100/100"
  },
  {
    id: "static-9",
    userName: "Ishara Maduwanthi",
    role: "Bride",
    content: "Thank you for making me feel like a queen on my big day. The makeup was natural yet glamorous, just what I wanted. Oshadi is patient and so talented.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/ishara/100/100"
  },
  {
    id: "static-10",
    userName: "Dilshan Wickramasinghe",
    role: "Student",
    content: "The notes are easy to read and understand. The diagrams and step-by-step guides for practicals are the best part. I feel much more confident for my exams.",
    rating: 4,
    userAvatar: "https://picsum.photos/seed/dilshan/100/100"
  },
  {
    id: "static-11",
    userName: "Tharushi Nimesha",
    role: "NVQ Student",
    content: "I purchased the assignment bundle. It was so helpful to see how to answer the questions properly. It gave me a great head start on my work.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/tharushi/100/100"
  },
  {
    id: "static-12",
    userName: "Kavindya Perera",
    role: "Beautician",
    content: "Oshadi's work is amazing. I booked her for a party makeup session and received so many compliments. She's my go-to makeup artist now.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/kavindya/100/100"
  },
  {
    id: "static-13",
    userName: "Sachini Gamage",
    role: "Student",
    content: "The Health & Safety notes were very thorough. It's a boring topic but the notes made it easy to learn and remember for the exam.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/sachini/100/100"
  },
  {
    id: "static-14",
    userName: "Ruwanthi de Silva",
    role: "Bride",
    content: "A true professional. Oshadi was punctual, used high-quality products, and was so friendly. My bridal makeup was perfect. Thank you!",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/ruwanthi/100/100"
  },
  {
    id: "static-15",
    userName: "Madhavi Rajapaksa",
    role: "NVQ Student",
    content: "The full note bundle is the best investment for your studies. It covers every single unit in detail. Don't think twice, just get it!",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/madhavi/100/100"
  },
  {
    id: "static-16",
    userName: "Nadeesha Hemamali",
    role: "Student",
    content: "The combination of English and Sinhala terms is a fantastic idea. It helps so much to understand the technical words. Great work!",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/nadeesha/100/100"
  },
  {
    id: "static-17",
    userName: "Amaya Fonseka",
    role: "Bridal Client",
    content: "I had a wonderful experience. Oshadi listened to all my requests and created a look that was even better than I imagined. Felt so beautiful!",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/amaya/100/100"
  },
  {
    id: "static-18",
    userName: "Lakshini Pathirana",
    role: "NVQ Student",
    content: "I only bought the notes for the Makeup unit, and it was amazing. So many details and tips that you won't find elsewhere. Now I'm buying the full bundle.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/lakshini/100/100"
  },
  {
    id: "static-19",
    userName: "Upeksha Samaranayake",
    role: "Student",
    content: "The notes are clear, concise, and to the point. No unnecessary information, just what you need for the exam. This is exactly what I was looking for.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/upeksha/100/100"
  },
  {
    id: "static-20",
    userName: "Shashikala Weerasinghe",
    role: "Beautician",
    content: "I recommend these notes to all my students now. It's the most comprehensive and reliable resource available for NVQ Level 4 in Sri Lanka.",
    rating: 5,
    userAvatar: "https://picsum.photos/seed/shashikala/100/100"
  }
];


const Testimonials = () => {
  const firestore = useFirestore();
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    }

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
      setDbTestimonials(fetchedTestimonials);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching testimonials:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const allTestimonials = [...staticTestimonials, ...dbTestimonials];
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0].charAt(0).toUpperCase() + (names[names.length - 1] ? names[names.length - 1].charAt(0).toUpperCase() : '');
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
          
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="-ml-4">
              {loading && !allTestimonials.length ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="p-6 md:p-8 rounded-2xl bg-background border border-border h-[320px]">
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
                            </Card>
                        </div>
                    </CarouselItem>
                ))
              ) : (
                allTestimonials.map((testimonial, index) => (
                    <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                            <Card className="group p-6 md:p-8 rounded-2xl bg-background border border-border shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                                <p className="text-foreground mb-6 leading-relaxed flex-grow">{testimonial.content}</p>
                                <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                                ))}
                                </div>
                                <div className="flex items-center gap-4 mt-auto">
                                    <Avatar>
                                        <AvatarImage src={testimonial.userAvatar} alt={testimonial.userName} />
                                        <AvatarFallback>{getInitials(testimonial.userName)}</AvatarFallback>
                                    </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{testimonial.userName}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role || 'Student'}</p>
                                </div>
                                </div>
                            </Card>
                        </div>
                    </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-20px] sm:left-[-40px]" />
            <CarouselNext className="absolute right-[-20px] sm:right-[-40px]" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
