
'use client';
import { useState, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch, getDocs, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Unit, mockUnits } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, ArrowLeft, Loader2, Edit, Trash2, XCircle, File as FileIcon, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Switch } from '@/components/ui/switch';


const fixedCategories = [
    { label: 'Bridal Dresser', value: 'bridal-dresser' },
    { label: 'Beauty', value: 'beauty' },
    { label: 'Hair', value: 'hair' },
    { label: 'Extra Notes', value: 'extra-notes' },
];

const UnitForm = ({ unit, onSave, onCancel }: { unit?: Unit | null, onSave: () => void, onCancel: () => void }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Unit>>({
        unitNo: unit?.unitNo || '',
        nameEN: unit?.nameEN || '',
        nameSI: unit?.nameSI || '',
        category: unit?.category || 'bridal-dresser',
        priceNotesSI: unit?.priceNotesSI || '',
        priceAssignmentsSI: unit?.priceAssignmentsSI || '',
        priceNotesEN: unit?.priceNotesEN || '',
        priceAssignmentsEN: unit?.priceAssignmentsEN || '',
        enabled: unit?.enabled ?? true,
        notesSIEnabled: unit?.notesSIEnabled ?? true,
        assignmentsSIEnabled: unit?.assignmentsSIEnabled ?? true,
        notesENEnabled: unit?.notesENEnabled ?? true,
        assignmentsENEnabled: unit?.assignmentsENEnabled ?? true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        setIsSubmitting(true);

        try {
            if (unit?.id) {
                const unitDocRef = doc(firestore, 'units', unit.id);
                await updateDoc(unitDocRef, formData).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                      path: unitDocRef.path,
                      operation: 'update',
                      requestResourceData: formData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw permissionError;
                });
                toast({ title: "Unit Updated", description: `${formData.nameEN} has been updated.` });
            } else {
                const unitsRef = collection(firestore, 'units');
                await addDoc(unitsRef, formData).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                      path: unitsRef.path,
                      operation: 'create',
                      requestResourceData: formData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw permissionError;
                });
                toast({ title: "Unit Added", description: `${formData.nameEN} has been created.` });
            }
            onSave();
        } catch (error) {
            if (!(error instanceof FirestorePermissionError)) {
                console.error("Error saving unit:", error);
                toast({ title: "Save failed", variant: "destructive" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{unit?.id ? 'Edit Unit' : 'Add New Unit'}</CardTitle>
                    <CardDescription>Fill in the details for the course unit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch id="enabled" checked={formData.enabled} onCheckedChange={checked => setFormData({...formData, enabled: checked})}/>
                        <Label htmlFor="enabled">Unit Enabled</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div><Label htmlFor="unitNo">Unit No</Label><Input id="unitNo" value={formData.unitNo} onChange={e => setFormData({...formData, unitNo: e.target.value})} required/></div>
                         <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as Unit['category']})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                {fixedCategories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                    <div><Label htmlFor="nameEN">Name (English)</Label><Input id="nameEN" value={formData.nameEN} onChange={e => setFormData({...formData, nameEN: e.target.value})} required/></div>
                    <div><Label htmlFor="nameSI">Name (Sinhala)</Label><Input id="nameSI" value={formData.nameSI} onChange={e => setFormData({...formData, nameSI: e.target.value})} required/></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div className="space-y-2">
                           <Label>Price Notes (SI)</Label>
                           <Input value={formData.priceNotesSI} onChange={e => setFormData({...formData, priceNotesSI: e.target.value})} />
                           <div className="flex items-center space-x-2"><Switch id="notesSIEnabled" checked={formData.notesSIEnabled} onCheckedChange={c => setFormData({...formData, notesSIEnabled: c})} /><Label htmlFor="notesSIEnabled">Enabled</Label></div>
                        </div>
                         <div className="space-y-2">
                           <Label>Price Assignments (SI)</Label>
                           <Input value={formData.priceAssignmentsSI} onChange={e => setFormData({...formData, priceAssignmentsSI: e.target.value})} />
                           <div className="flex items-center space-x-2"><Switch id="assignmentsSIEnabled" checked={formData.assignmentsSIEnabled} onCheckedChange={c => setFormData({...formData, assignmentsSIEnabled: c})} /><Label htmlFor="assignmentsSIEnabled">Enabled</Label></div>
                        </div>
                         <div className="space-y-2">
                           <Label>Price Notes (EN)</Label>
                           <Input value={formData.priceNotesEN} onChange={e => setFormData({...formData, priceNotesEN: e.target.value})} />
                           <div className="flex items-center space-x-2"><Switch id="notesENEnabled" checked={formData.notesENEnabled} onCheckedChange={c => setFormData({...formData, notesENEnabled: c})} /><Label htmlFor="notesENEnabled">Enabled</Label></div>
                        </div>
                         <div className="space-y-2">
                           <Label>Price Assignments (EN)</Label>
                           <Input value={formData.priceAssignmentsEN} onChange={e => setFormData({...formData, priceAssignmentsEN: e.target.value})} />
                           <div className="flex items-center space-x-2"><Switch id="assignmentsENEnabled" checked={formData.assignmentsENEnabled} onCheckedChange={c => setFormData({...formData, assignmentsENEnabled: c})} /><Label htmlFor="assignmentsENEnabled">Enabled</Label></div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Unit'}</Button>
                </CardFooter>
            </form>
        </Card>
    )
}


const AdminUnitManagement = () => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null | undefined>(undefined); // undefined for closed, null for new, object for edit

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
            toast({ title: "Error", description: "Could not load units.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, toast]);
    
    const handleSeedDatabase = async () => {
        if (!firestore) return;
        setIsSeeding(true);

        try {
            const unitsRef = collection(firestore, 'units');
            const existingUnitsSnapshot = await getDocs(query(unitsRef));
            const existingUnitNos = new Set(existingUnitsSnapshot.docs.map(doc => `${doc.data().unitNo}_${doc.data().category}`));
            
            const batch = writeBatch(firestore);
            let unitsAdded = 0;

            mockUnits.forEach(unit => {
                const uniqueId = `${unit.unitNo}_${unit.category}`;
                if (!existingUnitNos.has(uniqueId)) {
                    const newUnitRef = doc(unitsRef);
                    batch.set(newUnitRef, {
                        ...unit,
                        enabled: true,
                        notesSIEnabled: true,
                        assignmentsSIEnabled: true,
                        notesENEnabled: true,
                        assignmentsENEnabled: true,
                    });
                    unitsAdded++;
                }
            });

            if (unitsAdded > 0) {
                await batch.commit();
                toast({ title: "Database Seeded", description: `${unitsAdded} new units have been added.` });
            } else {
                toast({ title: "Database Up-to-date", description: "No new units to add." });
            }
        } catch (error) {
            console.error("Error seeding database:", error);
            toast({ title: "Seeding Failed", variant: "destructive" });
        } finally {
            setIsSeeding(false);
        }
    };


    const handleDeleteUnit = async (unit: Unit) => {
        if (!firestore || !unit.id) return;

        try {
            await deleteDoc(doc(firestore, 'units', unit.id)).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: doc(firestore, 'units', unit.id).path,
                  operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
                throw permissionError;
            });

            toast({ title: 'Unit Deleted', description: `${unit.nameEN} has been deleted.` });
        } catch (error) {
            if (!(error instanceof FirestorePermissionError)) {
                console.error('Error deleting unit: ', error);
                toast({ title: 'Error', description: 'Could not delete unit.', variant: 'destructive' });
            }
        }
    };

    const unitsByCategory = fixedCategories.map(category => ({
        ...category,
        units: units.filter(unit => unit.category === category.value)
    }));
    
    if (editingUnit !== undefined) {
        return <UnitForm unit={editingUnit} onSave={() => setEditingUnit(undefined)} onCancel={() => setEditingUnit(undefined)} />
    }

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
                    <p className="text-muted-foreground">Add, edit, or delete course units and their associated PDFs.</p>
                </div>
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="secondary" disabled={isSeeding}>
                                <UploadCloud className="w-4 h-4 mr-2"/>
                                Seed Database
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Seed the database?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will upload the predefined list of units to Firestore. It will not overwrite existing units with the same Unit No. and category.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSeedDatabase}>
                                    {isSeeding ? <Loader2 className="w-4 h-4 animate-spin"/> : "Seed"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => setEditingUnit(null)}>
                        <PlusCircle className="w-4 h-4 mr-2"/>
                        Add New Unit
                    </Button>
                </div>
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
                                        <Card key={unit.id} className={!unit.enabled ? "bg-muted/50" : ""}>
                                            <CardHeader className="flex flex-row justify-between items-start">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">{unit.nameEN} ({unit.unitNo}) <span className={`w-3 h-3 rounded-full ${unit.enabled ? 'bg-green-500' : 'bg-red-500'}`}></span></CardTitle>
                                                    <CardDescription>{unit.nameSI}</CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => setEditingUnit(unit)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 mr-2"/>Delete</Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this unit? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteUnit(unit)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </CardHeader>
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
