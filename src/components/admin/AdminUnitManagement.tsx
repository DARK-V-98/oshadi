
'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Unit, units as allUnits } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface UnitWithId extends Unit {
    id: string;
}

const fixedCategories = [
    { label: 'Bridal Dresser', value: 'bridal-dresser' },
    { label: 'Beauty', value: 'beauty' },
    { label: 'Hair', value: 'hair' },
    { label: 'Extra Notes', value: 'extra-notes' },
];

const AdminUnitManagement = () => {
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Add a unique ID to each unit for key purposes
    const unitsWithId = allUnits.map(unit => ({ ...unit, id: `${unit.category}-${unit.unitNo}` }));
    setUnits(unitsWithId);
    setLoading(false);
  }, []);


  const unitsByCategory = fixedCategories.map(category => ({
      ...category,
      units: units.filter(unit => unit.category === category.value)
  }));

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin">
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-heading mt-4">Unit & PDF Management</h1>
                <p className="text-muted-foreground">Unit data is managed statically in the application code. Please request changes to update modules.</p>
            </div>
            <Button disabled>
                <PlusCircle className="w-4 h-4 mr-2"/>
                Add New Unit (Disabled)
            </Button>
        </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading units...</p>
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={fixedCategories.map(c => c.value)} className="w-full space-y-4">
            {unitsByCategory.map(category => (
                <AccordionItem value={category.value} key={category.value} className="border-none">
                     <AccordionTrigger className="bg-secondary/50 border rounded-lg px-4 py-3 text-lg font-semibold font-heading hover:no-underline">
                        {category.label} ({category.units.length})
                     </AccordionTrigger>
                     <AccordionContent className="pt-4">
                        <div className="space-y-6">
                            {category.units.length > 0 ? category.units.map(unit => (
                                <Card key={unit.id}>
                                <CardHeader className="flex flex-row justify-between items-start">
                                    <div>
                                        <CardTitle>{unit.nameEN} ({unit.unitNo})</CardTitle>
                                        <CardDescription>{unit.nameSI}</CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" disabled>Edit Unit (Disabled)</Button>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">PDF and pricing management for static data is not available. Please request code changes to update unit details.</p>
                                </CardContent>
                                </Card>
                            )) : (
                                <p className="text-center text-muted-foreground py-4">No units in this category.</p>
                            )}
                        </div>
                     </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      )}
    </div>
  );
};

export default AdminUnitManagement;
