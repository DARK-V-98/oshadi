
'use client';

import { FirebaseProvider, initializeFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    const fb = initializeFirebase();
    setFirebase(fb);
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
