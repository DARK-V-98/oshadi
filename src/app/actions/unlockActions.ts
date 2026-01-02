
'use server';

import { getFirestore, doc, getDoc, updateDoc, writeBatch, collection, serverTimestamp } from 'firebase-admin/firestore';
import { adminApp } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { Unit } from '@/lib/data';
import { CartItem } from '@/context/CartContext';


export async function unlockContentForOrder(orderId: string): Promise<{ success: boolean; error?: string, message?: string }> {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('firebaseIdToken')?.value;

        if (!token) {
            throw new Error('User is not authenticated.');
        }

        const decodedToken = await getAuth(adminApp).verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = getFirestore(adminApp);

        // 1. Verify the user owns the order and it's 'completed' but not yet unlocked
        const orderDocRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderDocRef);

        if (!orderDoc.exists() || orderDoc.data()?.userId !== userId) {
            return { success: false, error: 'Unauthorized or order not found.' };
        }
        
        const orderData = orderDoc.data();

        if (orderData.status !== 'completed') {
             return { success: false, error: 'Order is not yet completed.' };
        }

        if (orderData.contentUnlocked) {
            return { success: false, error: 'Content for this order has already been unlocked.' };
        }
        
        // 2. Unlock content for the user
        const batch = writeBatch(db);
        const itemsToUnlock: CartItem[] = orderData.items;
        const unitsRef = collection(db, 'units');

        for (const item of itemsToUnlock) {
            const unitDocRef = doc(unitsRef, item.unitId);
            const unitDoc = await getDoc(unitDocRef);
            
            if (!unitDoc.exists()) {
                console.warn(`Unit with ID ${item.unitId} not found during unlock for order ${orderId}`);
                continue;
            }
            const unitData = unitDoc.data() as Unit;

            const unlockedPdfRef = doc(collection(db, 'userUnlockedPdfs'));
            batch.set(unlockedPdfRef, {
                userId: userId,
                orderId: orderId,
                unitId: item.unitId,
                unitNo: unitData.unitNo,
                unitNameEN: unitData.nameEN,
                unitNameSI: unitData.nameSI,
                category: unitData.category,
                language: item.language,
                type: item.type,
                unlockedAt: serverTimestamp(),
                downloaded: false,
            });
        }
        
        batch.update(orderDocRef, { contentUnlocked: true });
        
        await batch.commit();

        return { success: true, message: "Content unlocked successfully." };

    } catch (error: any) {
        console.error('Unlock Content Action Error:', error);
        return { success: false, error: error.message || 'An internal server error occurred.' };
    }
}
