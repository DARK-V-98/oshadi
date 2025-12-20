'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { units as allUnits, Unit } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Download, FileText } from 'lucide-react';

function UserDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { signOut } = useAuth();

  const [accessKey, setAccessKey] = useState('');
  const [isBinding, setIsBinding] = useState(false);
  const [unlockedPdfs, setUnlockedPdfs] = useState<Unit[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);

  useEffect(() => {
    if (!user || !firestore) return;

    const fetchUnlockedPdfs = async () => {
      setLoadingPdfs(true);
      const unlockedRef = collection(firestore, 'userUnlockedPdfs');
      const q = query(unlockedRef, where('userId', '==', user.uid));
      try {
        const querySnapshot = await getDocs(q);
        const unlockedUnitIds = querySnapshot.docs.map(doc => doc.data().unitId);
        const userPdfs = allUnits.filter(unit => unlockedUnitIds.includes(unit.unitNo));
        setUnlockedPdfs(userPdfs);
      } catch (error) {
        console.error("Error fetching unlocked PDFs: ", error);
        toast({ title: 'Error', description: 'Could not load your unlocked PDFs.', variant: 'destructive' });
      } finally {
        setLoadingPdfs(false);
      }
    };

    fetchUnlockedPdfs();
  }, [user, firestore, toast]);


  const handleBindKey = async () => {
    if (!accessKey.trim()) {
      toast({ title: 'Error', description: 'Please enter an access key.', variant: 'destructive' });
      return;
    }
    if (!firestore || !user) {
        toast({ title: 'Error', description: 'Could not connect to service.', variant: 'destructive' });
        return;
    }

    setIsBinding(true);

    const keysRef = collection(firestore, 'accessKeys');
    const q = query(keysRef, where('key', '==', accessKey), where('status', '==', 'available'));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ title: 'Invalid Key', description: 'This key is invalid, has expired, or has already been used.', variant: 'destructive' });
            setIsBinding(false);
            return;
        }

        const keyDoc = querySnapshot.docs[0];
        const keyData = keyDoc.data();

        const batch = writeBatch(firestore);

        // Update the key status
        const keyDocRef = doc(firestore, 'accessKeys', keyDoc.id);
        batch.update(keyDocRef, {
            status: 'bound',
            boundTo: user.uid,
            boundAt: new Date(),
        });
        
        // Create a new document in userUnlockedPdfs
        const unlockedPdfRef = doc(collection(firestore, 'userUnlockedPdfs'));
        batch.set(unlockedPdfRef, {
            userId: user.uid,
            unitId: keyData.unitId,
            keyId: keyDoc.id,
            unlockedAt: new Date(),
            downloadCount: 0,
        });

        await batch.commit();

        const unlockedUnit = allUnits.find(u => u.unitNo === keyData.unitId);
        if(unlockedUnit) {
            setUnlockedPdfs(prev => [...prev, unlockedUnit]);
        }

        toast({ title: 'Success!', description: `You have unlocked "${unlockedUnit?.nameEN}".` });
        setAccessKey('');

    } catch (error) {
        console.error("Error binding key: ", error);
        toast({ title: 'Error', description: 'An unexpected error occurred while binding the key.', variant: 'destructive' });
    } finally {
        setIsBinding(false);
    }
  };
  
  const handleDownload = (unit: Unit) => {
    // This is a placeholder for the actual download logic.
    // In a real app, you would verify on the backend that this user can download
    // and then provide a secure, temporary download link.
    // We also need to increment the download count.
    console.log(`Initiating download for ${unit.nameEN}`);
    toast({ title: "Download started", description: `Downloading ${unit.nameEN}.`});
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">My Dashboard</h1>
        <Button onClick={signOut} variant="outline">Sign Out</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Unlock New PDF</CardTitle>
              <CardDescription>Enter a purchased key to access a new PDF.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter your one-time key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  disabled={isBinding}
                />
                <Button onClick={handleBindKey} disabled={isBinding} className="w-full">
                  {isBinding ? 'Binding Key...' : 'Bind Key'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold font-heading mb-4">My Unlocked Notes</h2>
            {loadingPdfs ? (
                <p>Loading your notes...</p>
            ) : unlockedPdfs.length > 0 ? (
                <div className="grid gap-4">
                    {unlockedPdfs.map(unit => (
                        <Card key={unit.unitNo} className="flex items-center justify-between p-4">
                           <div className="flex items-center gap-4">
                                <FileText className="w-6 h-6 text-primary" />
                                <div>
                                    <p className="font-semibold">{unit.nameEN}</p>
                                    <p className="text-sm text-muted-foreground">{unit.nameSI}</p>
                                </div>
                           </div>
                           <Button size="sm" onClick={() => handleDownload(unit)}>
                                <Download className="w-4 h-4 mr-2"/>
                                Download
                           </Button>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center p-8 text-center">
                    <CardHeader>
                        <CardTitle>No Unlocked Notes Yet</CardTitle>
                        <CardDescription>
                            Purchase notes to get an access key, then bind it here to start downloading.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <UserDashboard />
        </AuthGuard>
    )
}
