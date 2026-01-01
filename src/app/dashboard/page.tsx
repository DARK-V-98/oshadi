
'use client';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { collection, query, where, doc, onSnapshot, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, FileText, HelpCircle, Loader2, CheckCircle, AlertTriangle, Languages, ShoppingBag, Clock } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ref, getBytes } from 'firebase/storage';
import { Badge } from '@/components/ui/badge';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import TestimonialForm from '@/components/dashboard/TestimonialForm';
import { CartItem } from '@/context/CartContext';


interface UnlockedPdfDoc {
    id: string; // firestore doc id
    unitId: string;
    partName: string;
    fileName: string;
    downloadUrl: string;
    type: 'note' | 'assignment';
    language: 'EN' | 'SI';
    downloaded: boolean;
    downloadedAt?: Date;
}

interface UnlockedUnitInfo {
    unitId: string;
    unitNameEN: string;
    unitNameSI: string;
    parts: UnlockedPdfDoc[];
}

interface Order {
    id: string;
    items: CartItem[];
    totalPrice: number;
    status: 'pending' | 'processing' | 'completed' | 'pending payment';
    createdAt: { toDate: () => Date };
}

function UserDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [unlockedUnits, setUnlockedUnits] = useState<UnlockedUnitInfo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPartForDownload, setSelectedPartForDownload] = useState<UnlockedPdfDoc | null>(null);


  useEffect(() => {
    if (!user || !firestore) return;
  
    setLoadingContent(true);
    const unlockedRef = collection(firestore, 'userUnlockedPdfs');
    const q = query(unlockedRef, where('userId', '==', user.uid));
  
    const unsubscribeUnlocked = onSnapshot(q, async (querySnapshot) => {
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
           if (unitsMap[pdfDoc.unitId]) {
            const existingPartIndex = unitsMap[pdfDoc.unitId].parts.findIndex(p => p.id === pdfDoc.id);
            if (existingPartIndex === -1) {
                unitsMap[pdfDoc.unitId].parts.push(pdfDoc);
            } else {
                unitsMap[pdfDoc.unitId].parts[existingPartIndex] = pdfDoc;
            }
          }
      }
  
      setUnlockedUnits(Object.values(unitsMap));
      setLoadingContent(false);
  
    }, (error) => {
      console.error("Error fetching unlocked PDFs: ", error);
      toast({ title: 'Error', description: 'Could not load your unlocked PDFs.', variant: 'destructive' });
      setLoadingContent(false);
    });

    setLoadingOrders(true);
    const ordersRef = collection(firestore, 'orders');
    const qOrders = query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() } as Order));
        setOrders(fetchedOrders);
        setLoadingOrders(false);
    }, (error) => {
        console.error("Error fetching orders: ", error);
        toast({ title: 'Error', description: 'Could not load your order history.', variant: 'destructive' });
        setLoadingOrders(false);
    });
  
    return () => {
        unsubscribeUnlocked();
        unsubscribeOrders();
    };
  }, [user, firestore, toast]);

  
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
    
    toast({ title: "Preparing Download...", description: "Your download will begin shortly."});
    
    const fileRef = ref(storage, part.downloadUrl);
    const fileName = part.fileName || 'download.pdf';

    try {
        let blob: Blob;

        const originalBytes = await getBytes(fileRef);

        if (part.type === 'note') {
            const pdfDoc = await PDFDocument.load(originalBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            
            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText('oshadi vidarshana', {
                    x: width / 2 - 100,
                    y: height / 2,
                    size: 50,
                    font: helveticaFont,
                    color: rgb(0.95, 0.1, 0.1),
                    opacity: 0.2,
                    rotate: { type: 'degrees', angle: -45 },
                });
            }

            const watermarkedBytes = await pdfDoc.save();
            blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
        } else { // Assignment or any other type
            blob = new Blob([originalBytes], { type: 'application/pdf' });
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'pending': return 'bg-gray-100 text-gray-800';
        case 'pending payment': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
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
                    <AccordionTrigger>How to Get Your Notes</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                        <p>1. Add items to your cart from the homepage and checkout.</p>
                        <p>2. You will be prompted to contact us on WhatsApp to arrange payment.</p>
                        <p>3. Once your payment is confirmed, we will mark the order as "Completed".</p>
                        <p>4. Your PDF files will then appear below in 'My Unlocked Content'.</p>
                        <p>5. Click 'Download' to get your file. <strong className="text-destructive">This is a one-time action per file.</strong></p>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
          <TestimonialForm />
        </div>

        <div className="lg:col-span-2 space-y-8">
            <div>
                <h2 className="text-2xl font-bold font-heading mb-4">My Unlocked Content</h2>
                {loadingContent ? (
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
                                                 <Badge variant="outline">{part.language}</Badge>
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
                                Your unlocked PDFs will appear here after your order is completed.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </div>
            
            <div>
                <h2 className="text-2xl font-bold font-heading mb-4">My Orders</h2>
                {loadingOrders ? (
                     <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                     </div>
                ) : orders.length > 0 ? (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <ul className="text-xs list-disc pl-4">
                                                {order.items.map(item => <li key={item.id}>{item.unitName} ({item.language} {item.type})</li>)}
                                            </ul>
                                        </TableCell>
                                        <TableCell>LKR {order.totalPrice.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={getStatusColor(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4"/>
                        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                    </Card>
                )}
            </div>
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
