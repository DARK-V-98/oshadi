
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, History, ShoppingBag } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/context/CartContext';


interface Order {
    id: string;
    items: CartItem[];
    totalPrice: number;
    status: 'pending' | 'processing' | 'completed' | 'pending payment';
    createdAt: { toDate: () => Date };
    contentUnlocked?: boolean;
}

function OrdersDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user || !firestore) return;

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
        unsubscribeOrders();
    };
  }, [user, firestore, toast]);

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'pending payment': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    const { activeOrders, historicalOrders } = useMemo(() => {
        const active: Order[] = [];
        const historical: Order[] = [];
        orders.forEach(order => {
            if (order.status === 'completed') {
                historical.push(order);
            } else {
                active.push(order);
            }
        });
        return { activeOrders: active, historicalOrders: historical };
    }, [orders]);


  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
        <div>
            <h1 className="text-3xl font-bold font-heading mb-2">My Orders</h1>
            <p className="text-muted-foreground">Manage and track your orders.</p>
        </div>

        {loadingOrders ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading your orders...</p>
            </div>
        ) : (
            <>
                <div>
                    <h2 className="text-2xl font-bold font-heading mb-4">My Active Orders</h2>
                    {activeOrders.length > 0 ? (
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
                        <AccordionItem value="history">
                            <AccordionTrigger>
                                <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                                    <History className="w-5 h-5"/>
                                    Completed Order History
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
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                 )}
            </>
        )}
    </div>
  );
}

export default function OrdersPage() {
    return <OrdersDashboardPage />
}
