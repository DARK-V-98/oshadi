
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TestimonialForm from '@/components/dashboard/TestimonialForm';
import { HelpCircle, ShoppingBag, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function UserDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-heading">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Manage your orders and access your content here.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary"/> NVQ Level Guide</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>How to Get Your Notes</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                        <p>1. Add items to your cart from the homepage and checkout.</p>
                        <p>2. You will be prompted to contact us on WhatsApp to arrange payment.</p>
                        <p>3. Once payment is confirmed, your order will be marked "Completed".</p>
                        <p>4. Find your completed order in the 'My Orders' page to unlock it.</p>
                        <p>5. Your files will then be available on the 'My Unlocked Content' page.</p>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
          <TestimonialForm />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        My Orders
                    </CardTitle>
                    <CardDescription>
                        Track your active orders, unlock new content from completed purchases, and view your order history.
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
                        <Download className="w-6 h-6 text-primary" />
                        My Unlocked Content
                    </CardTitle>
                    <CardDescription>
                        Access and download all your purchased notes and assignments. You can also re-download items from your history.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild>
                        <Link href="/dashboard/unlocked-content">
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
