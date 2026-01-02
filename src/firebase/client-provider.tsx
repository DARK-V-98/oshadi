
'use client';

import { FirebaseProvider, initializeFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { onIdTokenChanged } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    const fb = initializeFirebase();
    setFirebase(fb);

    // Listen for ID token changes and set it in a cookie
    const unsubscribe = onIdTokenChanged(fb.auth, async (user) => {
        if (user) {
            const token = await user.getIdToken();
            document.cookie = `firebaseIdToken=${token}; path=/;`;
        } else {
            // Clear the cookie on sign-out
            document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (!firebase) {
    return <LoadingScreen />;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
      storage={firebase.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
