
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ov/Navbar";
import Footer from "@/components/ov/Footer";
import AuthForm from "@/components/AuthForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore } from "@/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Unit } from "@/lib/data";
import { Loader2 } from "lucide-react";

const fixedCategories = [
    { label: 'Bridal Dresser', value: 'bridal-dresser' },
    { label: 'Beauty', value: 'beauty' },
    { label: 'Hair', value: 'hair' },
    { label: 'Extra Notes', value: 'extra-notes' },
];

const SyllabusTable = ({ modules }: { modules: Unit[]}) => (
    <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[150px]">Module Code</TableHead>
                <TableHead>Module Name (English)</TableHead>
                <TableHead>Module Name (Sinhala)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {modules.map((mod) => (
                    <TableRow key={mod.id}>
                        <TableCell className="font-medium">{mod.unitNo}</TableCell>
                        <TableCell>{mod.nameEN}</TableCell>
                        <TableCell>{mod.nameSI}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

const SyllabusPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    const unitsRef = collection(firestore, 'units');
    const q = query(unitsRef, orderBy('category'), orderBy('unitNo'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedUnits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        setUnits(fetchedUnits);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching units:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const unitsByCategory = fixedCategories.map(category => ({
    ...category,
    units: units.filter(unit => unit.category === category.value)
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-grow pt-20">
            <section className="py-20 md:py-32 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 animate-fade-in">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">Course Content</span>
                            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
                                Full Syllabus Overview
                            </h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Here is a complete list of all modules available for our NVQ Level 4 courses.
                            </p>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="ml-3 text-muted-foreground">Loading syllabus...</p>
                            </div>
                        ) : (
                            <Accordion type="multiple" defaultValue={fixedCategories.map(c => c.value)} className="w-full space-y-6">
                                {unitsByCategory.map(category => category.units.length > 0 && (
                                    <AccordionItem value={category.value} key={category.value} className="bg-card border rounded-2xl p-2 md:p-4">
                                        <AccordionTrigger className="text-xl md:text-2xl font-bold font-heading hover:no-underline px-4">{category.label}</AccordionTrigger>
                                        <AccordionContent className="p-4">
                                            <SyllabusTable modules={category.units} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
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

export default SyllabusPage;
