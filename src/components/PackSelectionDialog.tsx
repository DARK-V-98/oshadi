
'use client';
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Unit } from "@/lib/data";
import { Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

type Pack = {
  name: string;
  price: string;
  type: 'note' | 'assignment';
  limit: number;
}

type PackSelectionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryValue: Unit['category'];
  categoryName: string;
  language: 'SI' | 'EN';
  pack: Pack;
};

export default function PackSelectionDialog({ isOpen, onClose, categoryValue, categoryName, language, pack }: PackSelectionDialogProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const { toast } = useToast();
  const { addMultipleToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!firestore || !isOpen) return;

    const fetchUnits = async () => {
      setLoading(true);
      const unitsRef = collection(firestore, 'units');
      const q = query(unitsRef, where('category', '==', categoryValue), where('enabled', '==', true), orderBy('unitNo'));

      const querySnapshot = await getDocs(q);
      const fetchedUnits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit)).filter(unit => {
          if (language === 'SI') {
              return pack.type === 'note' ? unit.notesSIEnabled : unit.assignmentsSIEnabled;
          } else {
              return pack.type === 'note' ? unit.notesENEnabled : unit.assignmentsENEnabled;
          }
      });
      setUnits(fetchedUnits);
      setLoading(false);
    };

    fetchUnits();
  }, [firestore, isOpen, categoryValue, language, pack.type]);

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnits(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      }
      if (prev.length < pack.limit) {
        return [...prev, unitId];
      }
      toast({
          variant: "destructive",
          title: "Limit Reached",
          description: `You can only select up to ${pack.limit} item(s) for this pack.`
      });
      return prev;
    });
  };

  const handleAddToCart = async () => {
      if (selectedUnits.length !== pack.limit && pack.limit > 1) {
          toast({ variant: 'destructive', title: `Please select exactly ${pack.limit} items.`});
          return;
      }

      setIsAdding(true);
      const itemsToAdd = units
        .filter(unit => selectedUnits.includes(unit.id))
        .map(unit => {
            const priceStr = pack.type === 'note' 
                ? (language === 'EN' ? unit.priceNotesEN : unit.priceNotesSI)
                : (language === 'EN' ? unit.priceAssignmentsEN : unit.priceAssignmentsSI);
            const price = pack.limit === 1 ? parseFloat(priceStr.replace(/,/g, '')) : (parseFloat(pack.price.replace(/,/g, '')) / pack.limit);
            
            return {
                unitId: unit.id,
                unitName: unit.nameEN,
                type: pack.type,
                language: language,
                price: price,
            };
      });

      await addMultipleToCart(itemsToAdd);
      setIsAdding(false);
      onClose();
  };

  const isSelectionComplete = selectedUnits.length === pack.limit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select {pack.name} for {categoryName} ({language})</DialogTitle>
          <DialogDescription>
            Choose {pack.limit} {pack.type}(s) from the list below.
            Selected: {selectedUnits.length} / {pack.limit}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-72">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {units.map(unit => (
                  <div key={unit.id} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-secondary/50">
                    <Checkbox
                      id={unit.id}
                      checked={selectedUnits.includes(unit.id)}
                      onCheckedChange={() => handleSelectUnit(unit.id)}
                      disabled={!selectedUnits.includes(unit.id) && selectedUnits.length >= pack.limit}
                    />
                    <label htmlFor={unit.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {unit.unitNo} - {unit.nameEN}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddToCart} disabled={isAdding || (pack.limit > 1 && !isSelectionComplete)}>
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <ShoppingCart className="w-4 h-4 mr-2"/>}
            Add to Cart (Rs. {pack.price})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

