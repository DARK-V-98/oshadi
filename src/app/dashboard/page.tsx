'use client';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, writeBatch, onSnapshot, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Unit } from '@/lib/data';
import { Download, FileText, Key, HelpCircle, Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface UnlockedPdfPart {
    partName: string;
    downloadUrl: string;
    type: 'note' | 'assignment';
}

interface UnlockedUnitInfo {
    unitId: string;
    unitNameEN: string;
    unitNameSI: string;
    parts: UnlockedPdfPart[];
}


function UserDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const firebase = useFirebase();


  const [accessKey, setAccessKey] = useState('');
  const [isBinding, setIsBinding] = useState(false);
  const [unlockedPdfs, setUnlockedPdfs] = useState<UnlockedUnitInfo[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});


  useEffect(() => {
    if (!user || !firestore) return;

    setLoadingPdfs(true);
    const unlockedRef = collection(firestore, 'userUnlockedPdfs');
    const q = query(unlockedRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const unlockedDocs = querySnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id }));
        
        const groupedByUnit: Record<string, UnlockedUnitInfo> = {};

        for (const unlockedDoc of unlockedDocs) {
            const unitDocRef = doc(firestore, 'units', unlockedDoc.unitId);
            const unitDocSnap = await getDoc(unitDocRef);
            
            if (unitDocSnap.exists()) {
                const unitData = unitDocSnap.data() as Unit;
                const pdfsToUnlock = unlockedDoc.type === 'note' ? (unitData as any).notePdfs : (unitData as any).assignmentPdfs;

                if (!groupedByUnit[unlockedDoc.unitId]) {
                    groupedByUnit[unlockedDoc.unitId] = {
                        unitId: unlockedDoc.unitId,
                        unitNameEN: unitData.nameEN,
                        unitNameSI: unitData.nameSI,
                        parts: [],
                    };
                }
                
                if(pdfsToUnlock) {
                    pdfsToUnlock.forEach((part: any) => {
                         // Avoid duplicates
                        if (!groupedByUnit[unlockedDoc.unitId].parts.some(p => p.downloadUrl === part.downloadUrl)) {
                             groupedByUnit[unlockedDoc.unitId].parts.push({ ...part, type: unlockedDoc.type });
                        }
                    });
                }
            }
        }
        
        setUnlockedPdfs(Object.values(groupedByUnit));
        setLoadingPdfs(false);

    }, (error) => {
        console.error("Error fetching unlocked PDFs: ", error);
        toast({ title: 'Error', description: 'Could not load your unlocked PDFs.', variant: 'destructive' });
        setLoadingPdfs(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);


  const handleBindKey = async () => {
    if (!accessKey.trim()) {
      toast({ title: 'Error', description: 'Please enter an access key.', variant: 'destructive' });
      return;
    }
    if (!firestore || !user) {
        toast({ title: 'Error', description: 'Could not connect to service.', variant: 'destructive' });
        return;
    }

    setIsBinding(true);

    const keysRef = collection(firestore, 'accessKeys');
    const q = query(keysRef, where('key', '==', accessKey), where('status', '==', 'available'));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ title: 'Invalid Key', description: 'This key is invalid, has expired, or has already been used.', variant: 'destructive' });
            setIsBinding(false);
            return;
        }

        const keyDoc = querySnapshot.docs[0];
        const keyData = keyDoc.data();

        const batch = writeBatch(firestore);

        const keyDocRef = doc(firestore, 'accessKeys', keyDoc.id);
        batch.update(keyDocRef, {
            status: 'bound',
            boundTo: user.uid,
            boundAt: new Date(),
        });
        
        const unlockedPdfRef = doc(collection(firestore, 'userUnlockedPdfs'));
        batch.set(unlockedPdfRef, {
            userId: user.uid,
            unitId: keyData.unitId,
            keyId: keyDoc.id,
            type: keyData.type,
            unlockedAt: new Date(),
        });

        await batch.commit();
        
        const unitDocRef = doc(firestore, 'units', keyData.unitId);
        const unitDocSnap = await getDoc(unitDocRef);
        const unlockedUnitInfo = unitDocSnap.data() as Unit;

        toast({ title: 'Success!', description: `You have unlocked "${unlockedUnitInfo?.nameEN}" (${keyData.type}).` });
        setAccessKey('');

    } catch (error) {
        console.error("Error binding key: ", error);
        toast({ title: 'Error', description: 'An unexpected error occurred while binding the key.', variant: 'destructive' });
    } finally {
        setIsBinding(false);
    }
  };
  
  const handleDownload = async (part: UnlockedPdfPart) => {
    setDownloading(prev => ({ ...prev, [part.downloadUrl]: true }));
    
    if (part.type === 'note') {
        toast({ title: "Processing...", description: `Your note is being prepared with a watermark.`});
        try {
            const response = await fetch(`/api/download?file=${encodeURIComponent(part.downloadUrl)}`);

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = part.downloadUrl.split('/').pop();
            a.download = fileName || 'download.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "Download started!", description: `Your watermarked note is downloading.`});

        } catch(error) {
            console.error("Error downloading watermarked file: ", error);
            toast({ title: "Download failed", description: `Could not get the file. Please try again later.`, variant: 'destructive' });
        }
    } else { // Assignment or any other type
        if (!firebase?.storage) return;
        toast({ title: "Preparing download..."});
        try {
            const fileRef = ref(firebase.storage, part.downloadUrl);
            const url = await getDownloadURL(fileRef);

            // This opens the file in a new tab, which is often better for non-watermarked originals
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = "noopener noreferrer";
            const fileName = part.downloadUrl.split('/').pop();
            a.download = fileName || 'download.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();

            toast({ title: "Download started!", description: `Your assignment file is downloading.`});
        } catch (error) {
            console.error("Error getting direct download URL: ", error);
            toast({ title: "Download failed", description: `Could not get the file. Please try again.`, variant: 'destructive' });
        }
    }

    setDownloading(prev => ({ ...prev, [part.downloadUrl]: false }));
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
                        <p>4. Click 'Download' to get your file.</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="text-primary"/>Bind Your Key</CardTitle>
              <CardDescription>Enter a purchased key to access new content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter your one-time key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  disabled={isBinding}
                />
                <Button onClick={handleBindKey} disabled={isBinding} className="w-full">
                  {isBinding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Binding Key...</> : 'Bind & Unlock'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-heading mb-4">My Unlocked Content</h2>
            {loadingPdfs ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Loading your content...</p>
                </div>
            ) : unlockedPdfs.length > 0 ? (
                <div className="space-y-6">
                    {unlockedPdfs.map(unit => (
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
                                      <div key={part.downloadUrl} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                                          <div className='flex items-center gap-2'>
                                             <Badge variant={part.type === 'note' ? 'default' : 'secondary'}>{part.type}</Badge>
                                             <span>{part.partName}</span>
                                          </div>
                                          <Button size="sm" variant="ghost" onClick={() => handleDownload(part)} disabled={downloading[part.downloadUrl]}>
                                              {downloading[part.downloadUrl] ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2"/>}
                                              Download
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
    </div>
  );
}

export default function DashboardPage() {
    return (
        <UserDashboard />
    )
}
