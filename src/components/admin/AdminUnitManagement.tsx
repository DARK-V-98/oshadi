'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { useStorage } from '@/firebase/provider';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { units as defaultUnits, Unit } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PdfPart {
  partName: string;
  fileName: string;
  downloadUrl: string;
}

interface UnitWithPdfs extends Unit {
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

  useEffect(() => {
    if (!firestore) return;

    const fetchUnitsData = async () => {
      setLoading(true);
      try {
        const unitsWithPdfs: UnitWithPdfs[] = await Promise.all(defaultUnits.map(async (unit) => {
          const unitDocRef = doc(firestore, 'units', unit.unitNo);
          const docSnap = await getDoc(unitDocRef);
          if (docSnap.exists()) {
            return { ...unit, pdfs: docSnap.data().pdfs || [] };
          }
          return { ...unit, pdfs: [] };
        }));
        setUnits(unitsWithPdfs);
      } catch (error) {
        console.error("Error fetching units data: ", error);
        toast({ title: 'Error loading units', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchUnitsData();
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
      const docSnap = await getDoc(unitDocRef);
      if (docSnap.exists()) {
        await updateDoc(unitDocRef, {
          pdfs: arrayUnion(newPdfPart)
        });
      } else {
        await setDoc(unitDocRef, {
          pdfs: [newPdfPart]
        });
      }

      setUnits(units.map(u => u.unitNo === unitId ? { ...u, pdfs: [...u.pdfs, newPdfPart] } : u));
      setNewPartName(prev => ({...prev, [unitId]: ''}));
      toast({ title: 'Success', description: `${file.name} uploaded and linked to ${unitId}.` });
    } catch (error) {
      console.error("Error uploading file: ", error);
      toast({ title: 'Upload failed', description: 'Could not upload the file.', variant: 'destructive' });
    } finally {
      setUploading(prev => ({ ...prev, [unitId]: false }));
    }
  };
  
  const handleFileDelete = (unitId: string, pdfPart: PdfPart) => {
    // Note: This only removes the reference from Firestore. The file in Storage is not deleted.
    // Implementing Storage file deletion requires careful consideration of security rules.
    if (!firestore) return;
    const unitDocRef = doc(firestore, 'units', unitId);
    
    const updatedPdfs = units.find(u => u.unitNo === unitId)?.pdfs.filter(p => p.downloadUrl !== pdfPart.downloadUrl);

    updateDoc(unitDocRef, { pdfs: updatedPdfs })
      .then(() => {
        setUnits(units.map(u => u.unitNo === unitId ? { ...u, pdfs: updatedPdfs || [] } : u));
        toast({ title: 'PDF reference removed' });
      })
      .catch(error => {
        console.error("Error removing PDF reference: ", error);
        toast({ title: 'Error', description: 'Could not remove PDF reference.', variant: 'destructive' });
      });
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
        </div>

      {loading ? <p>Loading units...</p> : (
        <div className="space-y-6">
          {units.map((unit) => (
            <Card key={unit.unitNo}>
              <CardHeader>
                <CardTitle>{unit.nameEN} ({unit.unitNo})</CardTitle>
                <CardDescription>{unit.nameSI}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unit.pdfs.map((pdf) => (
                    <div key={pdf.fileName} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{pdf.partName}</p>
                          <p className="text-xs text-muted-foreground">{pdf.fileName}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleFileDelete(unit.unitNo, pdf)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 pt-4 border-t">
                     <Input
                        type="text"
                        placeholder="Name for this part (e.g., Part 1)"
                        value={newPartName[unit.unitNo] || ''}
                        onChange={(e) => setNewPartName(prev => ({ ...prev, [unit.unitNo]: e.target.value }))}
                        className="flex-grow"
                      />
                    <div className="relative">
                      <Button asChild variant="outline">
                        <label htmlFor={`file-upload-${unit.unitNo}`} className="cursor-pointer">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add PDF Part
                        </label>
                      </Button>
                      <Input 
                        id={`file-upload-${unit.unitNo}`}
                        type="file" 
                        accept=".pdf" 
                        className="sr-only"
                        onChange={(e) => e.target.files && handleFileUpload(unit.unitNo, e.target.files[0])}
                        disabled={uploading[unit.unitNo]}
                      />
                    </div>
                  </div>
                   {uploading[unit.unitNo] && <p className="text-sm text-muted-foreground">Uploading...</p>}
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
