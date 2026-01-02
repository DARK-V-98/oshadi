
'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CartItem } from '@/context/CartContext';

interface Order {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    items: CartItem[];
    totalPrice: number;
    status: 'pending' | 'processing' | 'completed' | 'pending payment';
    createdAt: { toDate: () => Date };
    contentUnlocked?: boolean;
}

const AdminOrderManagement = () => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(fetchedOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            toast({ title: "Error", description: "Could not load orders.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, toast]);
    
    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        if (!firestore) return;
        
        const orderDocRef = doc(firestore, 'orders', orderId);
        
        try {
            await updateDoc(orderDocRef, { status: newStatus });
            
            toast({ title: "Status Updated", description: `Order status changed to ${newStatus}.` });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!firestore) return;
        
        const orderDocRef = doc(firestore, 'orders', orderId);
        try {
            await deleteDoc(orderDocRef);
            toast({ title: "Order Deleted", description: "The order has been successfully deleted." });
        } catch (error) {
            console.error("Error deleting order:", error);
            toast({ title: "Error", description: "Failed to delete the order.", variant: "destructive" });
        }
    };

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
        <div>
             <div className="flex justify-between items-center mb-8">
                <div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin">
                            <ArrowLeft className="w-4 h-4 mr-2"/>
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-heading mt-4">Order Management</h1>
                    <p className="text-muted-foreground">View and manage all customer orders.</p>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                {loading ? (
                     <div className="space-y-2 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                     </div>
                ) : orders.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Info</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-mono text-xs text-muted-foreground">{order.id}</div>
                                        <div>{order.createdAt.toDate().toLocaleString()}</div>
                                        <ul className="text-sm list-disc pl-5 mt-2">
                                            {order.items.map(item => (
                                                <li key={item.id}>{item.unitName} - {item.language} {item.type}</li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                    <TableCell>
                                        <div>{order.userName}</div>
                                        <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                                    </TableCell>
                                    <TableCell>LKR {order.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell className="w-[180px]">
                                        <Select value={order.status} onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}>
                                            <SelectTrigger className={getStatusColor(order.status)}>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="pending payment">Pending Payment</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the order.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center p-8">
                        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4"/>
                        <p className="text-muted-foreground">No orders have been placed yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminOrderManagement;
