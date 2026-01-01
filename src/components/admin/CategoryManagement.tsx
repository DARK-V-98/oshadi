'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Trash2, ArrowLeft, Tags } from 'lucide-react';
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


interface Category {
  id: string;
  value: string;
  label: string;
}

const CategoryManagement = () => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    const categoriesRef = collection(firestore, 'categories');
    const q = query(categoriesRef, orderBy('label'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories: Category[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      setCategories(fetchedCategories);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  const handleAddCategory = async () => {
    if (!firestore || !newCategoryLabel.trim()) {
      toast({ title: 'Category name is required.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const formattedValue = newCategoryLabel.toLowerCase().replace(/\s+/g, '-');
    const newCategoryData = {
        label: newCategoryLabel,
        value: formattedValue,
    };
    try {
        const categoriesRef = collection(firestore, 'categories');
        await addDoc(categoriesRef, newCategoryData).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: categoriesRef.path,
              operation: 'create',
              requestResourceData: newCategoryData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });

      toast({ title: 'Success', description: `Category "${newCategoryLabel}" added.` });
      setNewCategoryLabel('');
    } catch (error) {
        if (!(error instanceof FirestorePermissionError)) {
             toast({ title: 'Error', description: 'Could not add category.', variant: 'destructive' });
        }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string, categoryLabel: string) => {
    if (!firestore) return;

    const categoryDocRef = doc(firestore, 'categories', categoryId);
    try {
        await deleteDoc(categoryDocRef).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: categoryDocRef.path,
              operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
      toast({ title: 'Success', description: `Category "${categoryLabel}" deleted.` });
    } catch (error) {
        if (!(error instanceof FirestorePermissionError)) {
            toast({ title: 'Error', description: 'Could not delete category.', variant: 'destructive' });
        }
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
          <h1 className="text-3xl font-bold font-heading mt-4">Category Management</h1>
          <p className="text-muted-foreground">Add or remove main module categories for your units.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>Create a new category to group your course units.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="e.g., New Syllabus, Extra Modules"
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
              disabled={isSubmitting}
            />
            <Button onClick={handleAddCategory} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Tags className="w-5 h-5 text-primary" />
                    <p className="font-medium">{category.label}</p>
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
                                This will permanently delete the "{category.label}" category. This action cannot be undone and may affect units currently assigned to this category.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id, category.label)}>
                                Yes, delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No categories created yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManagement;
