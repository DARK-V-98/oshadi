
'use server';

import { getAdminFirestore, getAdminStorage, getAdminAuth } from '@/firebase/admin';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Unit } from '@/lib/data';


export async function getDownloadUrlForPdf(token: string, unlockedPdfId: string): Promise<{ downloadUrl?: string; error?: string }> {
    try {
        if (!token) {
            return { error: 'User is not authenticated.' };
        }

        const decodedToken = await getAdminAuth().verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = getAdminFirestore();
        const storage = getAdminStorage();

        // 1. Verify the user owns the unlocked PDF record
        const unlockedPdfRef = doc(db, 'userUnlockedPdfs', unlockedPdfId);
        const unlockedPdfDoc = await getDoc(unlockedPdfRef);

        if (!unlockedPdfDoc.exists() || unlockedPdfDoc.data()?.userId !== userId) {
            return { error: 'Unauthorized or PDF record not found.' };
        }

        const unlockedPdfData = unlockedPdfDoc.data();
        const { unitId, type, language, downloaded } = unlockedPdfData;
        
        if (!unitId || !type || !language) {
             return { error: 'Unlocked PDF record is incomplete.' };
        }

        // 2. Get the unit document using the correct document ID
        const unitDocRef = doc(db, 'units', unitId);
        const unitDoc = await getDoc(unitDocRef);

        if (!unitDoc.exists()) {
            return { error: `Unit data not found for ID: ${unitId}.` };
        }
        
        const unitData = unitDoc.data() as Unit;
        
        // 3. Determine which PDF URL to use
        let sourcePdfUrl: string | undefined;
        let pdfFileName: string | undefined;

        if (language === 'SI') {
            sourcePdfUrl = type === 'note' ? unitData.pdfUrlNotesSI : unitData.pdfUrlAssignmentsSI;
            pdfFileName = type === 'note' ? unitData.pdfFileNameNotesSI : unitData.pdfFileNameAssignmentsSI;
        } else { // language === 'EN'
            sourcePdfUrl = type === 'note' ? unitData.pdfUrlNotesEN : unitData.pdfUrlAssignmentsEN;
            pdfFileName = type === 'note' ? unitData.pdfFileNameNotesEN : unitData.pdfFileNameAssignmentsEN;
        }
        
        if (!sourcePdfUrl) {
            return { error: `Source PDF not found for this unit/language/type combination.` };
        }
        
        // 4. Generate a signed URL
        const filePath = decodeURIComponent(new URL(sourcePdfUrl).pathname.split('/o/')[1].split('?')[0]);
        const file = storage.bucket().file(filePath);
        
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 5 * 60 * 1000, // 5 minutes
            responseDisposition: `attachment; filename="${pdfFileName || `download.pdf`}"`
        });

        // 5. Update the download status in Firestore if it's the first download
        if (!downloaded) {
            await updateDoc(unlockedPdfRef, { downloaded: true, downloadedAt: new Date() });
        }

        return { downloadUrl: signedUrl };

    } catch (error: any) {
        console.error('Download Action Error:', error);
        return { error: error.message || 'An internal server error occurred.' };
    }
}
