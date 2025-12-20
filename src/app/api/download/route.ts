import { getStorage } from "firebase-admin/storage";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from "next/server";
import { initializeAdminApp } from "@/firebase/admin";
import { firebaseConfig } from "@/firebase/config";

// Initialize Firebase Admin SDK
initializeAdminApp();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('file');

  if (!filePath) {
    return new NextResponse("File path is required.", { status: 400 });
  }

  try {
    const bucket = getStorage().bucket(firebaseConfig.storageBucket);
    const file = bucket.file(filePath);
    
    const [originalBytes] = await file.download();

    // Load the PDF
    const pdfDoc = await PDFDocument.load(originalBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    const watermarkText = 'oshadi vidarshana';
    const watermarkColor = rgb(0.5, 0.5, 0.5); // Grey color
    const watermarkOpacity = 0.2; // 20% opacity

    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 100,
        y: height / 2,
        size: 50,
        font: helveticaFont,
        color: watermarkColor,
        opacity: watermarkOpacity,
        rotate: {
          type: 'degrees',
          angle: 45,
        },
      });
    }

    // Save the watermarked PDF to a new buffer
    const pdfBytes = await pdfDoc.save();

    // Get the file name from the path
    const fileName = filePath.split('/').pop();

    // Send the watermarked PDF as a response
    const response = new NextResponse(pdfBytes);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return response;

  } catch (error: any) {
    console.error("Error processing PDF:", error);
    if (error.code === 404) {
        return new NextResponse("File not found in storage.", { status: 404 });
    }
    return new NextResponse("An error occurred while watermarking the PDF.", { status: 500 });
  }
}
