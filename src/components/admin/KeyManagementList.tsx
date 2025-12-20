'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { units as allUnits } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { User, Key } from 'lucide-react';

interface AccessKey {
  id: string;
  key: string;
  unitId: string;
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

  useEffect(() => {
    if (!firestore) return;

    const fetchKeys = async () => {
      setLoading(true);
      try {
        const keysRef = collection(firestore, 'accessKeys');
        const q = query(keysRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedKeys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessKey));
        setKeys(fetchedKeys);

        // Fetch user data for bound keys
        const userIds = new Set(fetchedKeys.map(k => k.boundTo).filter(Boolean));
        const userPromises = Array.from(userIds).map(async (uid) => {
          if(!uid) return;
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

    fetchKeys();
  }, [firestore, toast]);
  
  const getUnitName = (unitId: string) => {
    return allUnits.find(u => u.unitNo === unitId)?.nameEN || unitId;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Unit</TableHead>
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
                  <Badge variant={k.status === 'bound' ? 'secondary' : 'default'}>
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
              <TableCell colSpan={6} className="h-24 text-center">
                No keys generated yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default KeyManagementList;
