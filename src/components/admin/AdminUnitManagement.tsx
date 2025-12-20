'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { useStorage } from '@/firebase/provider';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, query, orderBy, deleteField, writeBatch, getDocs, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Unit, categories } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
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


interface PdfPart {
  partName: string;
  fileName: string;
  downloadUrl: string;
}

interface UnitWithPdfs extends Unit {
  id: string; // Firestore document ID
  pdfs: PdfPart[];
}

const AdminUnitManagement = () => {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitWithPdfs[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [newPartName, setNewPartName] = useState<Record<string, string>>({});
  
  // State for editing units
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editableUnitData, setEditableUnitData] = useState<Partial<UnitWithPdfs> | null>(null);

  // State for adding a new unit
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<Omit<Unit, 'category' | 'modelCount'> & { category: string; modelCount: string }>({
    unitNo: '',
    nameEN: '',
    nameSI: '',
    modelCount: '',
    category: '',
  });

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    
    const unitsRef = collection(firestore, 'units');
    const q = query(unitsRef, orderBy('unitNo'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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

    return () => unsubscribe();
  }, [firestore, toast]);

  const handleFileUpload = async (unitId: string, file: File) => {
    if (!storage || !firestore || !file) {
      toast({ title: 'Error', description: 'Services not ready.', variant: 'destructive' });
      return;
    }
    
    const partName = newPartName[unitId] || `Part ${Date.now()}`;

    setUploading(prev => ({ ...prev, [unitId]: true }));
    const filePath = `units/${unitId}/${file.name}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      
      const newPdfPart: PdfPart = {
        partName,
        fileName: file.name,
        downloadUrl: filePath,
      };

      const unitDocRef = doc(firestore, 'units', unitId);
      await updateDoc(unitDocRef, {
        pdfs: arrayUnion(newPdfPart)
      });
      
      setNewPartName(prev => ({...prev, [unitId]: ''}));
      toast({ title: 'Success', description: `${file.name} uploaded and linked to ${unitId}.` });
    } catch (error) {
      console.error("Error uploading file: ", error);
      toast({ title: 'Upload failed', description: 'Could not upload the file.', variant: 'destructive' });
    } finally {
      setUploading(prev => ({ ...prev, [unitId]: false }));
    }
  };
  
  const handleFileDelete = async (unitId: string, pdfPartToDelete: PdfPart) => {
    if (!firestore || !storage) return;

    // Show confirmation dialog
    if (!confirm(`Are you sure you want to delete "${pdfPartToDelete.partName}"? This will also delete the file from storage.`)) {
      return;
    }

    const unitDocRef = doc(firestore, 'units', unitId);
    const fileRef = ref(storage, pdfPartToDelete.downloadUrl);

    try {
      // Create a batch to update Firestore and delete from Storage
      const batch = writeBatch(firestore);

      // Remove the PDF part from the 'pdfs' array in the unit document
      batch.update(unitDocRef, {
        pdfs: arrayRemove(pdfPartToDelete)
      });
      
      // Delete the file from Firebase Storage
      await deleteObject(fileRef);

      // Commit the batch
      await batch.commit();

      toast({ title: 'Success', description: `"${pdfPartToDelete.partName}" and its file have been deleted.` });
    } catch (error) {
      console.error("Error deleting PDF: ", error);
      toast({ title: 'Error', description: 'Could not delete the PDF. It may have already been removed.', variant: 'destructive' });
    }
  };

  const startEditing = (unit: UnitWithPdfs) => {
    setEditingUnitId(unit.id);
    setEditableUnitData(unit);
  };

  const cancelEditing = () => {
    setEditingUnitId(null);
    setEditableUnitData(null);
  };

  const handleUnitInputChange = (field: keyof Unit, value: string) => {
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
            pdfs: []
        });

        toast({ title: "Unit Added", description: `Successfully added ${newUnit.nameEN}.`});
        setIsAddUnitDialogOpen(false);
        setNewUnit({ unitNo: '', nameEN: '', nameSI: '', modelCount: '', category: ''});

    } catch (error) {
        console.error("Error adding new unit: ", error);
        toast({ title: "Error", description: "Could not add the new unit.", variant: "destructive" });
    }
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
                        <Input placeholder="Unit No (e.g., Unit 11)" value={newUnit.unitNo} onChange={(e) => setNewUnit({...newUnit, unitNo: e.target.value})}/>
                        <Input placeholder="Unit Name (English)" value={newUnit.nameEN} onChange={(e) => setNewUnit({...newUnit, nameEN: e.target.value})}/>
                        <Input placeholder="Unit Name (Sinhala)" value={newUnit.nameSI} onChange={(e) => setNewUnit({...newUnit, nameSI: e.target.value})}/>
                        <Input placeholder="Model Count" value={newUnit.modelCount} onChange={(e) => setNewUnit({...newUnit, modelCount: e.target.value})}/>
                        <Select onValueChange={(value) => setNewUnit({...newUnit, category: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.filter(c => c.value !== 'all').map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
                        <Input label="Model Count" value={editableUnitData?.modelCount} onChange={(e) => handleUnitInputChange('modelCount', e.target.value)} />
                        <Select value={editableUnitData?.category} onValueChange={(value) => handleUnitInputChange('category', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.filter(c => c.value !== 'all').map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="space-y-4">
                  <h4 className="font-semibold text-muted-foreground">PDF Parts</h4>
                  {unit.pdfs.map((pdf) => (
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
                        placeholder="Name for this part (e.g., Part 1)"
                        value={newPartName[unit.id] || ''}
                        onChange={(e) => setNewPartName(prev => ({ ...prev, [unit.id]: e.target.value }))}
                        className="flex-grow"
                      />
                    <div className="relative">
                      <Button asChild variant="outline">
                        <label htmlFor={`file-upload-${unit.id}`} className="cursor-pointer">
                            {uploading[unit.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                            Add PDF Part
                        </label>
                      </Button>
                      <Input 
                        id={`file-upload-${unit.id}`}
                        type="file" 
                        accept=".pdf" 
                        className="sr-only"
                        onChange={(e) => e.target.files && handleFileUpload(unit.id, e.target.files[0])}
                        disabled={uploading[unit.id]}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUnitManagement;
