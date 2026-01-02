
import { initializeApp, getApps, App, getApp as getAdminApp, AppOptions, credential } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App;

function initializeAdminApp(): App {
    if (getApps().length > 0) {
        return getAdminApp();
    }

    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (e: any) {
            console.error("Critical Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not valid JSON.", e.message);
            throw new Error("Could not initialize Firebase Admin. Service account key is malformed.");
        }
    } else {
        console.warn("Warning: FIREBASE_SERVICE_ACCOUNT_KEY is not set. Using default application credentials. This might fail in some environments.");
    }
    
    const appOptions: AppOptions = {
        projectId: 'esystemlkapp',
        storageBucket: 'esystemlkapp.appspot.com',
        credential: serviceAccount ? credential.cert(serviceAccount) : undefined,
    };

    adminApp = initializeApp(appOptions);
    return adminApp;
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
