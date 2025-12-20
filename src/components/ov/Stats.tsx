"use client";
import { useEffect, useState, useRef } from "react";
import { Users, Award, Star, Heart } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  delay: number;
}

const StatItem = ({ icon: Icon, value, suffix, label, delay }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if(currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      let stepValue = value / steps;
      // Handle floating point values
      const isFloat = !Number.isInteger(value);
      if(isFloat) {
        stepValue = parseFloat((value / steps).toFixed(2));
      }

      let current = 0;

      const interval = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, value, delay]);

  return (
    <div
      ref={ref}
      className="text-center p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft transition-all duration-300"
    >
      <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
        {count}{suffix}
      </div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
};

const Stats = () => {
  const stats = [
    { icon: Heart, value: 150, suffix: "+", label: "Happy Brides", delay: 0 },
    { icon: Award, value: 5, suffix: "+", label: "Years of Experience", delay: 200 },
    { icon: Users, value: 500, suffix: "+", label: "Students Taught", delay: 400 },
    { icon: Star, value: 4.9, suffix: "", label: "Average Rating", delay: 600 },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <StatItem key={index} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
