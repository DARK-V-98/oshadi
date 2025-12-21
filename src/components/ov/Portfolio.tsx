"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const portfolioImages = [
  { src: "https://picsum.photos/seed/bride1/600/800", alt: "", hint: "classic bride" },
  { src: "https://picsum.photos/seed/bride2/600/800", alt: "", hint: "modern bride" },
  { src: "https://picsum.photos/seed/partylook/600/800", alt: "", hint: "party makeup" },
  { src: "https://picsum.photos/seed/bride3/600/800", alt: "Traditional Kandyan bride", hint: "Kandyan bride" },
  { src: "https://picsum.photos/seed/bride4/600/800", alt: "Soft glam bridal makeup", hint: "glam bride" },
  { src: "https://picsum.photos/seed/hairstyle/600/800", alt: "Intricate bridal hairstyle", hint: "bridal hairstyle" },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {portfolioImages.map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden shadow-card hover:shadow-soft transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-[3/4] relative">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            data-ai-hint={image.hint}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
          
          <div className="text-center mt-12">
            <Button variant="hero-outline" size="lg">View More on Instagram</Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Portfolio;
