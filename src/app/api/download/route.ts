
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, query, collection, where, getDocs, doc, writeBatch, getDoc } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { Unit } from '@/lib/data';

// Helper to initialize Firebase Admin SDK only once
let adminApp: App;
function getFirebaseAdminApp(): App {
    if (!getApps().length) {
        adminApp = initializeApp();
    } else {
        adminApp = getApps()[0];
    }
    return adminApp;
}

export async function POST(req: NextRequest) {
    const { token, unlockedPdfId } = await req.json();

    if (!token || !unlockedPdfId) {
        return NextResponse.json({ error: 'Missing token or unlockedPdfId' }, { status: 400 });
    }

    try {
        const app = getFirebaseAdminApp();
        const decodedToken = await getAuth(app).verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = getFirestore(app);
        const storage = getStorage(app);

        // 1. Verify the user owns the unlocked PDF record
        const unlockedPdfRef = doc(db, 'userUnlockedPdfs', unlockedPdfId);
        const unlockedPdfDoc = await unlockedPdfRef.get();

        if (!unlockedPdfDoc.exists() || unlockedPdfDoc.data()?.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized or PDF record not found' }, { status: 403 });
        }

        const unlockedPdfData = unlockedPdfDoc.data();
        const { unitId, type, language, downloaded, category } = unlockedPdfData;
        
        // Prevent re-download if it's the first time and not a redownload request
        if (downloaded && !req.nextUrl.searchParams.get('redownload')) {
             return NextResponse.json({ error: 'This file has already been downloaded.' }, { status: 403 });
        }
        
        // 2. Find the unit document to get the source PDF URL
        const unitsRef = collection(db, 'units');
        const unitQuery = query(unitsRef, where('unitNo', '==', unitId), where('category', '==', category));
        const unitQuerySnapshot = await getDocs(unitQuery);

        if (unitQuerySnapshot.empty) {
            return NextResponse.json({ error: `Unit data not found for unitNo: ${unitId} in category: ${category}` }, { status: 404 });
        }
        
        const unitDoc = unitQuerySnapshot.docs[0];
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
            return NextResponse.json({ error: `Source PDF not found for this unit/language/type` }, { status: 404 });
        }

        // 4. Generate a signed URL for the direct file
        const filePath = decodeURIComponent(sourcePdfUrl.split('/o/')[1].split('?')[0]);
        const file = storage.bucket().file(filePath);
        
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 5 * 60 * 1000, // 5 minutes
            responseDisposition: `attachment; filename="${pdfFileName || `${unitData.nameEN} - ${language} ${type}.pdf`}"`
        });

        // 5. Update the download status in Firestore if it's the first download
        if (!downloaded) {
            await writeBatch(db).update(unlockedPdfRef, { downloaded: true, downloadedAt: new Date() }).commit();
        }

        // 6. Return the signed URL to the client
        return NextResponse.json({ downloadUrl: signedUrl });

    } catch (error: any) {
        console.error('Download API Error:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
