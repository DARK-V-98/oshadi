
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, getDocs, orderBy, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, FileText, HelpCircle, Loader2, CheckCircle, AlertTriangle, ShoppingBag, History, Lock, Unlock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import TestimonialForm from '@/components/dashboard/TestimonialForm';
import { CartItem } from '@/context/CartContext';


interface UnlockedPdfDoc {
    id: string; // firestore doc id
    orderId: string;
    unitId: string; // This is the Firestore document ID of the unit
    unitNo: string;
    type: 'note' | 'assignment';
    language: 'EN' | 'SI';
    downloaded: boolean;
    downloadedAt?: { toDate: () => Date };
    unlockedAt: { toDate: () => Date };
    unitNameEN: string;
    category: string;
}

interface Order {
    id: string;
    items: CartItem[];
    totalPrice: number;
    status: 'pending' | 'processing' | 'completed' | 'pending payment';
    createdAt: { toDate: () => Date };
    contentUnlocked?: boolean;
}

function UserDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [unlockedPdfs, setUnlockedPdfs] = useState<UnlockedPdfDoc[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [unlockingOrder, setUnlockingOrder] = useState<string | null>(null);
  
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
      const token = await user.getIdToken(true);
      const response = await fetch('/api/download', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ unlockedPdfId: part.id }),
      });

      if (!response.ok) {
        let errorMessage = 'Download failed due to an unknown error.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            errorMessage = `An internal server error occurred. Please contact support. (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
    }

      const { downloadUrl } = await response.json();

      if (downloadUrl) {
          window.open(downloadUrl, '_blank');
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

  const handleUnlockContent = async (orderId: string) => {
      if(!user) return;
      setUnlockingOrder(orderId);
      
      try {
        const token = await user.getIdToken(true);
        const response = await fetch('/api/unlock-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to unlock content.');
        }

        toast({
            title: "Content Unlocked!",
            description: "Your new items are now available in 'My Unlocked Content'.",
        });

      } catch (error: any) {
        console.error("Error unlocking content:", error);
        toast({ title: "Unlock Failed", description: error.message, variant: 'destructive' });
      } finally {
        setUnlockingOrder(null);
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
    
    const { readyToUnlockOrders, activeOrders, historicalOrders } = useMemo(() => {
        const ready: Order[] = [];
        const active: Order[] = [];
        const historical: Order[] = [];
        orders.forEach(order => {
            if (order.status === 'completed' && !order.contentUnlocked) {
                 ready.push(order);
            } else if (order.status === 'completed' && order.contentUnlocked) {
                historical.push(order);
            } else {
                active.push(order);
            }
        });
        return { readyToUnlockOrders: ready, activeOrders: active, historicalOrders: historical };
    }, [orders]);


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
                        <p>3. Once payment is confirmed, your order will be marked "Completed".</p>
                        <p>4. Find your completed order in the 'Ready to Unlock' section below.</p>
                        <p>5. Click 'Unlock My Content' to make your files available for download.</p>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
          <TestimonialForm />
        </div>

        <div className="lg:col-span-2 space-y-8">
            {readyToUnlockOrders.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold font-heading mb-4 text-primary">Ready to Unlock</h2>
                     {readyToUnlockOrders.map(order => (
                         <Card key={order.id} className="mb-4 border-primary shadow-soft">
                             <CardHeader>
                                 <CardTitle>Order Completed!</CardTitle>
                                 <CardDescription>Your order from {order.createdAt.toDate().toLocaleDateString()} is ready. Click below to access your content.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 <ul className="text-sm list-disc pl-5 mb-4 text-muted-foreground">
                                     {order.items.map(item => <li key={item.id}>{item.unitName} ({item.language} {item.type})</li>)}
                                 </ul>
                             </CardContent>
                             <CardContent>
                                <Button className="w-full" size="lg" onClick={() => handleUnlockContent(order.id)} disabled={unlockingOrder === order.id}>
                                    {unlockingOrder === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                                    {unlockingOrder === order.id ? 'Unlocking...' : 'Unlock My Content'}
                                </Button>
                             </CardContent>
                         </Card>
                     ))}
                </div>
            )}
            <div>
                <h2 className="text-2xl font-bold font-heading mb-4">My Unlocked Content</h2>
                {loadingContent ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="ml-3 text-muted-foreground">Loading your content...</p>
                    </div>
                ) : activeContent.length > 0 ? (
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
                                Your available downloads will appear here. Previously downloaded items are in your history.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </div>
            
            <div>
                <h2 className="text-2xl font-bold font-heading mb-4">My Active Orders</h2>
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
             {(historicalOrders.length > 0 || historicalContent.length > 0) && (
                <Accordion type="single" collapsible>
                    <AccordionItem value="history">
                        <AccordionTrigger>
                            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                                <History className="w-5 h-5"/>
                                History
                            </h2>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6">
                            {historicalOrders.length > 0 && (
                               <div>
                                 <h3 className="font-semibold mb-2">Completed Orders</h3>
                                 <Card>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Total</TableHead>
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
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                               </div>
                            )}
                             {historicalContent.length > 0 && (
                                <div>
                                 <h3 className="font-semibold mb-2 mt-6">Downloaded Content</h3>
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
                                </div>
                             )}
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
                        This is a <strong className="text-destructive">one-time only</strong> download for this specific purchase. You will not be able to download this file again from the main list. It will move to your history. Please ensure you are on a stable connection and save the file securely.
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

export default function DashboardPage() {
    return (
        <UserDashboard />
    )
}
