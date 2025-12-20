'use client';
import { useState } from "react";
import { Search, Eye, Unlock, FileText, Filter, Key, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { units, categories } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"


const AdminUnitList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isKeyCopied, setIsKeyCopied] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.nameSI.includes(searchQuery) ||
      unit.unitNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || unit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generateKey = async (unitId: string) => {
    if (!firestore) {
        toast({ title: "Error", description: "Firestore not initialized.", variant: "destructive" });
        return;
    }

    const key = `OV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const keyData = {
        key,
        unitId: unitId,
        status: 'available',
        createdAt: serverTimestamp(),
        boundTo: null,
        boundAt: null,
    };

    const keysCollection = collection(firestore, 'accessKeys');
    
    addDoc(keysCollection, keyData)
        .then(() => {
            setGeneratedKey(key);
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: keysCollection.path,
                operation: 'create',
                requestResourceData: keyData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const copyKeyToClipboard = () => {
    if (generatedKey) {
        navigator.clipboard.writeText(generatedKey);
        setIsKeyCopied(true);
        setTimeout(() => setIsKeyCopied(false), 2000);
        toast({ title: "Copied!", description: "Access key copied to clipboard." });
    }
  };


  return (
    <>
    <section id="units" className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Manage Units & Keys
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Generate one-time access keys for your PDF notes.
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
                <SelectTrigger className="w-[180px] h-12">
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
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-secondary/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-2">Unit No</div>
              <div className="col-span-7">Unit Name (EN/SIN)</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            <div className="divide-y divide-border">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <div
                    key={unit.unitNo}
                    className="grid md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-secondary/30 transition-colors duration-300"
                  >
                    <div className="md:col-span-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        {unit.unitNo}
                      </span>
                    </div>
                    <div className="md:col-span-7">
                      <p className="font-medium text-foreground">{unit.nameEN}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{unit.nameSI}</p>
                    </div>
                    <div className="md:col-span-3 flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => generateKey(unit.unitNo)}>
                        <Key className="w-4 h-4 mr-1" />
                        Generate Key
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

    <Dialog open={!!generatedKey} onOpenChange={(isOpen) => !isOpen && setGeneratedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Key Generated</DialogTitle>
            <DialogDescription>
              Share this one-time key with your customer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input value={generatedKey || ''} readOnly className="font-mono text-lg" />
            <Button variant="outline" size="icon" onClick={copyKeyToClipboard}>
              {isKeyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
    </Dialog>
    </>
  );
};

export default AdminUnitList;
