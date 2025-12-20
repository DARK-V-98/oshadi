'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Unlock, FileText, Filter, Loader2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UnitWithPdfCount extends Unit {
    pdfCount: number;
}

interface Category {
  id: string;
  value: string;
  label: string;
}

const NotesList = () => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [units, setUnits] = useState<UnitWithPdfCount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const unitsRef = collection(firestore, 'units');
    const q = query(unitsRef, orderBy('unitNo'));

    const unsubscribeUnits = onSnapshot(q, (snapshot) => {
        const unitsFromDb: UnitWithPdfCount[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                unitNo: doc.id,
                nameEN: data.nameEN,
                nameSI: data.nameSI,
                modelCount: data.modelCount,
                category: data.category,
                price: data.price,
                pdfCount: (data.pdfs || []).length
            };
        });
        setUnits(unitsFromDb);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching units:", error);
        toast({
          title: "Error",
          description: "Could not load the available notes.",
          variant: "destructive",
        });
        setLoading(false);
    });

    const categoriesRef = collection(firestore, 'categories');
    const qCategories = query(categoriesRef, orderBy('label'));
    const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
      const fetchedCategories: Category[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
      } as Category));
      setCategories([{ id: 'all', value: 'all', label: 'All Units' }, ...fetchedCategories]);
    });

    return () => {
      unsubscribeUnits();
      unsubscribeCategories();
    };
  }, [firestore, toast]);
  
  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.nameSI && unit.nameSI.includes(searchQuery)) ||
      unit.unitNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || unit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUnlockClick = () => {
      router.push('/dashboard');
      toast({
          title: "Redirecting to Dashboard",
          description: "Please bind your key in the user dashboard to unlock notes.",
      });
  }

  const handleBuyClick = () => {
    const message = encodeURIComponent("Hi! I'm interested in buying the NVQ Level 4 notes. Can you please provide more information?");
    window.open(`https://wa.me/94754420805?text=${message}`, '_blank');
  };

  return (
    <section id="notes" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Course Materials</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Available Notes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our complete collection of NVQ Level 4 notes. Purchase a key to unlock and download.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-12">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredUnits.length} of {units.length} units
          </p>

          {/* Units Table */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-secondary/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-2">Unit No</div>
              <div className="col-span-3">Unit Name (EN/SIN)</div>
              <div className="col-span-2 text-center">PDF Parts</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Loading notes...</p>
                </div>
              ) : filteredUnits.length > 0 ? (
                filteredUnits.map((unit, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-secondary/30 transition-colors duration-300"
                  >
                    {/* Unit Number */}
                    <div className="md:col-span-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        {unit.unitNo}
                      </span>
                    </div>

                    {/* Unit Name */}
                    <div className="md:col-span-3">
                      <p className="font-medium text-foreground">{unit.nameEN}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{unit.nameSI}</p>
                    </div>

                    {/* PDF Count */}
                    <div className="md:col-span-2 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-gold/10 text-gold font-semibold text-sm">
                        {unit.pdfCount}
                      </span>
                    </div>

                     {/* Price */}
                     <div className="md:col-span-2 text-center">
                        <span className="inline-flex items-center justify-center px-3 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                           <Tag className="w-4 h-4 mr-1.5" />
                           {unit.price ? `LKR ${unit.price}` : 'N/A'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex items-center justify-end gap-2">
                      <Button variant="hero" size="sm" onClick={handleBuyClick}>
                        Buy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleUnlockClick}>
                        <Unlock className="w-4 h-4 mr-1" />
                        Unlock
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No units found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotesList;
