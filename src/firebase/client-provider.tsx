'use client';

import { FirebaseProvider, initializeFirebase } from '@/firebase';
import { useEffect, useState } from 'react';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    const fb = initializeFirebase();
    setFirebase(fb);
  }, []);

  if (!firebase) {
    return <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Initializing Services...</p>
            </div>
        </div>;
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
