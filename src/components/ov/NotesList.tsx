
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Search, Unlock, FileText, Loader2, Tag, ShoppingCart, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';

interface UnitWithPdfCount extends Unit {
    pdfCount: number;
}

interface Category {
    id: string;
    label: string;
    value: string;
}

const NotesList = () => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [units, setUnits] = useState<UnitWithPdfCount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [api, setApi] = useState<CarouselApi>()
  const [currentCategoryLabel, setCurrentCategoryLabel] = useState('');

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const unitsRef = collection(firestore, 'units');
    const qUnits = query(unitsRef, orderBy('unitNo'));
    const unsubUnits = onSnapshot(qUnits, (snapshot) => {
        const fetchedUnits = snapshot.docs.map(doc => ({
            unitNo: doc.id,
            nameEN: doc.data().nameEN,
            nameSI: doc.data().nameSI,
            modelCount: doc.data().modelCount,
            category: doc.data().category,
            priceNotes: doc.data().priceNotes,
            priceAssignments: doc.data().priceAssignments,
            pdfCount: (doc.data().pdfs || []).length
        }));
        setUnits(fetchedUnits);
    });

    const categoriesRef = collection(firestore, 'categories');
    const qCategories = query(categoriesRef, orderBy('label'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
        const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
            setCurrentCategoryLabel(fetchedCategories[0].label);
        }
        setLoading(false);
    });

    return () => {
      unsubUnits();
      unsubCategories();
    };
  }, [firestore]);
  
  const onSelect = useCallback((api: CarouselApi) => {
    if (!api || categories.length === 0) return;
    const selectedIndex = api.selectedScrollSnap();
    setCurrentCategoryLabel(categories[selectedIndex]?.label || '');
  }, [api, categories]);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('select', onSelect);
    return () => { api.off('select', onSelect) };
  }, [api, onSelect]);
  
  const getUnitsForCategory = (categoryValue: string) => {
    return units.filter((unit) =>
      unit.category === categoryValue &&
      (unit.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.nameSI && unit.nameSI.includes(searchQuery)) ||
        unit.unitNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleUnlockClick = () => {
      router.push('/dashboard');
      toast({
          title: "Redirecting to Dashboard",
          description: "Please bind your key in the user dashboard to unlock notes.",
      });
  }

  const handleBuyClick = (unitName: string, materialType: 'Notes' | 'Assignments', price: string) => {
    const message = encodeURIComponent(`Hi! I'm interested in buying the *${unitName} - ${materialType}* for LKR ${price}. Can you please provide more information?`);
    window.open(`https://wa.me/94754420805?text=${message}`, '_blank');
  };

  return (
    <section id="notes" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Course Materials</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              {currentCategoryLabel || 'Course Notes'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our complete collection of NVQ Level 4 notes. Purchase a key to unlock and download.
            </p>
          </div>

          <div className="relative flex-1 mb-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {loading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading notes...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                No categories have been created yet. Please add categories in the admin panel.
            </div>
          ) : (
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {categories.map((category) => {
                    const categoryUnits = getUnitsForCategory(category.value);
                    if (searchQuery && categoryUnits.length === 0) return null;
                    return (
                        <CarouselItem key={category.id}>
                            <div className="p-1">
                                <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden animate-fade-in-up">
                                <div className="divide-y divide-border">
                                {categoryUnits.length > 0 ? categoryUnits.map((unit, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-secondary/30 transition-colors duration-300"
                                    >
                                        <div className="md:col-span-2">
                                            <Badge variant="outline">{unit.unitNo}</Badge>
                                        </div>
                                        <div className="md:col-span-4">
                                            <p className="font-medium text-foreground">{unit.nameEN}</p>
                                            <p className="text-sm text-muted-foreground mt-0.5">{unit.nameSI}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {unit.priceNotes && (
                                                    <div className="text-xs inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                                                        <Tag className="w-3 h-3" /> Notes: LKR {unit.priceNotes}
                                                    </div>
                                                )}
                                                {unit.priceAssignments && (
                                                    <div className="text-xs inline-flex items-center gap-1.5 bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                                                        <Tag className="w-3 h-3" /> Assignments: LKR {unit.priceAssignments}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 text-center">
                                            <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-gold/10 text-gold font-semibold text-sm" title={`${unit.pdfCount} PDF parts available`}>
                                                {unit.pdfCount}
                                            </span>
                                        </div>
                                        <div className="md:col-span-4 flex items-center justify-end gap-2 flex-wrap">
                                            {unit.priceNotes && (
                                                <Button variant="hero" size="sm" onClick={() => handleBuyClick(unit.nameEN, 'Notes', unit.priceNotes!)}>
                                                    <ShoppingCart className="w-4 h-4 mr-1.5" /> Buy Notes
                                                </Button>
                                            )}
                                            {unit.priceAssignments && (
                                                <Button variant="elegant" size="sm" onClick={() => handleBuyClick(unit.nameEN, 'Assignments', unit.priceAssignments!)}>
                                                    <ShoppingCart className="w-4 h-4 mr-1.5" /> Buy Assignments
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={handleUnlockClick}>
                                                <Unlock className="w-4 h-4 mr-1" />
                                                Unlock
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <p>No units found in this category{searchQuery && ' matching your search'}.</p>
                                    </div>
                                )}
                                </div>
                                </div>
                            </div>
                        </CarouselItem>
                    )
                })}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] sm:left-[-50px] top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-[-20px] sm:right-[-50px] top-1/2 -translate-y-1/2" />
            </Carousel>
          )}

        </div>
      </div>
    </section>
  );
};

export default NotesList;
