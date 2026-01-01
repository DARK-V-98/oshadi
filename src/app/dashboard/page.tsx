
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { collection, query, where, doc, onSnapshot, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, FileText, HelpCircle, Loader2, CheckCircle, AlertTriangle, ShoppingBag, History } from 'lucide-react';
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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Badge } from '@/components/ui/badge';
import TestimonialForm from '@/components/dashboard/TestimonialForm';
import { CartItem } from '@/context/CartContext';


interface UnlockedPdfDoc {
    id: string; // firestore doc id
    orderId: string;
    unitId: string;
    partName: string;
    fileName: string;
    downloadUrl: string;
    type: 'note' | 'assignment';
    language: 'EN' | 'SI';
    downloaded: boolean;
    downloadedAt?: { toDate: () => Date };
    unlockedAt: { toDate: () => Date };
    unitNameEN: string;
    unitNameSI: string;
}

interface GroupedContent {
    [key: string]: UnlockedPdfDoc[];
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

  const [unlockedPdfs, setUnlockedPdfs] = useState<UnlockedPdfDoc[]>([]);
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
        const unlockedPromises = querySnapshot.docs.map(async (pdfDoc) => {
            const pdfData = pdfDoc.data();
            const unitDocRef = doc(firestore, 'units', pdfData.unitId);
            const unitDocSnap = await getDoc(unitDocRef);
            let unitNameEN = 'Unknown Unit';
            let unitNameSI = 'Unknown Unit';

            if (unitDocSnap.exists()) {
                const unitData = unitDocSnap.data();
                unitNameEN = unitData.nameEN;
                unitNameSI = unitData.nameSI;
            }

            return {
                id: pdfDoc.id,
                ...pdfData,
                unitNameEN,
                unitNameSI,
            } as UnlockedPdfDoc;
        });

        const unlockedData = await Promise.all(unlockedPromises);
        
        unlockedData.sort((a, b) => b.unlockedAt.toDate().getTime() - a.unlockedAt.toDate().getTime());

        setUnlockedPdfs(unlockedData);
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
    
    toast({ title: "Preparing Download...", description: "Your secure download will begin shortly."});
    
    try {
        const fileRef = ref(storage, part.downloadUrl);
        const originalBytes = await getBytes(fileRef);
        let pdfBytes = originalBytes;

        if (part.type === 'note') {
            const pdfDoc = await PDFDocument.load(originalBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            
            const watermarkText = 'Oshadi Vidarshana | esystemlk.xyz';

            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(watermarkText, {
                    x: width / 2 - 150,
                    y: height / 2,
                    size: 50,
                    font: helveticaFont,
                    color: rgb(0.9, 0.9, 0.9),
                    opacity: 0.3,
                    rotate: { type: 'degrees', angle: 45 },
                });
            }
            pdfBytes = await pdfDoc.save();
        }
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = part.fileName || `${part.unitId}-${part.partName}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        const partDocRef = doc(firestore, 'userUnlockedPdfs', part.id);
        await updateDoc(partDocRef, {
            downloaded: true,
            downloadedAt: new Date()
        });
        
        a.remove();
        window.URL.revokeObjectURL(url);
        toast({ title: "Download Started!", description: `Your file is downloading.`});
        

    } catch (error: any) {
        console.error("Error during download process: ", error);
        const errorMessage = error.code === 'storage/object-not-found' 
            ? "The file could not be found. Please contact support."
            : "An unexpected error occurred. Please try again later.";
        toast({ title: "Download Failed", description: errorMessage, variant: 'destructive' });
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

    const groupedContent = useMemo(() => {
        return unlockedPdfs.reduce((acc, pdf) => {
            const key = `${pdf.orderId}-${pdf.unitId}-${pdf.type}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(pdf);
            return acc;
        }, {} as GroupedContent);
    }, [unlockedPdfs]);

    const orderDownloads = useMemo(() => {
        return orders.reduce((acc, order) => {
          acc[order.id] = unlockedPdfs.filter(pdf => pdf.orderId === order.id);
          return acc;
        }, {} as Record<string, UnlockedPdfDoc[]>);
    }, [orders, unlockedPdfs]);
    
    const { activeOrders, historicalOrders } = useMemo(() => {
        const active: Order[] = [];
        const historical: Order[] = [];
        orders.forEach(order => {
            const orderPdfs = orderDownloads[order.id] || [];
            const isCompletedAndDownloaded = order.status === 'completed' && orderPdfs.length > 0 && orderPdfs.every(pdf => pdf.downloaded);
            if (isCompletedAndDownloaded) {
                historical.push(order);
            } else {
                active.push(order);
            }
        });
        return { activeOrders: active, historicalOrders: historical };
    }, [orders, orderDownloads]);


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
                ) : Object.keys(groupedContent).length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                           <div className="divide-y divide-border">
                            {Object.entries(groupedContent).map(([key, parts]) => {
                                const firstPart = parts[0];
                                const partEN = parts.find(p => p.language === 'EN');
                                const partSI = parts.find(p => p.language === 'SI');

                                return (
                                <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                                    <div className="flex items-center gap-4">
                                        <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1 sm:mt-0"/>
                                        <div>
                                            <p className="font-semibold">{firstPart.unitNameEN} - <span className="capitalize">{firstPart.type}</span></p>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Unlocked: {firstPart.unlockedAt.toDate().toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 grid grid-cols-2 gap-2 w-full sm:w-auto">
                                        {partEN && (
                                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => confirmDownload(partEN)} disabled={partEN.downloaded || downloading[partEN.id]}>
                                                {downloading[partEN.id] ? <Loader2 className="w-4 h-4 animate-spin"/> : partEN.downloaded ? <CheckCircle className="w-4 h-4"/> : <Download className="w-4 h-4"/>}
                                                <span className="ml-2">English</span>
                                            </Button>
                                        )}
                                        {partSI && (
                                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => confirmDownload(partSI)} disabled={partSI.downloaded || downloading[partSI.id]}>
                                                {downloading[partSI.id] ? <Loader2 className="w-4 h-4 animate-spin"/> : partSI.downloaded ? <CheckCircle className="w-4 h-4"/> : <Download className="w-4 h-4"/>}
                                                <span className="ml-2">Sinhala</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )})}
                           </div>
                        </CardContent>
                    </Card>
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
                ) : activeOrders.length > 0 ? (
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
                                {activeOrders.map(order => (
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
                        <p className="text-muted-foreground">You have no active orders.</p>
                    </Card>
                )}
            </div>
             {historicalOrders.length > 0 && (
                <Accordion type="single" collapsible>
                    <AccordionItem value="order-history">
                        <AccordionTrigger>
                            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                                <History className="w-5 h-5"/>
                                Order History
                            </h2>
                        </AccordionTrigger>
                        <AccordionContent>
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
                                        {historicalOrders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <ul className="text-xs list-disc pl-4">
                                                        {order.items.map(item => <li key={item.id}>{item.unitName} ({item.language} {item.type})</li>)}
                                                    </ul>
                                                </TableCell>
                                                <TableCell>LKR {order.totalPrice.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={getStatusColor(order.status)}>Completed & Downloaded</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                           </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
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
                        This is a <strong className="text-destructive">one-time only</strong> download for this specific purchase. You will not be able to download this file again. Please ensure you are on a stable connection and save the file securely.
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

    

    