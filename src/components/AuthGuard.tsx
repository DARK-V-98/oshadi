'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
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
          
          await setDoc(userDocRef, newUser).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: newUser,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // rethrow to be caught by outer try/catch
          });

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
        if (!(error instanceof FirestorePermissionError)) {
          console.error("Error ensuring user in DB or checking role: ", error);
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to verify user role.',
            });
        }
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
