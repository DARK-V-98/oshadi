'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';


interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  signIn: (email:string, password:string) => ReturnType<typeof signInWithEmailAndPassword>;
  signUp: (email:string, password:string) => ReturnType<typeof createUserWithEmailAndPassword>;
  signOut: () => ReturnType<typeof firebaseSignOut>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: {
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {

  const signIn = (email:string, password:string) => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signUp = (email:string, password:string) => {
    const { createUserWithEmailAndPassword } = require('firebase/auth');
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const signOut = () => {
    const { signOut: firebaseSignOut } = require('firebase/auth');
    return firebaseSignOut(auth);
  }

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore, signIn, signUp, signOut }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const useFirebaseApp = () => {
  return useContext(FirebaseContext)?.firebaseApp;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useAuth must be used within a FirebaseProvider");
  return context;
};

export const useFirestore = () => {
  return useContext(FirebaseContext)?.firestore;
};
