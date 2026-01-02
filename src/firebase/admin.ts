import { initializeApp, getApps, App, cert, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getAdminApp();
    }
    
    if (serviceAccount) {
        // Running locally or in a CI/CD environment with service account key
        return initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        // Running in a Google Cloud environment (e.g., App Hosting)
        return initializeApp();
    }
}

export const adminApp: App = getFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
