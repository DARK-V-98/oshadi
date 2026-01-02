
import { initializeApp, getApps, App, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

function initializeAdminApp() {
    if (getApps().length > 0) {
        return getAdminApp();
    }

    // Explicitly set the projectId to ensure the backend always uses the correct Firebase project.
    // This removes the need for a service account key environment variable for initialization,
    // resolving JSON parsing and audience claim mismatch errors.
    const appOptions = {
        projectId: 'esystemlkapp',
        storageBucket: 'esystemlkapp.appspot.com',
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
