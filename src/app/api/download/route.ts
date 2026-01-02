
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, query, collection, where, getDocs } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps } from 'firebase-admin/app';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Initialize Firebase Admin SDK only once
if (!getApps().length) {
    initializeApp({
        storageBucket: "esystemlkapp.appspot.com",
    });
}

export async function POST(req: NextRequest) {
    const { token, unlockedPdfId } = await req.json();

    if (!token || !unlockedPdfId) {
        return NextResponse.json({ error: 'Missing token or unlockedPdfId' }, { status: 400 });
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = getFirestore();

        const unlockedPdfRef = db.collection('userUnlockedPdfs').doc(unlockedPdfId);
        const unlockedPdfDoc = await unlockedPdfRef.get();

        if (!unlockedPdfDoc.exists || unlockedPdfDoc.data()?.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized or PDF record not found' }, { status: 403 });
        }

        const unlockedPdfData = unlockedPdfDoc.data()!;
        const { unitId, type, language, downloaded, category } = unlockedPdfData;

        if (downloaded && !req.nextUrl.searchParams.get('redownload')) {
             return NextResponse.json({ error: 'This file has already been downloaded.' }, { status: 403 });
        }
        
        const unitsRef = collection(db, 'units');
        const unitQuery = query(unitsRef, where('unitNo', '==', unitId), where('category', '==', category));
        const unitQuerySnapshot = await getDocs(unitQuery);

        if (unitQuerySnapshot.empty) {
            return NextResponse.json({ error: `Unit data not found for unitNo: ${unitId} in category: ${category}` }, { status: 404 });
        }
        
        const unitDoc = unitQuerySnapshot.docs[0];
        const unitData = unitDoc.data();
        
        const sourcePdfUrl = language === 'SI' ? unitData.pdfUrlSI : unitData.pdfUrlEN;

        if (!sourcePdfUrl) {
            return NextResponse.json({ error: `Source PDF not found for this unit/language (${language})` }, { status: 404 });
        }
        
        const bucket = getStorage().bucket();
        const decodedUrl = decodeURIComponent(sourcePdfUrl);
        const filePath = decodedUrl.split('/o/')[1].split('?')[0];

        const originalFile = bucket.file(filePath);
        const [exists] = await originalFile.exists();
        if (!exists) {
             return NextResponse.json({ error: 'File does not exist in storage.' }, { status: 404 });
        }

        const [originalPdfBytes] = await originalFile.download();
        let finalPdfBytes: Uint8Array;
        const baseFileName = language === 'SI' ? unitData.pdfFileNameSI : unitData.pdfFileNameEN;
        let finalFileName = baseFileName || `${unitId}.pdf`;

        if (type === 'note') {
            const pdfDoc = await PDFDocument.load(originalPdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const watermarkText = `Purchased by ${decodedToken.email || userId}`;
            
            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(watermarkText, {
                    x: 20, y: height - 20, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5), opacity: 0.5,
                });
            }
            finalPdfBytes = await pdfDoc.save();
            finalFileName = `[NOTES] ${finalFileName}`;
        } else {
            finalPdfBytes = originalPdfBytes;
            finalFileName = `[ASSIGNMENTS] ${finalFileName}`;
        }

        if (!downloaded) {
            await unlockedPdfRef.update({ downloaded: true, downloadedAt: new Date() });
        }
        
        const tempFileName = `temp/${userId}/${Date.now()}-${finalFileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;
        const tempFile = bucket.file(tempFileName);
        await tempFile.save(Buffer.from(finalPdfBytes), { contentType: 'application/pdf' });
        
        const [signedUrl] = await tempFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        });

        // Schedule deletion of the temporary file
        setTimeout(() => {
            tempFile.delete().catch(err => console.error(`Failed to delete temp file: ${tempFileName}`, err));
        }, 10 * 60 * 1000); // 10 minutes

        return NextResponse.json({ downloadUrl: signedUrl });

    } catch (error: any) {
        console.error('Download API Error:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
    
