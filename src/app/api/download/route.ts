
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Initialize Firebase Admin SDK
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0] as App;
    }
    return initializeApp({
        credential: {
            projectId: firebaseConfig.projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        },
        storageBucket: firebaseConfig.storageBucket,
    });
}

export async function POST(req: NextRequest) {
    const { token, unlockedPdfId } = await req.json();

    if (!token || !unlockedPdfId) {
        return NextResponse.json({ error: 'Missing token or unlockedPdfId' }, { status: 400 });
    }

    try {
        getFirebaseAdminApp();
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        const db = getFirestore();
        const unlockedPdfRef = db.collection('userUnlockedPdfs').doc(unlockedPdfId);
        const unlockedPdfDoc = await unlockedPdfRef.get();

        if (!unlockedPdfDoc.exists || unlockedPdfDoc.data()?.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized or PDF not found' }, { status: 403 });
        }

        const unlockedPdfData = unlockedPdfDoc.data()!;
        
        if (unlockedPdfData.downloaded) {
             return NextResponse.json({ error: 'This file has already been downloaded.' }, { status: 403 });
        }

        const unitDocRef = db.collection('units').doc(unlockedPdfData.unitId);
        const unitDoc = await unitDocRef.get();
        if (!unitDoc.exists) {
            return NextResponse.json({ error: 'Unit data not found' }, { status: 404 });
        }
        const unitData = unitDoc.data()!;
        
        // Corrected logic to get the correct PDF URL
        const pdfsField = unlockedPdfData.language === 'SI' ? unitData.pdfsSI : unitData.pdfsEN;
        const pdfType = unlockedPdfData.type as 'note' | 'assignment';

        const sourcePdfUrl = pdfsField?.[pdfType];

        if (!sourcePdfUrl) {
            return NextResponse.json({ error: 'Source PDF not found for this unit/language/type' }, { status: 404 });
        }

        const bucket = getStorage().bucket();
        // The URL is in the format: gs://<bucket-name>/<path-to-file>
        // We need to extract the path.
        const filePath = new URL(sourcePdfUrl).pathname.split('/').slice(2).join('/');
        const file = bucket.file(filePath);

        const [pdfBytes] = await file.download();

        let finalPdfBytes: Uint8Array;
        
        const watermarkText = `Purchased by ${decodedToken.email || 'N/A'}`;


        if (unlockedPdfData.type === 'note') {
            // Apply watermark
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            
            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(watermarkText, {
                    x: 20,
                    y: height - 20,
                    size: 8,
                    font: helveticaFont,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: 0.5,
                });
            }
            finalPdfBytes = await pdfDoc.save();
        } else {
            // Serve original for assignments
            finalPdfBytes = pdfBytes;
        }

        // Mark as downloaded
        await unlockedPdfRef.update({
            downloaded: true,
            downloadedAt: new Date(),
        });
        
        const fileName = unlockedPdfData.language === 'SI' ? unitData.pdfFileNameSI : unitData.pdfFileNameEN;

        return new NextResponse(finalPdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName || 'download.pdf'}"`,
            },
        });

    } catch (error: any) {
        console.error('Download error:', error);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Authentication token expired. Please refresh and try again.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
    }
}
