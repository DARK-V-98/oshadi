
'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, Timestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { User, Key, PlusCircle, ExternalLink, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Input } from '../ui/input';

interface AccessKey {
  id: string;
  key: string;
  unitId: string;
  type: 'note' | 'assignment';
  status: 'available' | 'bound';
  createdAt: Timestamp;
  boundTo?: string;
  boundAt?: Timestamp;
}

interface UserProfile {
  name: string;
  email: string;
}

const KeyManagementList = () => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedKeyType, setSelectedKeyType] = useState<'note' | 'assignment' | ''>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);


  const fetchKeys = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const keysRef = collection(firestore, 'accessKeys');
      const q = query(keysRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedKeys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessKey));
      setKeys(fetchedKeys);

      const userIds = new Set(fetchedKeys.map(k => k.boundTo).filter(Boolean));
      const userPromises = Array.from(userIds).map(async (uid) => {
        if(!uid || users[uid]) return;
        const userDocRef = doc(firestore, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUsers(prev => ({ ...prev, [uid]: userDoc.data() as UserProfile }));
        }
      });
      await Promise.all(userPromises);

    } catch (error) {
      console.error("Error fetching access keys: ", error);
      toast({
        title: "Error",
        description: "Could not load access keys.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!firestore) return;

    const fetchUnits = async () => {
        const unitsRef = collection(firestore, 'units');
        const q = query(unitsRef, orderBy('unitNo'));
        const querySnapshot = await getDocs(q);
        const fetchedUnits = querySnapshot.docs.map(doc => ({ ...doc.data(), unitNo: doc.id } as Unit));
        setUnits(fetchedUnits);
    }
    
    fetchUnits();
    fetchKeys();
  }, [firestore, toast]);
  
  const getUnitName = (unitId: string) => {
    return units.find(u => u.unitNo === unitId)?.nameEN || unitId;
  }

  const generateKey = async () => {
    if (!firestore || !selectedUnit || !selectedKeyType) {
        toast({ title: 'Error', description: 'Please select a unit and a key type.', variant: 'destructive'});
        return;
    }
    setIsGenerating(true);

    try {
        const key = `OV-${selectedUnit.toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        
        await addDoc(collection(firestore, 'accessKeys'), {
            key,
            unitId: selectedUnit,
            type: selectedKeyType,
            status: 'available',
            createdAt: new Date(),
        });
        
        setGeneratedKey(key);
        setIsGeneratorOpen(false);
        fetchKeys(); // Refresh the list

    } catch (error) {
        console.error('Error generating key: ', error);
        toast({ title: 'Error', description: 'Could not generate the key.', variant: 'destructive'});
    } finally {
        setIsGenerating(false);
        setSelectedUnit('');
        setSelectedKeyType('');
    }
  }

  const copyToClipboard = () => {
    if (generatedKey) {
        navigator.clipboard.writeText(generatedKey);
        toast({ title: "Copied!", description: "The key has been copied to your clipboard." });
    }
  }


  const renderKeyTable = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Bound To</TableHead>
              <TableHead>Bound At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length > 0 ? (
              keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-xs flex items-center gap-2">
                      <Key className="w-4 h-4 text-muted-foreground"/>
                      {k.key}
                  </TableCell>
                  <TableCell>{getUnitName(k.unitId)}</TableCell>
                  <TableCell>
                    <Badge variant={k.type === 'note' ? 'default' : 'secondary'}>{k.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={k.status === 'bound' ? 'destructive' : 'outline'}>
                      {k.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{k.createdAt ? k.createdAt.toDate().toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    {k.boundTo && users[k.boundTo] ? (
                      <div className="flex items-center gap-2">
                         <User className="w-4 h-4 text-muted-foreground"/>
                         <div>
                              <div>{users[k.boundTo].name}</div>
                              <div className="text-xs text-muted-foreground">{users[k.boundTo].email}</div>
                         </div>
                      </div>
                    ) : k.boundTo ? (
                       k.boundTo 
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{k.boundAt ? k.boundAt.toDate().toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No keys generated yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    );
  }

  return (
    <div>
        <div className="flex justify-end mb-4">
             <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="w-4 h-4 mr-2"/>
                        Generate New Key
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Access Key</DialogTitle>
                        <DialogDescription>Select a unit and a type to generate a new one-time access key.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map(unit => (
                                    <SelectItem key={unit.unitNo} value={unit.unitNo}>{unit.nameEN} ({unit.unitNo})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedKeyType} onValueChange={(v) => setSelectedKeyType(v as 'note' | 'assignment')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Key Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="note">Note (Watermarked PDF)</SelectItem>
                                <SelectItem value="assignment">Assignment (Original PDF)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsGeneratorOpen(false)}>Cancel</Button>
                        <Button onClick={generateKey} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate Key'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!generatedKey} onOpenChange={(open) => !open && setGeneratedKey(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Key Generated Successfully!</DialogTitle>
                        <DialogDescription>
                            Here is the new access key. Share it with the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="relative">
                            <Input value={generatedKey || ''} readOnly className="pr-10 font-mono text-lg" />
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={copyToClipboard}>
                                <Copy className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                     <DialogFooter>
                        <Button onClick={() => setGeneratedKey(null)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            {renderKeyTable()}
        </div>
    </div>
  );
};

export default KeyManagementList;
