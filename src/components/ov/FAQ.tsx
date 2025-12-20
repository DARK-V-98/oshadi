import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What format are the notes in?",
    answer: "All notes are provided as downloadable PDF files. You can view them on any device - phone, tablet, or computer. Once downloaded, you can access them offline anytime.",
  },
  {
    question: "How do I receive the notes after purchase?",
    answer: "After payment confirmation, you'll receive a unique one-time access code via WhatsApp or email. Enter this code on our website to instantly download your PDF notes.",
  },
  {
    question: "Are the notes in English or Sinhala?",
    answer: "The notes include both English and Sinhala content. Key terms and concepts are explained in both languages for better understanding, especially for complex beauty terminology.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Due to the digital nature of the product, we don't offer refunds after the access code is used. However, you can contact us if you have any issues with the content.",
  },
  {
    question: "Do the notes cover practical assessments?",
    answer: "Yes! The notes include practical guidelines, step-by-step procedures, and tips for practical assessments. Each unit contains both theory and practical preparation materials.",
  },
  {
    question: "How long do I have access to the notes?",
    answer: "Once you download the PDF, it's yours forever! There's no expiration on the downloaded files. For the Complete Bundle, you also get lifetime access to any future updates.",
  },
  {
    question: "මේ notes VTA syllabus එකට match වෙනවද?",
    answer: "ඔව්, මේ notes සම්පූර්ණයෙන්ම NVQ Level 4 (VTA) syllabus එකට අනුකූලයි. සෑම unit එකක්ම official curriculum එකට අනුව prepare කරලා තියෙනවා.",
  },
  {
    question: "Can I share my access code with friends?",
    answer: "No, each access code is for single use only and tied to one download. Sharing codes violates our terms of service. Please encourage your friends to purchase their own copy.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-soft-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">FAQ</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Got questions? We've got answers. If you don't find what you're looking for, contact us!
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-background rounded-2xl border border-border shadow-card p-6 md:p-8 animate-fade-in-up">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors">
                    <span className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
