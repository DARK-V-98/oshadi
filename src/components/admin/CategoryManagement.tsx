'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Trash2, ArrowLeft, Folder } from 'lucide-react';
import Link from 'next/link';
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Label } from '../ui/label';

interface MainCategory {
  id: string;
  label: string;
  value: string;
}

interface SubCategory {
  id: string;
  value: string;
  label: string;
  mainCategory: string; // value of the main category
}

const CategoryManagement = () => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubCategoryLabel, setNewSubCategoryLabel] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    const mainCategoriesRef = collection(firestore, 'mainCategories');
    const qMain = query(mainCategoriesRef, orderBy('label'));

    const subCategoriesRef = collection(firestore, 'subCategories');
    const qSub = query(subCategoriesRef, orderBy('label'));

    const unsubMain = onSnapshot(qMain, (snapshot) => {
        setMainCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MainCategory)));
    });

    const unsubSub = onSnapshot(qSub, (snapshot) => {
        setSubCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubCategory)));
        setLoading(false);
    });

    return () => {
        unsubMain();
        unsubSub();
    };
  }, [firestore, toast]);

  const handleAddSubCategory = async () => {
    if (!firestore || !newSubCategoryLabel.trim() || !selectedMainCategory) {
      toast({ title: 'All fields are required.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const formattedValue = newSubCategoryLabel.toLowerCase().replace(/\s+/g, '-');
    const newSubCategoryData = {
        label: newSubCategoryLabel,
        value: formattedValue,
        mainCategory: selectedMainCategory,
    };
    try {
        const subCategoriesRef = collection(firestore, 'subCategories');
        await addDoc(subCategoriesRef, newSubCategoryData).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: subCategoriesRef.path,
              operation: 'create',
              requestResourceData: newSubCategoryData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });

      toast({ title: 'Success', description: `Sub-category "${newSubCategoryLabel}" added.` });
      setNewSubCategoryLabel('');
      setSelectedMainCategory('');
    } catch (error) {
        if (!(error instanceof FirestorePermissionError)) {
             toast({ title: 'Error', description: 'Could not add sub-category.', variant: 'destructive' });
        }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSubCategory = async (categoryId: string, categoryLabel: string) => {
    if (!firestore) return;

    const categoryDocRef = doc(firestore, 'subCategories', categoryId);
    try {
        await deleteDoc(categoryDocRef).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: categoryDocRef.path,
              operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
      toast({ title: 'Success', description: `Sub-category "${categoryLabel}" deleted.` });
    } catch (error) {
        if (!(error instanceof FirestorePermissionError)) {
            toast({ title: 'Error', description: 'Could not delete sub-category.', variant: 'destructive' });
        }
    }
  };

  const getMainCategoryLabel = (value: string) => {
    return mainCategories.find(mc => mc.value === value)?.label || value;
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
          <h1 className="text-3xl font-bold font-heading mt-4">Sub-Category Management</h1>
          <p className="text-muted-foreground">Group your units into sub-categories within main categories.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Sub-Category</CardTitle>
          <CardDescription>Create a new sub-category and assign it to a main category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Main Category</Label>
            <Select value={selectedMainCategory} onValueChange={setSelectedMainCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a Main Category" />
                </SelectTrigger>
                <SelectContent>
                    {mainCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label>New Sub-Category Name</Label>
            <div className="flex gap-4">
                <Input
                placeholder="e.g., New Syllabus, Practical Skills"
                value={newSubCategoryLabel}
                onChange={(e) => setNewSubCategoryLabel(e.target.value)}
                disabled={isSubmitting}
                />
                <Button onClick={handleAddSubCategory} disabled={isSubmitting || !selectedMainCategory}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                Add Sub-Category
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Existing Sub-Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : subCategories.length > 0 ? (
            <div className="space-y-2">
              {subCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-primary" />
                    <div>
                        <p className="font-medium">{category.label}</p>
                        <p className="text-xs text-muted-foreground">Main Category: {getMainCategoryLabel(category.mainCategory)}</p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the "{category.label}" sub-category. This action cannot be undone and may affect units currently assigned to it.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSubCategory(category.id, category.label)}>
                                Yes, delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No sub-categories created yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManagement;
