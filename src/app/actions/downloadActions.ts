
'use server';

import { getAdminAuth, getAdminStorage, getAdminFirestore } from '@/firebase/admin';

export async function getDownloadUrlForPdf(token: string, unitId: string, type: 'note' | 'assignment', language: 'SI' | 'EN') {
    try {
        const decodedToken = await getAdminAuth().verifyIdToken(token);
        const userId = decodedToken.uid;
        
        const db = getAdminFirestore();
        const unlockedPdfsRef = db.collection('userUnlockedPdfs');
        
        const q = unlockedPdfsRef
            .where('userId', '==', userId)
            .where('unitId', '==', unitId)
            .where('type', '==', type)
            .where('language', '==', language);
        
        const querySnapshot = await q.get();
        
        if (querySnapshot.empty) {
            throw new Error('User does not have access to this file.');
        }

        const unlockedPdfDoc = querySnapshot.docs[0];
        const unlockedPdfData = unlockedPdfDoc.data();

        if (!unlockedPdfData || !unlockedPdfData.pdfUrl) {
            throw new Error('File URL is missing.');
        }

        const bucket = getAdminStorage().bucket();
        // The URL is stored as a full gs:// path or https:// URL. We need to extract the file path.
        const urlString = unlockedPdfData.pdfUrl;

        let filePath: string;
        if (urlString.startsWith('gs://')) {
            const url = new URL(urlString);
            filePath = url.pathname.substring(1); // Remove leading slash
        } else if (urlString.startsWith('https://firebasestorage.googleapis.com')) {
            const pathSegment = new URL(urlString).pathname.split('/o/')[1];
            filePath = decodeURIComponent(pathSegment);
        } else {
             throw new Error("Unsupported file URL format.");
        }
        
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
