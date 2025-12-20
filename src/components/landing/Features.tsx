import { CheckCircle2, Timer, ShieldCheck, Sparkles, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const whatYouGet = [
  { icon: FileText, text: 'Complete NVQ Level 4 theory notes' },
  { icon: BookOpen, text: 'Bridal & Beauty practical guidelines' },
  { icon: FileText, text: 'Assignments & sample answers' },
  { icon: BookOpen, text: 'Beginner-friendly study layouts' },
  { icon: Sparkles, text: 'Clear, well-organised, easy-to-understand lessons' },
];

const whyChoose = [
  { icon: Timer, text: 'Save valuable study time' },
  { icon: Sparkles, text: 'Learn faster & more efficiently' },
  { icon: ShieldCheck, text: 'Prepare for both practical + theory exams with confidence' },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="container grid gap-12 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">What You Get</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {whatYouGet.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <item.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground/80">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Why Choose These Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {whyChoose.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <item.icon className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground/80">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
