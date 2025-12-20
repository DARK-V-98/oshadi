import { getStorage, ref, getBytes, getDownloadURL } from "firebase/storage";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase";
import { firebaseConfig } from "@/firebase/config";

// Initialize Firebase for server-side operations
initializeFirebase();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('file');

  if (!filePath) {
    return new NextResponse("File path is required.", { status: 400 });
  }

  try {
    const storage = getStorage();
    const fileRef = ref(storage, filePath);
    
    // Get public download URL
    const downloadUrl = await getDownloadURL(fileRef);

    // Fetch the file using the public URL
    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file from storage: ${fileResponse.statusText}`);
    }
    const originalBytes = await fileResponse.arrayBuffer();

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
    if (error.code === 'storage/object-not-found') {
        return new NextResponse("File not found.", { status: 404 });
    }
    return new NextResponse("An error occurred while watermarking the PDF.", { status: 500 });
  }
}
