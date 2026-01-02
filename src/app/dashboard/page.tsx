
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TestimonialForm from '@/components/dashboard/TestimonialForm';
import { HelpCircle, ShoppingBag, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function UserDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-heading">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Manage your orders, download content, and submit feedback here.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary"/> How It Works</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>How to Get Your Notes</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                        <p>1. Add items to your cart from the homepage and checkout.</p>
                        <p>2. You will be prompted to contact us on WhatsApp to arrange payment.</p>
                        <p>3. Once payment is confirmed, your order will be marked as "Completed".</p>
                        <p>4. Your files will then be available on the 'My Content' page.</p>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
          <TestimonialForm />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 grid grid-rows-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        My Orders
                    </CardTitle>
                    <CardDescription>
                        Track your active orders and view your order history.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild>
                        <Link href="/dashboard/orders">
                            Manage Orders <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-primary" />
                        My Content
                    </CardTitle>
                    <CardDescription>
                        Access and download all your purchased notes and assignments.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild>
                        <Link href="/dashboard/my-content">
                            View My Content <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <UserDashboard />
    )
}
