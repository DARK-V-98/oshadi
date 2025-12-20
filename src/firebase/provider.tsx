'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  signIn: typeof signInWithEmailAndPassword;
  signUp: typeof createUserWithEmailAndPassword;
  signOut: typeof firebaseSignOut;
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

  const signIn: typeof signInWithEmailAndPassword = (auth, email, password) => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signUp: typeof createUserWithEmailAndPassword = (auth, email, password) => {
    const { createUserWithEmailAndPassword } = require('firebase/auth');
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const signOut: typeof firebaseSignOut = (auth) => {
    const { signOut } = require('firebase/auth');
    return signOut(auth);
  }

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore, signIn, signUp, signOut }}>
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
  
  const { auth, signIn, signUp, signOut: firebaseSignOut } = context;

  const handleSignOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
  };

  if (!auth || !signIn || !signUp) {
      throw new Error("Auth functions not available");
  }

  return { 
      auth, 
      signIn: (email:string, password:string) => signIn(auth, email, password),
      signUp: (email:string, password:string) => signUp(auth, email, password),
      signOut: handleSignOut 
    };
};

export const useFirestore = () => {
  return useContext(FirebaseContext)?.firestore;
};