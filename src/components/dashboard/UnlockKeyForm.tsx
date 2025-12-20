
'use client';
import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, writeBatch, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Key, Loader2 } from 'lucide-react';

interface PdfPart {
    partName: string;
    fileName: string;
    downloadUrl: string;
}

interface UnitWithPdfs extends Unit {
    pdfs: PdfPart[];
}

const UnlockKeyForm = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [accessKey, setAccessKey] = useState('');
    const [isBinding, setIsBinding] = useState(false);

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
            const unitId = keyData.unitId;

            const unitDocRef = doc(firestore, 'units', unitId);
            const unitDocSnap = await getDoc(unitDocRef);

            if (!unitDocSnap.exists()) {
                toast({ title: 'Error', description: 'The unit associated with this key does not exist.', variant: 'destructive' });
                setIsBinding(false);
                return;
            }

            const unitData = unitDocSnap.data() as UnitWithPdfs;

            const batch = writeBatch(firestore);

            const keyDocRef = doc(firestore, 'accessKeys', keyDoc.id);
            batch.update(keyDocRef, {
                status: 'bound',
                boundTo: user.uid,
                boundAt: new Date(),
            });

            (unitData.pdfs || []).forEach(part => {
                const unlockedPdfRef = doc(collection(firestore, 'userUnlockedPdfs'));
                batch.set(unlockedPdfRef, {
                    userId: user.uid,
                    unitId: unitId,
                    keyId: keyDoc.id,
                    type: keyData.type,
                    unlockedAt: new Date(),
                    partName: part.partName,
                    fileName: part.fileName,
                    downloadUrl: part.downloadUrl,
                    downloaded: false,
                    downloadedAt: null,
                });
            });

            await batch.commit();

            toast({ title: 'Success!', description: `You have unlocked "${unitData?.nameEN}" (${keyData.type}).` });
            setAccessKey('');

        } catch (error) {
            console.error("Error binding key: ", error);
            toast({ title: 'Error', description: 'An unexpected error occurred while binding the key.', variant: 'destructive' });
        } finally {
            setIsBinding(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Key className="text-primary" />Bind Your Key</CardTitle>
                <CardDescription>Enter a purchased key to access new content.</CardDescription>
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
                        {isBinding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Binding Key...</> : 'Bind & Unlock'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default UnlockKeyForm;

    