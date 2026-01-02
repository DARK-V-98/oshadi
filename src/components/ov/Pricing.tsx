
'use client';
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFirestore } from "@/firebase";
import { Unit } from "@/lib/data";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import PackSelectionDialog from "@/components/PackSelectionDialog";

const pricingData = {
  sinhala: {
    title: "Sinhala Medium Packages",
    medium: "SI",
    categories: [
      { name: "Bridal Dresser", categoryValue: "bridal-dresser", packs: [ { name: "Full Note Pack (20)", price: "5,800", type: "note", limit: 20, full: true }, { name: "Full Assignment Pack (20)", price: "7,800", type: "assignment", limit: 20, full: true } ], single: [ { name: "Note", price: "300", type: "note", limit: 1 }, { name: "Assignment", price: "400", type: "assignment", limit: 1 }, { name: "Note 3", price: "800", type: "note", limit: 3 }, { name: "Assignment 3", price: "1,100", type: "assignment", limit: 3 }, { name: "Note 5", price: "1,400", type: "note", limit: 5 }, { name: "Assignment 5", price: "1,800", type: "assignment", limit: 5 } ] },
      { name: "Beauty", categoryValue: "beauty", packs: [ { name: "Full Note Pack (12)", price: "3,500", type: "note", limit: 12, full: true }, { name: "Full Assignment Pack (12)", price: "4,700", type: "assignment", limit: 12, full: true } ], single: [ { name: "Note", price: "300", type: "note", limit: 1 }, { name: "Assignment", price: "400", type: "assignment", limit: 1 }, { name: "Note 3", price: "800", type: "note", limit: 3 }, { name: "Assignment 3", price: "1,100", type: "assignment", limit: 3 }, { name: "Note 5", price: "1,400", type: "note", limit: 5 }, { name: "Assignment 5", price: "1,800", type: "assignment", limit: 5 } ] },
      { name: "Hair Dresser", categoryValue: "hair", packs: [ { name: "Full Note Pack (17)", price: "5,000", type: "note", limit: 17, full: true }, { name: "Full Assignment Pack (17)", price: "6,600", type: "assignment", limit: 17, full: true } ], single: [ { name: "Note", price: "300", type: "note", limit: 1 }, { name: "Assignment", price: "400", type: "assignment", limit: 1 }, { name: "Note 3", price: "800", type: "note", limit: 3 }, { name: "Assignment 3", price: "1,100", type: "assignment", limit: 3 }, { name: "Note 5", price: "1,400", type: "note", limit: 5 }, { name: "Assignment 5", price: "1,800", type: "assignment", limit: 5 } ] }
    ]
  },
  english: {
    title: "English Medium Packages",
    medium: "EN",
    categories: [
      { name: "Bridal Dresser", categoryValue: "bridal-dresser", packs: [ { name: "Full Note Pack (20)", price: "7,800", type: "note", limit: 20, full: true }, { name: "Full Assignment Pack (20)", price: "9,800", type: "assignment", limit: 20, full: true } ], single: [ { name: "Note", price: "400", type: "note", limit: 1 }, { name: "Assignment", price: "500", type: "assignment", limit: 1 }, { name: "Note 3", price: "1,100", type: "note", limit: 3 }, { name: "Assignment 3", price: "1,400", type: "assignment", limit: 3 }, { name: "Note 5", price: "1,900", type: "note", limit: 5 }, { name: "Assignment 5", price: "2,400", type: "assignment", limit: 5 } ] },
      { name: "Beauty", categoryValue: "beauty", packs: [ { name: "Full Note Pack (12)", price: "4,600", type: "note", limit: 12, full: true }, { name: "Full Assignment Pack (12)", price: "5,700", type: "assignment", limit: 12, full: true } ], single: [ { name: "Note", price: "400", type: "note", limit: 1 }, { name: "Assignment", price: "500", type: "assignment", limit: 1 }, { name: "Note 3", price: "1,100", type: "note", limit: 3 }, { name: "Assignment 3", price: "1,400", type: "assignment", limit: 3 }, { name: "Note 5", price: "1,900", type: "note", limit: 5 }, { name: "Assignment 5", price: "2,400", type: "assignment", limit: 5 } ] },
      { name: "Hair Dresser", categoryValue: "hair", packs: [ { name: "Full Note Pack (17)", price: "6,600", type: "note", limit: 17, full: true }, { name: "Full Assignment Pack (17)", price: "8,300", type: "assignment", limit: 17, full: true } ], single: [ { name: "Note", price: "400", type: "note", limit: 1 }, { name: "Assignment", price: "500", type: "assignment", limit: 1 }, { name: "Note 3", price: "1,100", type: "note", limit: 3 }, { name: "Assignment 3", price: "1,400", type: "assignment", limit: 3 }, { name: "Note 5", price: "1,900", type: "note", limit: 5 }, { name: "Assignment 5", price: "2,400", type: "assignment", limit: 5 } ] }
    ]
  }
};

