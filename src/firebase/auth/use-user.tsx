'use client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth as useFirebaseAuth } from '..';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseAuth = useFirebaseAuth();

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    
    const auth = firebaseAuth.auth;
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuth]);

  return { user, loading };
}
