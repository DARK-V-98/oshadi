'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      router.push('/');
      return;
    }

    const ensureUserInDbAndCheckRole = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        let userData = userDoc.data();

        // If user document doesn't exist, create it
        if (!userDoc.exists()) {
          const newUser = {
            uid: user.uid,
            name: user.displayName || 'New User',
            email: user.email,
            role: 'user', // Assign default role
          };
          await setDoc(userDocRef, newUser);
          userData = newUser;
          toast({
            title: 'Profile Created',
            description: 'Your user profile has been initialized.',
          });
        }

        // Check for admin role
        if (userData && userData.role === 'admin') {
          setIsAuthorized(true);
        } else {
          toast({
            variant: 'destructive',
            title: 'Unauthorized',
            description: 'You do not have permission to access this page.',
          });
          router.push('/');
        }
      } catch (error) {
        console.error("Error ensuring user in DB or checking role: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to verify user role.',
          });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    ensureUserInDbAndCheckRole();
  }, [user, authLoading, firestore, router, toast]);

  if (loading || authLoading || !isAuthorized) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading & Verifying Access...</p>
        </div>
    );
  }

  return <>{children}</>;
}
