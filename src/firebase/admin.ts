import * as admin from 'firebase-admin';
import { firebaseConfig } from './config';

// It's important to check if the app is already initialized to avoid errors.
if (!admin.apps.length) {
  try {
    // If GOOGLE_APPLICATION_CREDENTIALS env var is set, it will be used automatically.
    // Otherwise, you might need to specify credentials manually for local development.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be formatted correctly (replace \n with actual newlines)
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

export function initializeAdminApp() {
  // This function is just to ensure this file is imported and run.
}
