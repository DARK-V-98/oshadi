
'use client';
import { useState } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, UploadCloud, File as FileIcon, Trash2, CheckCircle } from 'lucide-react';
import { Label } from '../ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

type PdfManagerProps = {
  unit: Unit;
};

interface PdfInfo {
    partName: 'note' | 'assignment';
    fileName: string;
    downloadUrl: string;
}

const PdfUploadRow = ({ unit, language, pdf, partType, label }: { unit: Unit; language: 'SI' | 'EN', pdf?: PdfInfo, partType: 'note' | 'assignment', label: string }) => {
    const storage = useStorage();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    };
  
    const handleUpload = async () => {
      if (!file || !storage || !firestore) return;
  
      setIsUploading(true);
      setUploadProgress(0);
      const filePath = `units/${unit.id}/${language}/${partType}/${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast({ title: 'Upload Failed', description: 'Could not upload the file.', variant: 'destructive' });
          setIsUploading(false);
          setUploadProgress(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const unitDocRef = doc(firestore, 'units', unit.id);
          const pdfInfo: PdfInfo = {
              partName: partType,
              fileName: file.name,
              downloadUrl: downloadURL,
          };
          const fieldToUpdate = language === 'SI' ? 'pdfsSI' : 'pdfsEN';

          await updateDoc(unitDocRef, {
            [fieldToUpdate]: arrayUnion(pdfInfo)
          });

          toast({ title: 'Upload Complete', description: `${label} has been uploaded.` });
          setIsUploading(false);
          setUploadProgress(null);
          setFile(null);
          // Note: We don't have a way to refresh the parent's unit state here easily
          // A full page refresh or re-fetching logic would be needed.
          // For now, the UI will update on next load.
        }
      );
    };
    
    const handleDelete = async () => {
        if(!storage || !firestore || !pdf) return;

        const fileRef = ref(storage, pdf.downloadUrl);
        try {
          await deleteObject(fileRef);
          const unitDocRef = doc(firestore, 'units', unit.id);
          const fieldToUpdate = language === 'SI' ? 'pdfsSI' : 'pdfsEN';
          await updateDoc(unitDocRef, {
             [fieldToUpdate]: arrayRemove(pdf)
          });
          toast({ title: 'File Deleted', description: `The ${label} PDF has been deleted.`});
        } catch (error: any) {
            console.error("Error deleting file:", error);
            if (error.code === 'storage/object-not-found') {
                const unitDocRef = doc(firestore, 'units', unit.id);
                const fieldToUpdate = language === 'SI' ? 'pdfsSI' : 'pdfsEN';
                await updateDoc(unitDocRef, {
                    [fieldToUpdate]: arrayRemove(pdf)
                });
                toast({ title: 'File reference removed', description: `The storage file was not found, but the database reference for ${label} has been cleaned up.`});
            } else {
                toast({ title: 'Deletion Failed', description: 'Could not delete the file.', variant: 'destructive' });
            }
        }
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="font-medium">{label}</div>
          <div className="md:col-span-2">
               {pdf ? (
                  <div className="flex items-center justify-between p-2 bg-secondary rounded-md">
                     <div className="flex items-center gap-2 text-sm text-green-700 truncate">
                         <CheckCircle className="w-4 h-4 flex-shrink-0"/>
                         <span className="truncate" title={pdf.fileName}>{pdf.fileName}</span>
                     </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4"/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the uploaded PDF file for {label}. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
              ) : (
                  <div className="space-y-2">
                      <div className="flex gap-2">
                          <Input type="file" accept=".pdf" onChange={handleFileChange} className="flex-grow"/>
                          <Button onClick={handleUpload} disabled={!file || isUploading}>
                              {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4"/>}
                          </Button>
                      </div>
                      {uploadProgress !== null && (
                          <div className="flex items-center gap-2">
                              <Progress value={uploadProgress} className="w-full" />
                              <span className="text-xs">{Math.round(uploadProgress)}%</span>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    );
};


export default function PdfManager({ unit }: PdfManagerProps) {
  if (!unit) return null;

  const pdfsSI = Array.isArray(unit.pdfsSI) ? unit.pdfsSI : [];
  const pdfsEN = Array.isArray(unit.pdfsEN) ? unit.pdfsEN : [];

  const noteSIPdf = pdfsSI.find(p => p.partName === 'note');
  const assignmentSIPdf = pdfsSI.find(p => p.partName === 'assignment');
  const noteENPdf = pdfsEN.find(p => p.partName === 'note');
  const assignmentENPdf = pdfsEN.find(p => p.partName === 'assignment');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage PDFs for {unit.unitNo}</CardTitle>
        <CardDescription>Upload, replace, or remove PDF files for notes and assignments in both languages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Sinhala PDFs</h3>
            <PdfUploadRow unit={unit} language="SI" partType="note" pdf={noteSIPdf} label="Notes (SI)" />
            <PdfUploadRow unit={unit} language="SI" partType="assignment" pdf={assignmentSIPdf} label="Assignments (SI)" />
        </div>
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">English PDFs</h3>
            <PdfUploadRow unit={unit} language="EN" partType="note" pdf={noteENPdf} label="Notes (EN)" />
            <PdfUploadRow unit={unit} language="EN" partType="assignment" pdf={assignmentENPdf} label="Assignments (EN)" />
        </div>
      </CardContent>
    </Card>
  );
}