type Pack = {
  name: string;
  price: string;
  type: 'note' | 'assignment';
  limit: number;
  full?: boolean;
}

type DialogState = {
  open: boolean;
  categoryValue: Unit['category'];
  categoryName: string;
  language: 'SI' | 'EN';
  pack: Pack;
} | null;


const Pricing = () => {
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const firestore = useFirestore();
  const { addMultipleToCart } = useCart();
  const { toast } = useToast();
  
  const handleBuyFullPack = async (categoryValue: Unit['category'], categoryName: string, pack: Pack, language: 'SI' | 'EN') => {
      if (!firestore) return;
      toast({ title: "Please wait...", description: `Adding all ${language} ${pack.type}s for ${categoryName} to your cart.`});

      const unitsRef = collection(firestore, 'units');
      const q = query(unitsRef, where('category', '==', categoryValue), where('enabled', '==', true), orderBy('unitNo'));

      const querySnapshot = await getDocs(q);
      const units = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));

      const itemsToAdd = units.filter(unit => {
        if (language === 'SI') {
            return pack.type === 'note' ? unit.notesSIEnabled : unit.assignmentsSIEnabled;
        } else {
            return pack.type === 'note' ? unit.notesENEnabled : unit.assignmentsENEnabled;
        }
      }).map(unit => {
        const priceStr = pack.type === 'note' 
          ? (language === 'EN' ? unit.priceNotesEN : unit.priceNotesSI)
          : (language === 'EN' ? unit.priceAssignmentsEN : unit.priceAssignmentsSI);
        const price = priceStr ? parseFloat(priceStr.replace(/,/g, '')) : 0;
        return { unitId: unit.id, unitName: unit.nameEN, type: pack.type, language, price };
      });
      
      await addMultipleToCart(itemsToAdd);
      toast({ title: "Success!", description: "Full pack has been added to your cart." });
  };
  
  const handleSelectPartialPack = (categoryValue: Unit['category'], categoryName: string, pack: Pack, language: 'SI' | 'EN') => {
      setDialogState({
          open: true,
          categoryValue,
          categoryName,
          language,
          pack,
      });
  };

  const renderCategory = (category: any, medium: string, mediumKey: 'SI' | 'EN') => (
    <div key={category.name} className="bg-card border rounded-2xl p-6 shadow-card">
      <h4 className="font-heading text-2xl font-bold text-center mb-6">{category.name}</h4>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {category.packs.map((pack: Pack) => (
          <div key={pack.name} className="relative p-6 rounded-2xl border transition-all duration-300 animate-fade-in-up bg-gradient-to-br from-primary/5 via-rose-gold-light/10 to-champagne/10 border-primary/30 shadow-soft">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-soft">
                  <Sparkles className="w-4 h-4" />
                  Full Pack
                </span>
              </div>
              <div className="text-center mb-4 pt-4">
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">{pack.name}</h3>
              </div>
              <div className="text-center mb-6">
                <span className="font-heading text-4xl font-bold text-foreground">Rs. {pack.price}</span>
              </div>
              <Button
                onClick={() => handleBuyFullPack(category.categoryValue, category.name, pack, mediumKey)}
                variant="hero"
                size="lg"
                className="w-full"
              >
                Add to Cart
              </Button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {category.single.map((item: Pack) => (
            <div key={item.name} className="p-4 rounded-xl bg-background border text-center">
                <h5 className="font-heading text-lg font-semibold">{item.name}</h5>
                <p className="text-xl font-bold text-primary my-2">Rs. {item.price}</p>
                <Button
                    onClick={() => handleSelectPartialPack(category.categoryValue, category.name, item, mediumKey)}
                    size="sm"
                    variant="outline"
                >
                    {item.limit > 1 ? 'Select' : 'Add to Cart'}
                </Button>
            </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Flexible options to fit your study needs and budget.
            </p>
          </div>

          {/* Medium Sections */}
          {Object.entries(pricingData).map(([key, mediumData]) => (
            <div key={key} className="mb-20">
                <h3 className="font-heading text-3xl md:text-4xl font-bold text-center mb-10 text-gradient-rose">{mediumData.title}</h3>
                <div className="grid lg:grid-cols-1 gap-8">
                    {mediumData.categories.map(category => renderCategory(category, mediumData.title, mediumData.medium as 'SI' | 'EN'))}
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
     {dialogState && (
        <PackSelectionDialog 
            isOpen={dialogState.open}
            onClose={() => setDialogState(null)}
            categoryName={dialogState.categoryName}
            categoryValue={dialogState.categoryValue}
            language={dialogState.language}
            pack={dialogState.pack}
        />
     )}
    </>
  );
};

export default Pricing;
