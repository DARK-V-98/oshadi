'use client';
import { useEffect, useState, useRef } from "react";
import { Users, BookOpen, Award, Star } from "lucide-react";

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if(ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
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
    { icon: Users, value: 500, suffix: "+", label: "Happy Students", delay: 0 },
    { icon: BookOpen, value: 11, suffix: "", label: "Complete Units", delay: 200 },
    { icon: Award, value: 100, suffix: "%", label: "Exam Success Rate", delay: 400 },
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
