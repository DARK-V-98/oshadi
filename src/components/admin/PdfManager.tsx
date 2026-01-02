

'use client';
import { useState } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, UploadCloud, CheckCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type PdfManagerProps = {
  unit: Unit;
};

const PdfUploadRow = ({ unit, language, pdfUrl, pdfFileName, urlFieldName, fileNameFieldName, label }: { unit: Unit; language: 'SI' | 'EN', pdfUrl?: string, pdfFileName?: string, urlFieldName: 'pdfUrlSI' | 'pdfUrlEN', fileNameFieldName: 'pdfFileNameSI' | 'pdfFileNameEN', label: string }) => {
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
        const filePath = `units/${unit.id}/${language}/${file.name}`;
        const storageRef = ref(storage, filePath);
        
        if (pdfUrl) {
            try {
                const oldFileRef = ref(storage, pdfUrl);
                await deleteObject(oldFileRef);
            } catch (error: any) {
                if (error.code !== 'storage/object-not-found') {
                    console.error("Old file deletion failed:", error);
                }
            }
        }
    
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            toast({ title: 'Upload Failed', variant: 'destructive' });
            setIsUploading(false);
            setUploadProgress(null);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const unitDocRef = doc(firestore, 'units', unit.id);
            
            try {
              await updateDoc(unitDocRef, {
                [urlFieldName]: downloadURL,
                [fileNameFieldName]: file.name
              });
              toast({ title: 'Upload Complete', description: `${label} has been updated.` });
            } catch (error) {
              console.error("Firestore update failed:", error);
              toast({ title: 'Database Error', description: 'Could not save file reference.', variant: 'destructive' });
            } finally {
              setIsUploading(false);
              setUploadProgress(null);
              setFile(null);
            }
          }
        );
    };
    
    const handleDelete = async () => {
        if (!storage || !firestore || !pdfUrl) return;

        const fileRef = ref(storage, pdfUrl);
        try {
          await deleteObject(fileRef);
          const unitDocRef = doc(firestore, 'units', unit.id);
          await updateDoc(unitDocRef, {
             [urlFieldName]: null,
             [fileNameFieldName]: null
          }).catch(async (serverError) => {
             const permissionError = new FirestorePermissionError({ path: unitDocRef.path, operation: 'update', requestResourceData: { [urlFieldName]: null, [fileNameFieldName]: null } });
             errorEmitter.emit('permission-error', permissionError);
             throw permissionError;
          });
          toast({ title: 'File Deleted'});
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                const unitDocRef = doc(firestore, 'units', unit.id);
                await updateDoc(unitDocRef, { [urlFieldName]: null, [fileNameFieldName]: null });
                toast({ title: 'File reference removed' });
            } else if (!(error instanceof FirestorePermissionError)){
                toast({ title: 'Deletion Failed', variant: 'destructive' });
            }
        }
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="font-medium">{label}</div>
          <div className="md:col-span-2">
               {pdfUrl ? (
                  <div className="flex items-center justify-between p-2 bg-secondary rounded-md">
                     <div className="flex items-center gap-2 text-sm text-green-700 truncate">
                         <CheckCircle className="w-4 h-4 flex-shrink-0"/>
                         <span className="truncate" title={pdfFileName}>{pdfFileName}</span>
                     </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4"/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the uploaded PDF. This action cannot be undone.</AlertDialogDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage PDFs for {unit.unitNo}</CardTitle>
        <CardDescription>
          Upload a single PDF for each language. This file will be watermarked for 'Notes' downloads and served as-is for 'Assignments' downloads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Sinhala PDF</h3>
            <PdfUploadRow 
                unit={unit} 
                language="SI" 
                pdfUrl={unit.pdfUrlSI}
                pdfFileName={unit.pdfFileNameSI}
                urlFieldName="pdfUrlSI"
                fileNameFieldName="pdfFileNameSI"
                label="Sinhala PDF" 
            />
        </div>
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">English PDF</h3>
             <PdfUploadRow 
                unit={unit} 
                language="EN" 
                pdfUrl={unit.pdfUrlEN}
                pdfFileName={unit.pdfFileNameEN}
                urlFieldName="pdfUrlEN"
                fileNameFieldName="pdfFileNameEN"
                label="English PDF" 
            />
        </div>
      </CardContent>
    </Card>
  );
}
    