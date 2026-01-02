
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
import { Loader2, UploadCloud, File as FileIcon, Trash2, CheckCircle } from 'lucide-react';

type PdfManagerProps = {
  unit: Unit;
};

type FileType = 'notesSI' | 'assignmentsSI' | 'notesEN' | 'assignmentsEN';
type PdfField = 'pdfUrlNotesSI' | 'pdfUrlAssignmentsSI' | 'pdfUrlNotesEN' | 'pdfUrlAssignmentsEN';

const fileTypeToFieldMapping: Record<FileType, PdfField> = {
  notesSI: 'pdfUrlNotesSI',
  assignmentsSI: 'pdfUrlAssignmentsSI',
  notesEN: 'pdfUrlNotesEN',
  assignmentsEN: 'pdfUrlAssignmentsEN',
};

const PdfUploadRow = ({ unit, fileType, label }: { unit: Unit, fileType: FileType, label: string }) => {
  const storage = useStorage();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fieldName = fileTypeToFieldMapping[fileType];
  const existingFileUrl = unit[fieldName];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file || !storage || !firestore) return;

    setIsUploading(true);
    setUploadProgress(0);
    const filePath = `units/${unit.id}/${fileType}/${file.name}`;
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
        await updateDoc(unitDocRef, { [fieldName]: downloadURL, [`${fileType}FileName`]: file.name });
        toast({ title: 'Upload Complete', description: `${label} has been uploaded.` });
        setIsUploading(false);
        setUploadProgress(null);
        setFile(null);
      }
    );
  };
  
  const handleDelete = async () => {
      if(!storage || !firestore || !existingFileUrl) return;

      if (!confirm(`Are you sure you want to delete the current ${label} PDF? This action cannot be undone.`)) return;

      const fileRef = ref(storage, existingFileUrl);
      try {
        await deleteObject(fileRef);
        const unitDocRef = doc(firestore, 'units', unit.id);
        await updateDoc(unitDocRef, { [fieldName]: null, [`${fileType}FileName`]: null });
        toast({ title: 'File Deleted', description: `The ${label} PDF has been deleted.`});
      } catch (error) {
        console.error("Error deleting file:", error);
        toast({ title: 'Deletion Failed', description: 'Could not delete the file. It might already be removed.', variant: 'destructive' });
      }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="font-medium">{label}</div>
        <div className="md:col-span-2">
             {existingFileUrl ? (
                <div className="flex items-center justify-between p-2 bg-secondary rounded-md">
                   <div className="flex items-center gap-2 text-sm text-green-700">
                       <CheckCircle className="w-4 h-4"/>
                       <span>File is uploaded.</span>
                   </div>
                   <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2"/>Remove</Button>
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
        <CardDescription>Upload, replace, or remove PDF files for notes and assignments in both languages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Sinhala PDFs</h3>
            <PdfUploadRow unit={unit} fileType="notesSI" label="Notes (SI)" />
            <PdfUploadRow unit={unit} fileType="assignmentsSI" label="Assignments (SI)" />
        </div>
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">English PDFs</h3>
            <PdfUploadRow unit={unit} fileType="notesEN" label="Notes (EN)" />
            <PdfUploadRow unit={unit} fileType="assignmentsEN" label="Assignments (EN)" />
        </div>
      </CardContent>
    </Card>
  );
}
