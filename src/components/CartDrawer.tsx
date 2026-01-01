
'use client';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick: () => void;
};

export default function CartDrawer({ open, onOpenChange, onLoginClick }: CartDrawerProps) {
  const { user } = useUser();
  const { cart, removeFromCart, checkout, loading, totalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await checkout();
    setIsCheckingOut(false);
    onOpenChange(false);
  }

  const handleLoginAndCheckout = () => {
      onOpenChange(false);
      onLoginClick();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" /> Your Shopping Cart
          </SheetTitle>
        </SheetHeader>
        {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
            {cart.map((item) => (
              <div key={item.id} className="flex items-start justify-between py-4">
                <div className="flex-1 pr-4">
                  <p className="font-semibold">{item.unitName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.language} {item.type}
                  </p>
                  <p className="text-sm font-medium">LKR {item.price.toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <SheetFooter className="mt-auto border-t pt-6">
            <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>LKR {totalPrice.toFixed(2)}</span>
                </div>
                {user ? (
                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                        {isCheckingOut ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Processing...</> : 'Proceed to Checkout'}
                    </Button>
                ) : (
                    <Button className="w-full" size="lg" onClick={handleLoginAndCheckout}>
                        Login to Checkout
                    </Button>
                )}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
