'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookCopy, Brush, Scissors, Star, BookMarked } from "lucide-react";
import Link from "next/link";

const categories = [
    {
        icon: Brush,
        title: "Bridal Dresser",
        description: "Master the art of bridal makeup, hair styling, and saree draping. Includes traditional and modern techniques.",
        href: "/bridal-dresser"
    },
    {
        icon: BookCopy,
        title: "Beauty",
        description: "Comprehensive modules on skin care, facials, manicure, pedicure, and other essential beauty treatments.",
        href: "/beauty"
    },
    {
        icon: Scissors,
        title: "Hair",
        description: "Learn professional hair cutting, coloring, and styling techniques for all types of hair.",
        href: "/hair"
    },
    {
        icon: Star,
        title: "Extra Notes",
        description: "Specialized notes covering salon management, health & safety, etiquette, and more to round out your skills.",
        href: "/extra-notes"
    },
];

const CourseCategories = () => {
  return (
    <section id="courses" className="py-20 md:py-32 bg-soft-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Courses</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Explore Our Course Categories
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find the perfect set of notes to advance your skills in the beauty industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
                <Card key={index} className="flex flex-col animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="items-center text-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <category.icon className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle>{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow text-center">
                        <CardDescription>{category.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button asChild variant="outline">
                           <Link href={category.href}>
                             View Modules <ArrowRight className="w-4 h-4 ml-2" />
                           </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
          </div>

            <div className="text-center mt-16">
                <Button asChild size="lg">
                    <Link href="/syllabus">
                        <BookMarked className="w-5 h-5 mr-2" />
                        View Full Syllabus
                    </Link>
                </Button>
            </div>

        </div>
      </div>
    </section>
  );
};

export default CourseCategories;
