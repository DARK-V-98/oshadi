import { initializeApp, getApps, App, cert, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    if (getApps().length > 0) {
        adminApp = getAdminApp();
    } else {
        if (!serviceAccount) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
        }

        adminApp = initializeApp({
            credential: cert(serviceAccount),
            storageBucket: 'esystemlkapp.appspot.com'
        });
    }
} catch (error: any) {
    console.error("Firebase Admin Initialization Error:", error.message);
    // In a real app, you might want to handle this more gracefully
    // For now, we'll let it fail loudly during development if not configured.
    // A dummy app initialization to prevent further downstream errors on the server.
    if (getApps().length === 0) {
        adminApp = initializeApp();
    } else {
        adminApp = getAdminApp();
    }
}


const getAdminAuth = () => {
    try {
        return getAuth(adminApp);
    } catch(e) {
        console.error("Could not get admin auth", e);
        throw e;
    }
};

const getAdminFirestore = () => {
    try {
        return getFirestore(adminApp);
    } catch(e) {
        console.error("Could not get admin firestore", e);
        throw e;
    }
}

const getAdminStorage = () => {
    try {
        return getStorage(adminApp);
    } catch(e) {
        console.error("Could not get admin storage", e);
        throw e;
    }
}

export { adminApp, getAdminAuth, getAdminFirestore, getAdminStorage };
