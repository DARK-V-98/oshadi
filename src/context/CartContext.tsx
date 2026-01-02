
'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, onSnapshot, writeBatch, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle } from 'lucide-react';


export interface CartItem {
  id: string; // Firestore document ID
  unitId: string;
  unitName: string;
  type: 'note' | 'assignment';
  language: 'EN' | 'SI';
  price: number;
  quantity: number;
}

interface OrderConfirmation {
    orderId: string;
    totalPrice: number;
    itemsSummary: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  addMultipleToCart: (items: Omit<CartItem, 'id' | 'quantity'>[]) => Promise<void>;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  loading: boolean;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  const fetchCartAndUnlockedItems = useCallback(() => {
    if (!user || !firestore) {
      setCart([]);
      setUnlockedItems([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const cartRef = collection(firestore, 'users', user.uid, 'cart');
    const unsubCart = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
      setCart(items);
    }, (error) => {
        console.error("Error fetching cart: ", error);
        toast({ title: "Error", description: "Could not load your shopping cart.", variant: "destructive" });
    });

    const unlockedRef = collection(firestore, 'userUnlockedPdfs');
    const qUnlocked = query(unlockedRef, where('userId', '==', user.uid));
    const unsubUnlocked = onSnapshot(qUnlocked, (snapshot) => {
        const unlocked = snapshot.docs.map(doc => {
            const data = doc.data();
            return `${data.unitId}-${data.type}-${data.language}`;
        });
        setUnlockedItems(unlocked);
    }, (error) => {
        console.error("Error fetching unlocked items: ", error);
    });
    
    Promise.all([new Promise(res => onSnapshot(cartRef, res)), new Promise(res => onSnapshot(qUnlocked, res))]).then(() => {
        setLoading(false);
    });

    return () => {
        unsubCart();
        unsubUnlocked();
    };
  }, [user, firestore, toast]);

  useEffect(() => {
    const unsubscribe = fetchCartAndUnlockedItems();
    return () => {
        if(unsubscribe) unsubscribe();
    };
  }, [fetchCartAndUnlockedItems]);

  const addToCart = async (item: Omit<CartItem, 'id' | 'quantity'>) => {
    if (!user || !firestore) {
      toast({ title: 'Please Log In', description: 'You must be logged in to add items to your cart.', variant: 'destructive' });
      return;
    }

    const itemIdentifier = `${item.unitId}-${item.type}-${item.language}`;
    
    const existingItemInCart = cart.find(cartItem => 
        cartItem.unitId === item.unitId &&
        cartItem.type === item.type &&
        cartItem.language === item.language
    );

    if (existingItemInCart) {
        toast({ title: 'Already in Cart', description: 'This item is already in your shopping cart.'});
        return;
    }

    if (unlockedItems.includes(itemIdentifier)) {
        toast({ title: 'Already Owned', description: 'You have already purchased this item.'});
    }

    try {
      const cartRef = collection(firestore, 'users', user.uid, 'cart');
      await addDoc(cartRef, { ...item, quantity: 1 });
      toast({ title: 'Added to Cart', description: `${item.unitName} (${item.language} ${item.type}) has been added.`});
    } catch (error) {
      console.error('Error adding to cart: ', error);
      toast({ title: 'Error', description: 'Could not add item to cart.', variant: 'destructive' });
    }
  };

  const addMultipleToCart = async (items: Omit<CartItem, 'id' | 'quantity'>[]) => {
    if (!user || !firestore) {
      toast({ title: 'Please Log In', description: 'You must be logged in to add items.', variant: 'destructive' });
      return;
    }
    
    const cartRef = collection(firestore, 'users', user.uid, 'cart');
    const batch = writeBatch(firestore);
    let itemsAddedCount = 0;

    items.forEach(item => {
        const itemIdentifier = `${item.unitId}-${item.type}-${item.language}`;
        const isAlreadyInCart = cart.some(cartItem => 
            cartItem.unitId === item.unitId &&
            cartItem.type === item.type &&
            cartItem.language === item.language
        );
        const isAlreadyOwned = unlockedItems.includes(itemIdentifier);
        
        if (!isAlreadyInCart && !isAlreadyOwned) {
            const docRef = doc(cartRef);
            batch.set(docRef, { ...item, quantity: 1 });
            itemsAddedCount++;
        }
    });
    
    if (itemsAddedCount > 0) {
        await batch.commit();
        toast({ title: 'Items Added', description: `${itemsAddedCount} new item(s) added to your cart.` });
    } else {
        toast({ title: 'No New Items', description: 'All selected items are already in your cart or owned.' });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user || !firestore) return;
    const itemDocRef = doc(firestore, 'users', user.uid, 'cart', itemId);
    try {
        await deleteDoc(itemDocRef);
    } catch (error) {
        console.error("Error removing from cart: ", error);
        toast({ title: "Error", description: "Could not remove item from cart.", variant: "destructive"});
    }
  };

  const clearCart = async () => {
    if (!user || !firestore || cart.length === 0) return;
    const cartRef = collection(firestore, 'users', user.uid, 'cart');
    const q = query(cartRef);
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(firestore);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
  };
  
  const checkout = async () => {
    if (!user || !firestore || cart.length === 0) return;
    
    const ordersRef = collection(firestore, 'orders');
    const newOrderData = {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        items: cart,
        totalPrice: cart.reduce((total, item) => total + item.price, 0),
        status: 'pending',
        createdAt: serverTimestamp(),
    };

    try {
        const orderDocRef = await addDoc(ordersRef, newOrderData);
        await updateDoc(orderDocRef, { status: 'pending payment' });
        
        const itemsSummary = cart.map(item => `- ${item.unitName} (${item.language} ${item.type})`).join('\n');
        setOrderConfirmation({
            orderId: orderDocRef.id,
            totalPrice: newOrderData.totalPrice,
            itemsSummary: itemsSummary
        });
        
        await clearCart();
        toast({ title: 'Order Placed!', description: 'Please complete the payment step.'});
    } catch (error) {
        console.error('Error placing order: ', error);
        toast({ title: 'Error', description: 'Could not place your order.', variant: 'destructive'});
    }
  };

  const handleWhatsAppContact = () => {
      if (!orderConfirmation) return;
      const { orderId, totalPrice, itemsSummary } = orderConfirmation;
      const message = `Hi Oshadi, I've placed an order.\n\nOrder ID: ${orderId}\n\nItems:\n${itemsSummary}\n\nTotal: LKR ${totalPrice.toFixed(2)}\n\nPlease provide payment details.`;
      const whatsappUrl = `https://wa.me/94754420805?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setOrderConfirmation(null);
  }

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, addMultipleToCart, removeFromCart, clearCart, checkout, loading, itemCount, totalPrice }}>
      {children}
      {orderConfirmation && (
        <AlertDialog open={!!orderConfirmation} onOpenChange={() => setOrderConfirmation(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><CheckCircle className="w-6 h-6 text-green-500" />Order Placed Successfully!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your Order ID is <strong className="font-mono text-primary">{orderConfirmation.orderId}</strong>. To complete your purchase, please contact us on WhatsApp with your order details to arrange payment.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setOrderConfirmation(null)}>Close</Button>
                    <Button onClick={handleWhatsAppContact}>
                        <MessageCircle className="w-4 h-4 mr-2"/>
                        Contact on WhatsApp to Pay
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
