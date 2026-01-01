
'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { useStorage } from '@/firebase/provider';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, query, orderBy, writeBatch, arrayRemove, addDoc, getDocs } from 'firebase/firestore';
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
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PdfPart {
  partName: string;
  fileName: string;
  downloadUrl: string;
}

interface UnitWithPdfs extends Unit {
  id: string; // Firestore document ID
  pdfs?: PdfPart[]; // Support old structure for migration
  pdfsEN: PdfPart[];
  pdfsSI: Pdf-Jotain
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

const PdfLanguageManager = ({ unit, language }: { unit: UnitWithPdfs, language: 'EN' | 'SI' }) => {
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [partName, setPartName] = useState('');
    const [uploading, setUploading] = useState(false);
    
    // Check for old data structure and merge into Sinhala PDFs if necessary.
    let pdfs = language === 'EN' ? unit.pdfsEN || [] : unit.pdfsSI || [];
    if (language === 'SI' && unit.pdfs && unit.pdfs.length > 0) {
        pdfs = [...pdfs, ...unit.pdfs];
    }
    const pdfsKey = language === 'EN' ? 'pdfsEN' : 'pdfsSI';
    const languageLabel = language === 'EN' ? 'English' : 'Sinhala';

    const handleFileUpload = async (file: File) => {
        if (!storage || !firestore || !file) {
          toast({ title: 'Error', description: 'Services not ready.', variant: 'destructive' });
          return;
        }
        
        if (!partName.trim()) {
            toast({ title: 'Part Name Required', description: `Please enter a name for the ${languageLabel} PDF part.`, variant: 'destructive' });
            return;
        }
    
        setUploading(true);
        const filePath = `units/${unit.id}/${language}/${file.name}`;
        const fileRef = ref(storage, filePath);
    
        try {
          await uploadBytes(fileRef, file);
          
          const newPdfPart: PdfPart = {
            partName: partName,
            fileName: file.name,
            downloadUrl: filePath,
          };
    
          const unitDocRef = doc(firestore, 'units', unit.id);
          
          // If we are migrating old data, we should also clear the old field
          const updateData: { [key: string]: any } = {
            [pdfsKey]: arrayUnion(newPdfPart)
          };
          if (language === 'SI' && unit.pdfs) {
            updateData.pdfs = []; // Clear old field after migration
          }

          await updateDoc(unitDocRef, updateData);
          
          setPartName('');
          toast({ title: 'Success', description: `${file.name} uploaded to ${languageLabel} PDFs.` });
        } catch (error) {
          console.error("Error uploading file: ", error);
          toast({ title: 'Upload failed', description: 'Could not upload the file.', variant: 'destructive' });
        } finally {
          setUploading(false);
        }
    };

    const handleFileDelete = async (pdfPartToDelete: PdfPart) => {
        if (!firestore || !storage) return;
    
        if (!confirm(`Are you sure you want to delete "${pdfPartToDelete.partName}" from ${languageLabel} PDFs? This will also delete the file from storage.`)) {
          return;
        }
    
        const unitDocRef = doc(firestore, 'units', unit.id);
        const fileRef = ref(storage, pdfPartToDelete.downloadUrl);
    
        try {
          const batch = writeBatch(firestore);
    
          // Check if the file to delete is in the new or old structure
          const inPdfsEN = (unit.pdfsEN || []).some(p => p.downloadUrl === pdfPartToDelete.downloadUrl);
          const inPdfsSI = (unit.pdfsSI || []).some(p => p.downloadUrl === pdfPartToDelete.downloadUrl);
          const inOldPdfs = (unit.pdfs || []).some(p => p.downloadUrl === pdfPartToDelete.downloadUrl);

          if (inPdfsEN) {
             batch.update(unitDocRef, { pdfsEN: arrayRemove(pdfPartToDelete) });
          }
          if (inPdfsSI) {
             batch.update(unitDocRef, { pdfsSI: arrayRemove(pdfPartToDelete) });
          }
          if (inOldPdfs) {
             batch.update(unitDocRef, { pdfs: arrayRemove(pdfPartToDelete) });
          }
          
          await deleteObject(fileRef).catch(e => console.warn("Could not delete from storage, it might be already gone:", e));
    
          await batch.commit();
    
          toast({ title: 'Success', description: `"${pdfPartToDelete.partName}" has been deleted.` });
        } catch (error) {
          console.error("Error deleting PDF: ", error);
          toast({ title: 'Error', description: 'Could not delete the PDF. It may have already been removed.', variant: 'destructive' });
        }
    };
    
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-muted-foreground">{languageLabel} PDF Parts</h4>
        {pdfs.map((pdf) => (
          <div key={pdf.downloadUrl} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{pdf.partName}</p>
                <p className="text-xs text-muted-foreground">{pdf.fileName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleFileDelete(pdf)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-4 pt-4 border-t">
          <Input
            type="text"
            placeholder={`Name for new ${languageLabel} PDF`}
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            className="flex-grow"
          />
          <div className="relative">
            <Button asChild variant="outline">
              <label htmlFor={`file-upload-${unit.id}-${language}`} className="cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                Add PDF
              </label>
            </Button>
            <Input 
              id={`file-upload-${unit.id}-${language}`}
              type="file" 
              accept=".pdf" 
              className="sr-only"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              disabled={uploading}
            />
          </div>
        </div>
      </div>
    );
};


const AdminUnitManagement = () => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitWithPdfs[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editableUnitData, setEditableUnitData] = useState<Partial<UnitWithPdfs> | null>(null);

  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unitNo: '',
    nameEN: '',
    nameSI: '',
    modelCount: '',
    category: '',
    priceNotesSI: '',
    priceAssignmentsSI: '',
    priceNotesEN: '',
    priceAssignmentsEN: '',
  });

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    
    const unitsRef = collection(firestore, 'units');
    const qUnits = query(unitsRef, orderBy('unitNo'));

    const categoriesRef = collection(firestore, 'categories');
    const qCategories = query(categoriesRef, orderBy('label'));

    const unsubscribeUnits = onSnapshot(qUnits, (querySnapshot) => {
      const fetchedUnits: UnitWithPdfs[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          priceNotesSI: data.priceNotesSI ?? data.priceNotes ?? '', // Migration from old field
          priceAssignmentsSI: data.priceAssignmentsSI ?? data.priceAssignments ?? '', // Migration from old field
          ...data,
        } as UnitWithPdfs;
      });
      setUnits(fetchedUnits);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching units data: ", error);
      toast({ title: 'Error loading units', variant: 'destructive' });
      setLoading(false);
    });

    const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });


    return () => {
        unsubscribeUnits();
        unsubscribeCategories();
    };
  }, [firestore, toast]);

  const startEditing = (unit: UnitWithPdfs) => {
    setEditingUnitId(unit.id);
    setEditableUnitData({
        ...unit,
        priceNotesSI: unit.priceNotesSI ?? unit.priceNotes, // handle migration
        priceAssignmentsSI: unit.priceAssignmentsSI ?? unit.priceAssignments, // handle migration
    });
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
        const { id, pdfs, pdfsEN, pdfsSI, priceNotes, priceAssignments, ...dataToSave } = editableUnitData as any;
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
            pdfsEN: [],
            pdfsSI: [],
        });

        toast({ title: "Unit Added", description: `Successfully added ${newUnit.nameEN}.`});
        setIsAddUnitDialogOpen(false);
        setNewUnit({ unitNo: '', nameEN: '', nameSI: '', modelCount: '', category: '', priceNotesSI: '', priceAssignmentsSI: '', priceNotesEN: '', priceAssignmentsEN: '' });

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
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <Input placeholder="Unit No (e.g., Unit-11)" value={newUnit.unitNo} onChange={(e) => setNewUnit({...newUnit, unitNo: e.target.value})}/>
                        <Input placeholder="Unit Name (English)" value={newUnit.nameEN} onChange={(e) => setNewUnit({...newUnit, nameEN: e.target.value})}/>
                        <Input placeholder="Unit Name (Sinhala)" value={newUnit.nameSI} onChange={(e) => setNewUnit({...newUnit, nameSI: e.target.value})}/>
                        <Input placeholder="Model Count" value={newUnit.modelCount} onChange={(e) => setNewUnit({...newUnit, modelCount: e.target.value})}/>
                         <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={newUnit.category} onValueChange={(value) => setNewUnit({...newUnit, category: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                        <Input placeholder="Price for Sinhala Notes (LKR)" value={newUnit.priceNotesSI} onChange={(e) => setNewUnit({...newUnit, priceNotesSI: e.target.value})}/>
                        <Input placeholder="Price for Sinhala Assignments (LKR)" value={newUnit.priceAssignmentsSI} onChange={(e) => setNewUnit({...newUnit, priceAssignmentsSI: e.target.value})}/>
                        <Input placeholder="Price for English Notes (LKR)" value={newUnit.priceNotesEN} onChange={(e) => setNewUnit({...newUnit, priceNotesEN: e.target.value})}/>
                        <Input placeholder="Price for English Assignments (LKR)" value={newUnit.priceAssignmentsEN} onChange={(e) => setNewUnit({...newUnit, priceAssignmentsEN: e.target.value})}/>
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
                        <div className="space-y-2">
                            <Label>Category</Label>
                             <Select value={editableUnitData?.category} onValueChange={(value) => handleUnitInputChange('category', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Sinhala Notes Price (LKR)</Label>
                            <Input value={editableUnitData?.priceNotesSI || ''} onChange={(e) => handleUnitInputChange('priceNotesSI', e.target.value)} />
                        </div>
                        <div>
                            <Label>Sinhala Assignments Price (LKR)</Label>
                            <Input value={editableUnitData?.priceAssignmentsSI || ''} onChange={(e) => handleUnitInputChange('priceAssignmentsSI', e.target.value)} />
                        </div>
                         <div>
                            <Label>English Notes Price (LKR)</Label>
                            <Input value={editableUnitData?.priceNotesEN || ''} onChange={(e) => handleUnitInputChange('priceNotesEN', e.target.value)} />
                        </div>
                        <div>
                            <Label>English Assignments Price (LKR)</Label>
                            <Input value={editableUnitData?.priceAssignmentsEN || ''} onChange={(e) => handleUnitInputChange('priceAssignmentsEN', e.target.value)} />
                        </div>
                    </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                    <PdfLanguageManager unit={unit} language="EN" />
                    <PdfLanguageManager unit={unit} language="SI" />
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
