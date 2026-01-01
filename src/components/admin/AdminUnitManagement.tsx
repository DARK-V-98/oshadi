
'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { useStorage } from '@/firebase/provider';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, query, orderBy, writeBatch, arrayRemove, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, PlusCircle, ArrowLeft, Edit, Save, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Label } from '../ui/label';

interface PdfPart {
  partName: string;
  fileName: string;
  downloadUrl: string;
}

interface UnitWithPdfs extends Unit {
  id: string; // Firestore document ID
  pdfs: PdfPart[];
}

interface Category {
    id: string;
    value: string;
    label: string;
}

const AdminUnitManagement = () => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitWithPdfs[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for editing units
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editableUnitData, setEditableUnitData] = useState<Partial<UnitWithPdfs> | null>(null);

  // State for adding a new unit
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<Omit<Unit, 'category' | 'modelCount' | 'priceNotes' | 'priceAssignments'> & { category: string; modelCount: string; priceNotes: string; priceAssignments: string }>({
    unitNo: '',
    nameEN: '',
    nameSI: '',
    modelCount: '',
    category: '',
    priceNotes: '',
    priceAssignments: '',
  });

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    
    const unitsRef = collection(firestore, 'units');
    const qUnits = query(unitsRef, orderBy('unitNo'));

    const categoriesRef = collection(firestore, 'categories');
    const qCategories = query(categoriesRef, orderBy('label'));

    const unsubscribeUnits = onSnapshot(qUnits, (querySnapshot) => {
      const fetchedUnits: UnitWithPdfs[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as UnitWithPdfs));
      setUnits(fetchedUnits);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching units data: ", error);
      toast({ title: 'Error loading units', variant: 'destructive' });
      setLoading(false);
    });

    const unsubscribeCategories = onSnapshot(qCategories, (querySnapshot) => {
        const fetchedCategories: Category[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Category));
        setCategories(fetchedCategories);
    });

    return () => {
        unsubscribeUnits();
        unsubscribeCategories();
    };
  }, [firestore, toast]);

  const startEditing = (unit: UnitWithPdfs) => {
    setEditingUnitId(unit.id);
    setEditableUnitData(unit);
  };

  const cancelEditing = () => {
    setEditingUnitId(null);
    setEditableUnitData(null);
  };

  const handleUnitInputChange = (field: keyof UnitWithPdfs, value: string) => {
    if (editableUnitData) {
      setEditableUnitData({ ...editableUnitData, [field]: value });
    }
  };

  const handleSaveUnit = async () => {
    if (!firestore || !editableUnitData || !editingUnitId) return;

    const unitDocRef = doc(firestore, 'units', editingUnitId);
    try {
        const { id, pdfs, ...dataToSave } = editableUnitData;
        await updateDoc(unitDocRef, dataToSave);
        toast({ title: "Unit Updated", description: "Your changes have been saved." });
        cancelEditing();
    } catch (error) {
        console.error("Error updating unit: ", error);
        toast({ title: "Error", description: "Could not save unit changes.", variant: "destructive" });
    }
  };

  const handleAddNewUnit = async () => {
    if (!firestore) return;
    if (!newUnit.unitNo || !newUnit.nameEN || !newUnit.category) {
        toast({title: "Missing Fields", description: "Unit No, Name, and Category are required.", variant: "destructive"});
        return;
    }

    const newUnitDocRef = doc(firestore, 'units', newUnit.unitNo);
    try {
        const docSnap = await getDoc(newUnitDocRef);
        if (docSnap.exists()) {
            toast({ title: "Error", description: "A unit with this ID already exists.", variant: "destructive"});
            return;
        }

        await setDoc(newUnitDocRef, {
            ...newUnit,
            pdfs: [],
        });

        toast({ title: "Unit Added", description: `Successfully added ${newUnit.nameEN}.`});
        setIsAddUnitDialogOpen(false);
        setNewUnit({ unitNo: '', nameEN: '', nameSI: '', modelCount: '', category: '', priceNotes: '', priceAssignments: ''});

    } catch (error) {
        console.error("Error adding new unit: ", error);
        toast({ title: "Error", description: "Could not add the new unit.", variant: "destructive" });
    }
  };

  const PdfPartManager = ({ unit }: { unit: UnitWithPdfs }) => {
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [partName, setPartName] = useState(''); // Local state for input
    const [uploading, setUploading] = useState(false);
    const pdfs = unit.pdfs || [];

    const handleFileUpload = async (unitId: string, file: File) => {
        if (!storage || !firestore || !file) {
          toast({ title: 'Error', description: 'Services not ready.', variant: 'destructive' });
          return;
        }
        
        if (!partName.trim()) {
            toast({ title: 'Part Name Required', description: 'Please enter a name for the PDF part.', variant: 'destructive' });
            return;
        }
    
        setUploading(true);
        const filePath = `units/${unitId}/${file.name}`;
        const fileRef = ref(storage, filePath);
    
        try {
          await uploadBytes(fileRef, file);
          
          const newPdfPart: PdfPart = {
            partName: partName,
            fileName: file.name,
            downloadUrl: filePath,
          };
    
          const unitDocRef = doc(firestore, 'units', unitId);
          await updateDoc(unitDocRef, {
            pdfs: arrayUnion(newPdfPart)
          });
          
          setPartName(''); // Clear input after successful upload
          toast({ title: 'Success', description: `${file.name} uploaded.` });
        } catch (error) {
          console.error("Error uploading file: ", error);
          toast({ title: 'Upload failed', description: 'Could not upload the file.', variant: 'destructive' });
        } finally {
          setUploading(false);
        }
    };

    const handleFileDelete = async (unitId: string, pdfPartToDelete: PdfPart) => {
        if (!firestore || !storage) return;
    
        if (!confirm(`Are you sure you want to delete "${pdfPartToDelete.partName}"? This will also delete the file from storage.`)) {
          return;
        }
    
        const unitDocRef = doc(firestore, 'units', unitId);
        const fileRef = ref(storage, pdfPartToDelete.downloadUrl);
    
        try {
          const batch = writeBatch(firestore);
    
          batch.update(unitDocRef, {
            pdfs: arrayRemove(pdfPartToDelete)
          });
          
          await deleteObject(fileRef);
    
          await batch.commit();
    
          toast({ title: 'Success', description: `"${pdfPartToDelete.partName}" and its file have been deleted.` });
        } catch (error) {
          console.error("Error deleting PDF: ", error);
          toast({ title: 'Error', description: 'Could not delete the PDF. It may have already been removed.', variant: 'destructive' });
        }
    };
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-muted-foreground">PDF Parts</h4>
        {pdfs.map((pdf) => (
          <div key={pdf.fileName} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{pdf.partName}</p>
                <p className="text-xs text-muted-foreground">{pdf.fileName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleFileDelete(unit.id, pdf)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-4 pt-4 border-t">
          <Input
            type="text"
            placeholder="Name for new PDF part"
            value={partName} // Use local state here
            onChange={(e) => setPartName(e.target.value)} // Update local state
            className="flex-grow"
          />
          <div className="relative">
            <Button asChild variant="outline">
              <label htmlFor={`file-upload-${unit.id}`} className="cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                Add PDF
              </label>
            </Button>
            <Input 
              id={`file-upload-${unit.id}`}
              type="file" 
              accept=".pdf" 
              className="sr-only"
              onChange={(e) => e.target.files && handleFileUpload(unit.id, e.target.files[0])}
              disabled={uploading}
            />
          </div>
        </div>
      </div>
    );
  };


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
                <p className="text-muted-foreground">Upload and manage PDF files for each course unit.</p>
            </div>
            <Dialog open={isAddUnitDialogOpen} onOpenChange={setIsAddUnitDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="w-4 h-4 mr-2"/>
                        Add New Unit
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a New Unit</DialogTitle>
                        <DialogDescription>Fill in the details for the new unit.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Unit No (e.g., Unit-11)" value={newUnit.unitNo} onChange={(e) => setNewUnit({...newUnit, unitNo: e.target.value})}/>
                        <Input placeholder="Unit Name (English)" value={newUnit.nameEN} onChange={(e) => setNewUnit({...newUnit, nameEN: e.target.value})}/>
                        <Input placeholder="Unit Name (Sinhala)" value={newUnit.nameSI} onChange={(e) => setNewUnit({...newUnit, nameSI: e.target.value})}/>
                        <Input placeholder="Model Count" value={newUnit.modelCount} onChange={(e) => setNewUnit({...newUnit, modelCount: e.target.value})}/>
                        <Input placeholder="Price for Notes (LKR)" value={newUnit.priceNotes} onChange={(e) => setNewUnit({...newUnit, priceNotes: e.target.value})}/>
                        <Input placeholder="Price for Assignments (LKR)" value={newUnit.priceAssignments} onChange={(e) => setNewUnit({...newUnit, priceAssignments: e.target.value})}/>
                        <Select value={newUnit.category} onValueChange={(value) => setNewUnit({...newUnit, category: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddUnitDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddNewUnit}>Add Unit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading units...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {units.map((unit) => (
            <Card key={unit.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  {editingUnitId === unit.id ? (
                    <Input value={editableUnitData?.nameEN} onChange={(e) => handleUnitInputChange('nameEN', e.target.value)} className="text-xl font-bold" />
                  ) : (
                    <CardTitle>{unit.nameEN} ({unit.id})</CardTitle>
                  )}
                  {editingUnitId === unit.id ? (
                    <Input value={editableUnitData?.nameSI} onChange={(e) => handleUnitInputChange('nameSI', e.target.value)} className="mt-2" />
                  ) : (
                    <CardDescription>{unit.nameSI}</CardDescription>
                  )}
                </div>
                <div>
                    {editingUnitId === unit.id ? (
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveUnit}><Save className="w-4 h-4 mr-2"/>Save</Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditing}><X className="w-4 h-4 mr-2"/>Cancel</Button>
                        </div>
                    ) : (
                        <Button size="sm" variant="outline" onClick={() => startEditing(unit)}><Edit className="w-4 h-4 mr-2"/>Edit Unit</Button>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                {editingUnitId === unit.id && (
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label>Model Count</Label>
                            <Input value={editableUnitData?.modelCount} onChange={(e) => handleUnitInputChange('modelCount', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                             <Label>Category</Label>
                            <Select value={editableUnitData?.category} onValueChange={(value) => handleUnitInputChange('category', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Notes Price (LKR)</Label>
                            <Input value={editableUnitData?.priceNotes || ''} onChange={(e) => handleUnitInputChange('priceNotes', e.target.value)} />
                        </div>
                        <div>
                            <Label>Assignments Price (LKR)</Label>
                            <Input value={editableUnitData?.priceAssignments || ''} onChange={(e) => handleUnitInputChange('priceAssignments', e.target.value)} />
                        </div>
                    </div>
                )}
                <PdfPartManager unit={unit} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUnitManagement;
