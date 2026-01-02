
import { initializeApp, getApps, App, cert, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

function initializeAdminApp() {
    if (getApps().length > 0) {
        return getAdminApp();
    }

    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

    // The audience claim mismatch error indicates a project ID conflict.
    // Explicitly setting the projectId here ensures the Admin SDK is initialized
    // for the correct project, matching the frontend Firebase config.
    const appOptions = {
        projectId: 'esystemlkapp',
        storageBucket: 'esystemlkapp.appspot.com',
        ...(serviceAccount && { credential: cert(serviceAccount) })
    };

    return initializeApp(appOptions);
}

adminApp = initializeAdminApp();


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
