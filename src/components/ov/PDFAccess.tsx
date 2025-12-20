'use client';
import { useState } from "react";
import { FileText, Key, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const steps = [
  {
    number: "1",
    title: "Select a Unit PDF",
    description: "Choose the unit you want to download from the table above.",
    icon: FileText,
  },
  {
    number: "2",
    title: "Enter Access Code",
    description: "Input the unique one-time code you received after purchase.",
    icon: Key,
  },
  {
    number: "3",
    title: "Download Instantly",
    description: "Your PDF will be downloaded directly to your device. The code will expire after use.",
    icon: Download,
  },
];

const PDFAccess = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast({
        title: "Access code required",
        description: "Please enter your unique access code to download the PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Invalid access code",
        description: "The code you entered is invalid or has already been used. Please contact support.",
        variant: "destructive",
      });
    }, 1500);
  };

  return (
    <section id="access" className="py-20 md:py-32 bg-soft-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Secure Download</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Secure PDF Access
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your learning materials are protected. Use the one-time code provided after purchase to securely download your notes.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-background border border-border shadow-card hover:shadow-soft transition-shadow duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-soft">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>

          {/* Access Code Form */}
          <div className="max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="p-8 rounded-2xl bg-background border border-border shadow-card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-foreground">Enter Your Access Code</h3>
                <p className="text-sm text-muted-foreground mt-2">Input the unique code from your purchase confirmation</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter your access code (e.g., OV-XXXX-XXXX)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="h-14 text-center text-lg font-mono tracking-wider border-2 focus:border-primary"
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download PDF
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/50">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Each code is valid for a single download only. Make sure to save your file after downloading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PDFAccess;
