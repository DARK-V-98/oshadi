
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, App, getApp as getAdminApp } from 'firebase-admin/app';
import { Unit } from '@/lib/data';

// Correct initialization for Firebase Admin SDK in a server environment
function getFirebaseAdminApp(): App {
    if (getApps().length === 0) {
        return initializeApp();
    } else {
        return getAdminApp();
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Token missing from authorization header' }, { status: 401 });
        }

        const { unlockedPdfId } = await req.json();
        if (!unlockedPdfId) {
            return NextResponse.json({ error: 'Missing unlockedPdfId' }, { status: 400 });
        }
        
        const app = getFirebaseAdminApp();
        const decodedToken = await getAuth(app).verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = getFirestore(app);
        const storage = getStorage(app);

        // 1. Verify the user owns the unlocked PDF record
        const unlockedPdfRef = doc(db, 'userUnlockedPdfs', unlockedPdfId);
        const unlockedPdfDoc = await getDoc(unlockedPdfRef);

        if (!unlockedPdfDoc.exists() || unlockedPdfDoc.data()?.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized or PDF record not found' }, { status: 403 });
        }

        const unlockedPdfData = unlockedPdfDoc.data();
        const { unitId, type, language, downloaded } = unlockedPdfData;
        
        if (!unitId || !type || !language) {
             return NextResponse.json({ error: 'Unlocked PDF record is incomplete.' }, { status: 500 });
        }

        // 2. Get the unit document using the correct document ID
        const unitDocRef = doc(db, 'units', unitId);
        const unitDoc = await getDoc(unitDocRef);

        if (!unitDoc.exists()) {
            return NextResponse.json({ error: `Unit data not found for ID: ${unitId}` }, { status: 404 });
        }
        
        const unitData = unitDoc.data() as Unit;
        
        // 3. Determine which PDF URL to use based on language and type
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
            return NextResponse.json({ error: `Source PDF not found for this unit/language/type combination.` }, { status: 404 });
        }

        // 4. Generate a signed URL for the direct file
        const filePath = decodeURIComponent(sourcePdfUrl.split('/o/')[1].split('?')[0]);
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

        // 6. Return the signed URL to the client
        return NextResponse.json({ downloadUrl: signedUrl });

    } catch (error: any) {
        console.error('Download API Error:', error);
        // Provide a more specific error message if available
        let errorMessage = 'An internal server error occurred.';
        if (error.code) { // Firebase errors have a 'code' property
            errorMessage = `A server error occurred: ${error.code}`;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
    }
}

    