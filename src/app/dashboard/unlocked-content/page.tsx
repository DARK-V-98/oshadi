
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, FileText, Loader2, CheckCircle, AlertTriangle, History } from 'lucide-react';
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
import { getDownloadUrlForPdf } from '@/app/actions/downloadActions';

interface UnlockedPdfDoc {
    id: string; // firestore doc id
    orderId: string;
    unitId: string;
    unitNo: string;
    type: 'note' | 'assignment';
    language: 'EN' | 'SI';
    downloaded: boolean;
    downloadedAt?: { toDate: () => Date };
    unlockedAt: { toDate: () => Date };
    unitNameEN: string;
    category: string;
}

function UnlockedContentPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [unlockedPdfs, setUnlockedPdfs] = useState<UnlockedPdfDoc[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPartForDownload, setSelectedPartForDownload] = useState<UnlockedPdfDoc | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;
  
    setLoadingContent(true);
    const unlockedRef = collection(firestore, 'userUnlockedPdfs');
    const qUnlocked = query(unlockedRef, where('userId', '==', user.uid), orderBy('unlockedAt', 'desc'));
  
    const unsubscribeUnlocked = onSnapshot(qUnlocked, (snapshot) => {
        const unlockedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnlockedPdfDoc));
        setUnlockedPdfs(unlockedData);
        setLoadingContent(false);
    }, (error) => {
      console.error("Error fetching unlocked PDFs: ", error);
      toast({ title: 'Error', description: 'Could not load your unlocked PDFs.', variant: 'destructive' });
      setLoadingContent(false);
    });
  
    return () => {
        unsubscribeUnlocked();
    };
  }, [user, firestore, toast]);

  
  const confirmDownload = (part: UnlockedPdfDoc) => {
    if (part.downloaded) {
        toast({ title: "Re-downloading...", description: "You have already downloaded this file. Preparing it again."});
        handleDownload(part, true);
        return;
    }
    setSelectedPartForDownload(part);
    setShowConfirmDialog(true);
  };

  const handleDownload = async (partToDownload?: UnlockedPdfDoc, isRedownload = false) => {
    const part = partToDownload || selectedPartForDownload;
    if (!user || !part) return;

    const downloadKey = part.id;
    setDownloading(prev => ({ ...prev, [downloadKey]: true }));
    if (!isRedownload) {
      setShowConfirmDialog(false);
    }
    
    toast({ title: "Preparing Download...", description: "Your secure download will begin shortly."});

    try {
      const result = await getDownloadUrlForPdf(part.id);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
          toast({ title: "Download Started!", description: `Your file is opening in a new tab.` });
      } else {
        throw new Error('No download URL received from server.');
      }
        
    } catch (error: any) {
        console.error("Error during download process: ", error);
        toast({ title: "Download Failed", description: error.message, variant: 'destructive' });
    } finally {
        setDownloading(prev => ({ ...prev, [downloadKey]: false }));
        setSelectedPartForDownload(null);
    }
  }

    const { activeContent, historicalContent } = useMemo(() => {
        const active: UnlockedPdfDoc[] = [];
        const historical: UnlockedPdfDoc[] = [];
        unlockedPdfs.forEach(pdf => {
            if (pdf.downloaded) {
                historical.push(pdf);
            } else {
                active.push(pdf);
            }
        });
        return { activeContent: active, historicalContent: historical };
    }, [unlockedPdfs]);
    

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
        <div>
            <h1 className="text-3xl font-bold font-heading mb-2">My Unlocked Content</h1>
            <p className="text-muted-foreground">Download your purchased notes and assignments.</p>
        </div>
        
        {loadingContent ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading your content...</p>
            </div>
        ) : (
            <>
                <div>
                    <h2 className="text-2xl font-bold font-heading mb-4">Ready to Download</h2>
                    {activeContent.length > 0 ? (
                        <Card>
                            <CardContent className="p-0">
                               <div className="divide-y divide-border">
                                {activeContent.map((part) => (
                                    <div key={part.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                                        <div className="flex items-center gap-4">
                                            <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1 sm:mt-0"/>
                                            <div>
                                                <p className="font-semibold">{part.unitNameEN} - <span className="capitalize">{part.type} ({part.language})</span></p>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Unlocked: {part.unlockedAt.toDate().toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 w-full sm:w-auto">
                                            <Button size="sm" variant="outline" className="rounded-full w-full" onClick={() => confirmDownload(part)} disabled={downloading[part.id]}>
                                                {downloading[part.id] ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                                                <span className="ml-2">Download</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                               </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                            <CardHeader>
                                <CardTitle>No Active Content</CardTitle>
                                <CardDescription>
                                    Your available downloads will appear here once you unlock them from the 'My Orders' page.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
                 
                 {historicalContent.length > 0 && (
                    <Accordion type="single" collapsible>
                        <AccordionItem value="history">
                            <AccordionTrigger>
                                <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                                    <History className="w-5 h-5"/>
                                    Download History
                                </h2>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-border">
                                        {historicalContent.map((part) => (
                                            <div key={part.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                                                <div className="flex items-center gap-4">
                                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1 sm:mt-0"/>
                                                    <div>
                                                        <p className="font-semibold">{part.unitNameEN} - <span className="capitalize">{part.type} ({part.language})</span></p>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Downloaded: {part.downloadedAt ? part.downloadedAt.toDate().toLocaleString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => confirmDownload(part)} disabled={downloading[part.id]}>
                                                {downloading[part.id] ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                                                <span className="ml-2">Download Again</span>
                                                </Button>
                                            </div>
                                        ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                 )}
            </>
        )}
      
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        Confirm One-Time Download
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This is a <strong className="text-destructive">one-time only</strong> download for this specific purchase. You will not be able to download this file again from this list. It will move to your history. Please ensure you are on a stable connection and save the file securely.
                        <br/><br/>
                        Do you want to proceed with the download now?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPartForDownload(null)}>Later</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDownload()}>Download Now</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

export default function UnlockedContentDashboardPage() {
    return <UnlockedContentPage />
}
