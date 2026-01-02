import { initializeApp, getApps, App, cert, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import 'dotenv/config';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getAdminApp();
    }
    
    if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }

    return initializeApp({
        credential: cert(serviceAccount)
    });
}

export const adminApp: App = getFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
