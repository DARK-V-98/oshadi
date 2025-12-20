
'use client';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { collection, query, where, doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, FileText, HelpCircle, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getBytes, ref } from 'firebase/storage';
import { Badge } from '@/components/ui/badge';
import { PDFDocument } from 'pdf-lib';
import UnlockKeyForm from '@/components/dashboard/UnlockKeyForm';


interface PdfPart {
    partName: string;
    fileName: string;
    downloadUrl: string;
}

interface UnlockedPdfDoc {
    id: string; // firestore doc id
    unitId: string;
    partName: string;
    fileName: string;
    downloadUrl: string;
    type: 'note' | 'assignment';
    downloaded: boolean;
    downloadedAt?: Date;
}

interface UnlockedUnitInfo {
    unitId: string;
    unitNameEN: string;
    unitNameSI: string;
    parts: UnlockedPdfDoc[];
}

function UserDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [unlockedUnits, setUnlockedUnits] = useState<UnlockedUnitInfo[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPartForDownload, setSelectedPartForDownload] = useState<UnlockedPdfDoc | null>(null);


  useEffect(() => {
    if (!user || !firestore) return;
  
    setLoadingPdfs(true);
    const unlockedRef = collection(firestore, 'userUnlockedPdfs');
    const q = query(unlockedRef, where('userId', '==', user.uid));
  
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const unlockedData: UnlockedPdfDoc[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UnlockedPdfDoc));

        const unitsMap: Record<string, UnlockedUnitInfo> = {};

        for (const pdfDoc of unlockedData) {
            if (!unitsMap[pdfDoc.unitId]) {
                const unitDocRef = doc(firestore, 'units', pdfDoc.unitId);
                const unitDocSnap = await getDoc(unitDocRef);
                if (unitDocSnap.exists()) {
                    const unitData = unitDocSnap.data();
                    unitsMap[pdfDoc.unitId] = {
                        unitId: pdfDoc.unitId,
                        unitNameEN: unitData.nameEN,
                        unitNameSI: unitData.nameSI,
                        parts: []
                    };
                }
            }
        }
        
        for (const pdfDoc of unlockedData) {
            if (unitsMap[pdfDoc.unitId]) {
                // Prevent adding duplicates
                if (!unitsMap[pdfDoc.unitId].parts.some(p => p.id === pdfDoc.id)) {
                    unitsMap[pdfDoc.unitId].parts.push(pdfDoc);
                }
            }
        }
  
        setUnlockedUnits(Object.values(unitsMap));
        setLoadingPdfs(false);
  
    }, (error) => {
      console.error("Error fetching unlocked PDFs: ", error);
      toast({ title: 'Error', description: 'Could not load your unlocked PDFs.', variant: 'destructive' });
      setLoadingPdfs(false);
    });
  
    return () => unsubscribe();
  }, [user, firestore, toast]);

  interface UnitWithPdfs {
    pdfs: PdfPart[];
  }
  
  const confirmDownload = (part: UnlockedPdfDoc) => {
    if (part.downloaded) {
        toast({ title: "Already Downloaded", description: "You have already downloaded this file.", variant: "destructive" });
        return;
    }
    setSelectedPartForDownload(part);
    setShowConfirmDialog(true);
  };

  const handleDownload = async () => {
    if (!storage || !firestore || !user || !selectedPartForDownload) return;

    const part = selectedPartForDownload;
    const downloadKey = part.id;
    setDownloading(prev => ({ ...prev, [downloadKey]: true }));
    setShowConfirmDialog(false);
    
    const fileRef = ref(storage, part.downloadUrl);
    const fileName = part.fileName || 'download.pdf';

    try {
        toast({ title: "Preparing Download...", description: "Making arrangements for your file."});
        let blob: Blob;

        const originalBytes = await getBytes(fileRef);

        if (part.type === 'note') {
            const pdfDoc = await PDFDocument.load(originalBytes);
            
            // This part for watermarking is commented out as it was causing issues.
            // When re-enabling, ensure wasm is loaded correctly or do it on server.
            /*
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();

            const watermarkText = 'oshadi vidarshana';
            const watermarkColor = rgb(0.5, 0.5, 0.5);
            const watermarkOpacity = 0.2;

            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(watermarkText, {
                    x: width / 2 - 100,
                    y: height / 2,
                    size: 50,
                    font: helveticaFont,
                    color: watermarkColor,
                    opacity: watermarkOpacity,
                    rotate: { type: 'degrees', angle: 45 },
                });
            }

            const watermarkedBytes = await pdfDoc.save();
            blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
            */
           
           // For now, serve original bytes for notes as well
           blob = new Blob([originalBytes], { type: 'application/pdf' });

        } else { // Assignment or any other type
            blob = new Blob([originalBytes], { type: 'application/pdf' });
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Mark as downloaded in Firestore
        const partDocRef = doc(firestore, 'userUnlockedPdfs', part.id);
        await updateDoc(partDocRef, {
            downloaded: true,
            downloadedAt: new Date()
        });
        
        a.remove();
        window.URL.revokeObjectURL(url);
        toast({ title: "Download started!", description: `Your file is downloading.`});
        

    } catch (error) {
        console.error("Error during download process: ", error);
        toast({ title: "Download failed", description: `Could not get the file. Please try again later.`, variant: 'destructive' });
    } finally {
        setDownloading(prev => ({ ...prev, [downloadKey]: false }));
        setSelectedPartForDownload(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary"/> NVQ Level Guide</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>How to Download Notes</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                        <p>1. Purchase content to receive a one-time key.</p>
                        <p>2. Enter the key in the 'Bind Your Key' section below.</p>
                        <p>3. Once bound, your PDF will appear in 'My Unlocked Content'.</p>
                        <p>4. Click 'Download' to get your file. <strong className="text-destructive">This is a one-time action.</strong></p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Where is my key?</AccordionTrigger>
                    <AccordionContent>
                    Your one-time access key is sent to you via WhatsApp or Email immediately after your purchase is confirmed. If you haven't received it, please check your spam folder or contact support.
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
          <UnlockKeyForm />
        </div>

        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-heading mb-4">My Unlocked Content</h2>
            {loadingPdfs ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Loading your content...</p>
                </div>
            ) : unlockedUnits.length > 0 ? (
                <div className="space-y-6">
                    {unlockedUnits.map(unit => (
                        <Card key={unit.unitId}>
                           <CardHeader>
                               <CardTitle className="flex items-center gap-3">
                                   <FileText className="w-6 h-6 text-primary" />
                                   <div>
                                       {unit.unitNameEN}
                                       <p className="text-sm text-muted-foreground font-normal">{unit.unitNameSI}</p>
                                   </div>
                               </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-3">
                               {unit.parts && unit.parts.length > 0 ? (
                                   unit.parts.map(part => (
                                      <div key={part.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                                          <div className='flex items-center gap-2'>
                                             <Badge variant={part.type === 'note' ? 'default' : 'secondary'}>{part.type}</Badge>
                                             <span>{part.partName}</span>
                                          </div>
                                          <Button size="sm" variant="ghost" onClick={() => confirmDownload(part)} disabled={part.downloaded || downloading[part.id]}>
                                              {downloading[part.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : part.downloaded ? <CheckCircle className="w-4 h-4 mr-2"/> : <Download className="w-4 h-4 mr-2"/>}
                                              {part.downloaded ? 'Downloaded' : 'Download'}
                                         </Button>
                                      </div>
                                   ))
                               ) : (
                                   <p className="text-muted-foreground text-sm">No PDF parts available for this unit yet.</p>
                               )}
                           </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                    <CardHeader>
                        <CardTitle>No Unlocked Content Yet</CardTitle>
                        <CardDescription>
                            Your unlocked PDFs will appear here once you bind a key.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Scroll down or check the guide to learn how to bind a key.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
      
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        Confirm One-Time Download
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This is a <strong className="text-destructive">one-time only</strong> download. You will not be able to download this file again after this. Please ensure you are on a stable connection and save the file securely.
                        <br/><br/>
                        Do you want to proceed with the download now?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPartForDownload(null)}>Later</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDownload}>Download Now</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}

export default function DashboardPage() {
    return (
        <UserDashboard />
    )
}

    