
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
import { Search, Unlock, FileText, Loader2, Tag, ShoppingCart, Folder, Languages, Book, FileArchive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface UnitWithPdfCount extends Unit {
    pdfsENCount: number;
    pdfsSICount: number;
    priceNotesEN?: string;
    priceAssignmentsEN?: string;
    priceNotesSI?: string;
    priceAssignmentsSI?: string;
}

interface Category {
    id: string;
    label: string;
    value: string;
}

const UnitCard = ({ unit }: { unit: UnitWithPdfCount }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<'SI' | 'EN'>('SI');
    const { toast } = useToast();
    const { addToCart } = useCart();
  
    const handleAddToCart = (unit: UnitWithPdfCount, type: 'note' | 'assignment', language: 'EN' | 'SI') => {
        const priceStr = type === 'note' 
          ? (language === 'EN' ? unit.priceNotesEN : unit.priceNotesSI)
          : (language === 'EN' ? unit.priceAssignmentsEN : unit.priceAssignmentsSI);
        
        if (!priceStr) {
            toast({title: "Not for sale", description: "This item is not currently available for purchase.", variant: "destructive"});
            return;
        }
        
        const price = parseFloat(priceStr);
        if (isNaN(price)) {
          toast({title: "Price error", description: "Invalid price format for this item.", variant: "destructive"});
          return;
        }
        
        addToCart({
            unitId: unit.unitNo,
            unitName: unit.nameEN,
            type: type,
            language: language,
            price: price,
        });
    }

    const notePrice = selectedLanguage === 'SI' ? unit.priceNotesSI : unit.priceNotesEN;
    const assignmentPrice = selectedLanguage === 'SI' ? unit.priceAssignmentsSI : unit.priceAssignmentsEN;

    return (
        <div className="p-4 md:p-5 hover:bg-secondary/30 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                    <Badge variant="outline">{unit.unitNo}</Badge>
                    <p className="font-medium text-foreground mt-2">{unit.nameEN}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{unit.nameSI}</p>
                </div>
                <div className="md:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-1">
                        <Button 
                            variant={selectedLanguage === 'SI' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedLanguage('SI')}>
                            Sinhala
                        </Button>
                        <Button 
                            variant={selectedLanguage === 'EN' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedLanguage('EN')}>
                            English
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {notePrice && (
                             <Button size="sm" variant="outline" className="w-full justify-between" onClick={() => handleAddToCart(unit, 'note', selectedLanguage)}>
                                <span className="flex items-center gap-2"><Book className="w-4 h-4"/> Notes</span>
                                <span>LKR {notePrice}</span>
                             </Button>
                        )}
                        {assignmentPrice && (
                             <Button size="sm" variant="outline" className="w-full justify-between" onClick={() => handleAddToCart(unit, 'assignment', selectedLanguage)}>
                                <span className="flex items-center gap-2"><FileArchive className="w-4 h-4"/> Assignments</span>
                                <span>LKR {assignmentPrice}</span>
                             </Button>
                        )}
                         {!notePrice && !assignmentPrice && (
                            <p className="text-xs text-center text-muted-foreground p-2">No items available for purchase in {selectedLanguage === 'SI' ? 'Sinhala' : 'English'}.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const NotesList = () => {
  const firestore = useFirestore();
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
        const fetchedUnits = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                unitNo: doc.id,
                nameEN: data.nameEN,
                nameSI: data.nameSI,
                modelCount: data.modelCount,
                category: data.category,
                priceNotesSI: data.priceNotesSI ?? data.priceNotes, // Migration
                priceAssignmentsSI: data.priceAssignmentsSI ?? data.priceAssignments, // Migration
                priceNotesEN: data.priceNotesEN,
                priceAssignmentsEN: data.priceAssignmentsEN,
                pdfsENCount: (data.pdfsEN || []).length,
                pdfsSICount: (data.pdfsSI || []).length,
            };
        });
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
  
  const onSelect = useCallback(() => {
    if (!api || categories.length === 0) return;
    const selectedIndex = api.selectedScrollSnap();
    setCurrentCategoryLabel(categories[selectedIndex]?.label || '');
  }, [api, categories]);

  useEffect(() => {
    if (!api) return;
    onSelect();
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
              Browse our complete collection of NVQ Level 4 notes. Add items to your cart to begin your purchase.
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
                                    <UnitCard key={index} unit={unit} />
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
