'use server';

import { getAdminAuth, getAdminStorage, getAdminFirestore } from '@/firebase/admin';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function getDownloadUrlForPdf(token: string, unitId: string, type: 'note' | 'assignment', language: 'SI' | 'EN') {
    try {
        const decodedToken = await getAdminAuth().verifyIdToken(token);
        const userId = decodedToken.uid;
        
        const db = getAdminFirestore();
        const unlockedPdfsRef = collection(db, 'userUnlockedPdfs');
        
        const q = query(
            unlockedPdfsRef,
            where('userId', '==', userId),
            where('unitId', '==', unitId),
            where('type', '==', type),
            where('language', '==', language)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('User does not have access to this file.');
        }

        const unlockedPdfDoc = querySnapshot.docs[0];
        const unlockedPdfData = unlockedPdfDoc.data();

        if (!unlockedPdfData.pdfUrl) {
            throw new Error('File URL is missing.');
        }

        const bucket = getAdminStorage().bucket();
        // The URL is stored as a full gs:// path or https:// URL. We need to extract the file path.
        const url = new URL(unlockedPdfData.pdfUrl);
        // Pathname for gs:// URLs is just the path, for https it includes the /b/bucket-name/o/ prefix
        const filePath = decodeURIComponent(url.pathname.split('/o/')[1]);
        
        if (!filePath) {
            throw new Error("Could not determine file path from URL.");
        }
        
        const file = bucket.file(filePath);

        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        
        return { success: true, url: signedUrl };

    } catch (error: any) {
        console.error("Error generating download URL:", error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
