
'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, onSnapshot, writeBatch, query, where, getDocs, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string; // Firestore document ID
  unitId: string;
  unitName: string;
  type: 'note' | 'assignment';
  language: 'EN' | 'SI';
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
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
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(() => {
    if (!user || !firestore) {
      setCart([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const cartRef = collection(firestore, 'users', user.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
      setCart(items);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching cart: ", error);
        toast({ title: "Error", description: "Could not load your shopping cart.", variant: "destructive" });
        setLoading(false);
    });

    return unsubscribe;
  }, [user, firestore, toast]);

  useEffect(() => {
    const unsubscribe = fetchCart();
    return () => {
        if(unsubscribe) unsubscribe();
    };
  }, [fetchCart]);

  const addToCart = async (item: Omit<CartItem, 'id' | 'quantity'>) => {
    if (!user || !firestore) {
      toast({ title: 'Please Log In', description: 'You must be logged in to add items to your cart.', variant: 'destructive' });
      return;
    }

    const cartRef = collection(firestore, 'users', user.uid, 'cart');
    
    // Check if item already exists
    const existingItem = cart.find(cartItem => 
        cartItem.unitId === item.unitId &&
        cartItem.type === item.type &&
        cartItem.language === item.language
    );

    if (existingItem) {
        toast({ title: 'Already in Cart', description: 'This item is already in your shopping cart.'});
        return;
    }

    try {
      await addDoc(cartRef, { ...item, quantity: 1 });
      toast({ title: 'Added to Cart', description: `${item.unitName} (${item.language} ${item.type}) has been added.`});
    } catch (error) {
      console.error('Error adding to cart: ', error);
      toast({ title: 'Error', description: 'Could not add item to cart.', variant: 'destructive' });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user || !firestore) return;
    const itemDocRef = doc(firestore, 'users', user.uid, 'cart', itemId);
    try {
        await deleteDoc(itemDocRef);
    } catch (error) {
        console.error("Error removing from cart: ", error);
        toast({ title: "Error", description: "Could not remove item from cart.", variant: 'destructive'});
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
    const newOrder = {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        items: cart,
        totalPrice: cart.reduce((total, item) => total + item.price, 0),
        status: 'pending',
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(ordersRef, newOrder);
        await clearCart();
        toast({ title: 'Order Placed!', description: 'Your order has been received. You will be contacted for payment.'});
    } catch (error) {
        console.error('Error placing order: ', error);
        toast({ title: 'Error', description: 'Could not place your order.', variant: 'destructive'});
    }
  };

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, checkout, loading, itemCount, totalPrice }}>
      {children}
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
