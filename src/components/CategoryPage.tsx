
'use client';
import { useState, useEffect } from 'react';
import { Unit } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Book, FileArchive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/ov/Navbar';
import Footer from '@/components/ov/Footer';
import AuthForm from './AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface CategoryPageProps {
  categoryValue: Unit['category'];
  categoryName: string;
}

const UnitCard = ({ unit }: { unit: Unit }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<'SI' | 'EN'>('SI');
    const { addToCart } = useCart();
  
    const handleAddToCart = (unit: Unit, type: 'note' | 'assignment', language: 'EN' | 'SI') => {
        const priceStr = type === 'note' 
          ? (language === 'EN' ? unit.priceNotesEN : unit.priceNotesSI)
          : (language === 'EN' ? unit.priceAssignmentsEN : unit.priceAssignmentsSI);
        
        const price = priceStr ? parseFloat(priceStr.replace(/,/g, '')) : 300; // Default price if not set

        if (isNaN(price)) {
            console.error("Invalid price for item:", unit, type, language);
            return;
        }

        addToCart({
            unitId: unit.id, // Use Firestore doc ID
            unitName: unit.nameEN,
            type: type,
            language: language,
            price: price,
        });
    }

    const notePriceSI = unit.priceNotesSI ? `LKR ${unit.priceNotesSI}` : "Add to Cart";
    const assignmentPriceSI = unit.priceAssignmentsSI ? `LKR ${unit.priceAssignmentsSI}` : "Add to Cart";
    const notePriceEN = unit.priceNotesEN ? `LKR ${unit.priceNotesEN}` : "Add to Cart";
    const assignmentPriceEN = unit.priceAssignmentsEN ? `LKR ${unit.priceAssignmentsEN}` : "Add to Cart";

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
                        {selectedLanguage === 'SI' ? (
                            <>
                                <Button size="sm" variant="outline" className="w-full justify-between" onClick={() => handleAddToCart(unit, 'note', 'SI')} disabled={!unit.priceNotesSI}>
                                    <span className="flex items-center gap-2"><Book className="w-4 h-4"/> Notes</span>
                                    <span>{notePriceSI}</span>
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-between" onClick={() => handleAddToCart(unit, 'assignment', 'SI')} disabled={!unit.priceAssignmentsSI}>
                                    <span className="flex items-center gap-2"><FileArchive className="w-4 h-4"/> Assignments</span>
                                    <span>{assignmentPriceSI}</span>
                                </Button>
                            </>
                        ) : (
                             <>
                                <Button size="sm" variant="outline" className="w-full justify-between" onClick={() => handleAddToCart(unit, 'note', 'EN')} disabled={!unit.priceNotesEN}>
                                    <span className="flex items-center gap-2"><Book className="w-4 h-4"/> Notes</span>
                                    <span>{notePriceEN}</span>
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-between" onClick={() => handleAddToCart(unit, 'assignment', 'EN')} disabled={!unit.priceAssignmentsEN}>
                                    <span className="flex items-center gap-2"><FileArchive className="w-4 h-4"/> Assignments</span>
                                    <span>{assignmentPriceEN}</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const CategoryPage = ({ categoryValue, categoryName }: CategoryPageProps) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    const unitsRef = collection(firestore, 'units');
    const q = query(unitsRef, where('category', '==', categoryValue), orderBy('unitNo'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedUnits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        setUnits(fetchedUnits);
        setLoading(false);
    }, (error) => {
        console.error(`Error fetching ${categoryName} units:`, error);
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, [categoryValue, categoryName, firestore]);

  const filteredUnits = units.filter((unit) =>
    unit.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (unit.nameSI && unit.nameSI.includes(searchQuery)) ||
    unit.unitNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-grow">
            <section id="notes" className="py-20 md:py-32 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 animate-fade-in">
                        <span className="text-sm font-medium text-primary uppercase tracking-wider">Course Modules</span>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
                            {categoryName}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                        Browse all available units for the {categoryName} category. Add items to your cart to begin your purchase.
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
                            <p className="ml-4 text-muted-foreground">Loading units...</p>
                        </div>
                    ) : (
                        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden animate-fade-in-up">
                            <div className="divide-y divide-border">
                            {filteredUnits.length > 0 ? filteredUnits.map((unit) => (
                                <UnitCard key={unit.id} unit={unit} />
                            )) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p>No units found{searchQuery && ' matching your search'}.</p>
                                </div>
                            )}
                            </div>
                        </div>
                    )}

                    </div>
                </div>
            </section>
        </main>
        <Footer />
        <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
};

export default CategoryPage;
