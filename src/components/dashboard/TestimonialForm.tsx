'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const testimonialSchema = z.object({
  content: z.string().min(10, 'Testimonial must be at least 10 characters.').max(500, 'Testimonial must be 500 characters or less.'),
  rating: z.number().min(1).max(5),
});

export default function TestimonialForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      content: '',
      rating: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
    if (!firestore || !user) {
      toast({ title: 'Error', description: 'You must be logged in to submit a testimonial.', variant: 'destructive' });
      return;
    }
    if (rating === 0) {
      toast({ title: 'Error', description: 'Please provide a rating.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    
    const testimonialData = {
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        content: values.content,
        rating: rating,
        status: 'pending',
        createdAt: serverTimestamp(),
    };

    try {
        const testimonialsRef = collection(firestore, 'testimonials');
        await addDoc(testimonialsRef, testimonialData).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: testimonialsRef.path,
                operation: 'create',
                requestResourceData: testimonialData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });

      toast({
        title: 'Thank you!',
        description: 'Your testimonial has been submitted for review.',
      });
      form.reset();
      setRating(0);
    } catch (error) {
      if (!(error instanceof FirestorePermissionError)) {
        toast({ title: 'Error', description: 'Could not submit your testimonial.', variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <MessageSquare className="text-primary"/>
            Leave a Testimonial
        </CardTitle>
        <CardDescription>Share your experience to help others.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about your experience..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-gold fill-gold'
                              : 'text-gray-300'
                          }`}
                          onClick={() => {
                            setRating(star);
                            field.onChange(star);
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                'Submit Testimonial'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
