
import { initializeApp, getApps, App, getApp as getAdminApp, AppOptions } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App;

function initializeAdminApp(): App {
    // If an app is already initialized, return it.
    if (getApps().length > 0) {
        return getAdminApp();
    }

    // Otherwise, create a new app.
    // Explicitly set the projectId to ensure the backend always uses the correct Firebase project.
    // This resolves audience claim mismatch errors by ensuring the token's 'aud' claim
    // matches the project the Admin SDK is authenticated for.
    const appOptions: AppOptions = {
        projectId: 'esystemlkapp',
        storageBucket: 'esystemlkapp.appspot.com',
    };

    // Initialize the app and return it.
    return initializeApp(appOptions);
}

// Ensure the app is initialized when this module is first imported.
adminApp = initializeAdminApp();


const getAdminAuth = (): Auth => {
    try {
        return getAuth(adminApp);
    } catch(e) {
        console.error("Critical Error: Could not get Firebase Admin Auth instance.", e);
        throw new Error("Could not initialize Firebase Admin Auth. The application cannot proceed.");
    }
};

const getAdminFirestore = (): Firestore => {
    try {
        return getFirestore(adminApp);
    } catch(e) {
        console.error("Critical Error: Could not get Firebase Admin Firestore instance.", e);
        throw new Error("Could not initialize Firebase Admin Firestore. The application cannot proceed.");
    }
}

const getAdminStorage = (): Storage => {
    try {
        return getStorage(adminApp);
    } catch(e) {
        console.error("Critical Error: Could not get Firebase Admin Storage instance.", e);
        throw new Error("Could not initialize Firebase Admin Storage. The application cannot proceed.");
    }
}

export { adminApp, getAdminAuth, getAdminFirestore, getAdminStorage };
