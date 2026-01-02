
'use client';
import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Download, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDownloadUrlForPdf } from '@/app/actions/downloadActions';
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

interface UnlockedPdf {
  id: string;
  unitId: string;
  unitName: string;
  type: 'note' | 'assignment';
  language: 'SI' | 'EN';
  unlockedAt: { toDate: () => Date };
}

function MyContentPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [unlockedPdfs, setUnlockedPdfs] = useState<UnlockedPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmingDownload, setConfirmingDownload] = useState<UnlockedPdf | null>(null);


  useEffect(() => {
    if (!user || !firestore) return;

    setLoading(true);
    const unlockedPdfsRef = collection(firestore, 'userUnlockedPdfs');
    const q = query(unlockedPdfsRef, where('userId', '==', user.uid), orderBy('unlockedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPdfs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnlockedPdf));
      setUnlockedPdfs(fetchedPdfs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching unlocked content:", error);
      toast({ title: 'Error', description: 'Could not load your content.', variant: 'destructive' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);

  const handleDownload = async (pdf: UnlockedPdf) => {
    if (!user) return;
    
    setConfirmingDownload(null);
    setDownloadingId(pdf.id);

    try {
        const token = await user.getIdToken(true);
        const result = await getDownloadUrlForPdf(token, pdf.unitId, pdf.type, pdf.language);
        
        if (!result.success || !result.url) {
            throw new Error(result.error || 'Failed to get download link.');
        }
        
        // Open the URL in a new tab to trigger download
        window.open(result.url, '_blank');
        
        toast({
            title: 'Download Starting',
            description: `${pdf.unitName} will begin downloading.`,
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: error.message || 'Could not download the file.',
        });
    } finally {
        setDownloadingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold font-heading mb-2">My Content</h1>
        <p className="text-muted-foreground">Download your purchased notes and assignments here.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading your content...</p>
        </div>
      ) : unlockedPdfs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedPdfs.map(pdf => (
            <Card key={pdf.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{pdf.unitName}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{pdf.type} ({pdf.language})</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlocked on: {pdf.unlockedAt.toDate().toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => setConfirmingDownload(pdf)}
                  disabled={downloadingId === pdf.id}
                  className="w-full mt-4"
                >
                  {downloadingId === pdf.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Please wait...</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2"/> Download PDF</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4"/>
            <h3 className="text-xl font-bold font-heading">No Content Unlocked</h3>
            <p className="text-muted-foreground mt-2">Your purchased content will appear here once your order is completed.</p>
        </Card>
      )}

      {confirmingDownload && (
        <AlertDialog open={!!confirmingDownload} onOpenChange={(isOpen) => !isOpen && setConfirmingDownload(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-yellow-500" />Confirm Download</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will generate a secure, one-time link for your file. Please ensure you save the file after downloading.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDownload(confirmingDownload)}>
                        Proceed to Download
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}

export default function UserMyContentPage() {
    return <MyContentPage />
}
