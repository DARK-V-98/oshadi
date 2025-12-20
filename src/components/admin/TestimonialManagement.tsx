'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Check, X, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved';
  createdAt: { toDate: () => Date };
}

export default function TestimonialManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const testimonialsRef = collection(firestore, 'testimonials');
    const q = query(testimonialsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTestimonials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Testimonial));
      setTestimonials(fetchedTestimonials);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching testimonials: ", error);
      toast({ title: 'Error', description: 'Could not load testimonials.', variant: 'destructive' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  const handleStatusChange = async (id: string, status: 'approved' | 'pending') => {
    if (!firestore) return;
    const testimonialDocRef = doc(firestore, 'testimonials', id);
    try {
        await updateDoc(testimonialDocRef, { status }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: testimonialDocRef.path,
                operation: 'update',
                requestResourceData: { status },
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
      toast({ title: 'Success', description: `Testimonial status updated to ${status}.` });
    } catch (error) {
        if (!(error instanceof FirestorePermissionError)) {
            toast({ title: 'Error', description: 'Could not update testimonial status.', variant: 'destructive' });
        }
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (!confirm('Are you sure you want to delete this testimonial permanently?')) return;
    
    const testimonialDocRef = doc(firestore, 'testimonials', id);
    try {
        await deleteDoc(testimonialDocRef).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: testimonialDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
      toast({ title: 'Deleted', description: 'Testimonial has been permanently deleted.' });
    } catch (error) {
        if (!(error instanceof FirestorePermissionError)) {
            toast({ title: 'Error', description: 'Could not delete the testimonial.', variant: 'destructive' });
        }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading testimonials...</p>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <CardContent className="flex flex-col items-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-heading">No Testimonials Yet</h3>
                <p className="text-muted-foreground mt-2">When users submit testimonials, they will appear here for your review.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonial.userAvatar} />
                  <AvatarFallback>{getInitials(testimonial.userName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.userName}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                    ))}
                  </div>
                </div>
                <Badge variant={testimonial.status === 'approved' ? 'default' : 'secondary'} className={testimonial.status === 'approved' ? 'bg-green-100 text-green-800' : ''}>
                  {testimonial.status}
                </Badge>
              </div>
              <p className="text-muted-foreground pl-2 border-l-2 ml-5">{testimonial.content}</p>
              <p className="text-xs text-muted-foreground pl-7">
                Submitted on: {testimonial.createdAt.toDate().toLocaleDateString()}
              </p>
            </div>
            <div className="flex sm:flex-col gap-2 justify-end">
              {testimonial.status === 'pending' ? (
                <Button size="sm" onClick={() => handleStatusChange(testimonial.id, 'approved')}>
                  <Check className="w-4 h-4 mr-2" /> Approve
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => handleStatusChange(testimonial.id, 'pending')}>
                  <X className="w-4 h-4 mr-2" /> Unapprove
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
