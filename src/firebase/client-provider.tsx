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
    // You can show a loading spinner here
    return <div>Loading Firebase...</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}