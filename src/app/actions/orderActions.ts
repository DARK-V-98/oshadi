'use server';

import { getAdminFirestore } from '@/firebase/admin';
import { collection, doc, writeBatch, getDoc, updateDoc } from 'firebase/firestore';
import { CartItem } from '@/context/CartContext';

export async function grantAccessToOrderContent(orderId: string) {
    const db = getAdminFirestore();
    const batch = writeBatch(db);

    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error('Order not found.');
        }

        const orderData = orderSnap.data();
        const userId = orderData.userId;
        const items: CartItem[] = orderData.items;

        const unlockedPdfsRef = collection(db, 'userUnlockedPdfs');

        // Fetch all units to get their PDF URLs
        const unitPromises = items.map(item => getDoc(doc(db, 'units', item.unitId)));
        const unitSnaps = await Promise.all(unitPromises);
        const unitsData = Object.fromEntries(unitSnaps.map(snap => [snap.id, snap.data()]));

        items.forEach(item => {
            const unitData = unitsData[item.unitId];
            if (!unitData) return; // Skip if unit data not found

            let pdfUrl: string | undefined;
            if (item.language === 'SI') {
                pdfUrl = item.type === 'note' ? unitData.pdfUrlNotesSI : unitData.pdfUrlAssignmentsSI;
            } else { // 'EN'
                pdfUrl = item.type === 'note' ? unitData.pdfUrlNotesEN : unitData.pdfUrlAssignmentsEN;
            }

            if (pdfUrl) {
                const newUnlockedRef = doc(unlockedPdfsRef);
                batch.set(newUnlockedRef, {
                    userId,
                    orderId,
                    unitId: item.unitId,
                    unitName: item.unitName,
                    type: item.type,
                    language: item.language,
                    unlockedAt: new Date(),
                    pdfUrl: pdfUrl,
                });
            }
        });
        
        // Mark the order as contentUnlocked
        batch.update(orderRef, { contentUnlocked: true });

        await batch.commit();
        
        return { success: true };
    } catch (error: any) {
        console.error("Error granting access to order content:", error);
        return { success: false, error: error.message };
    }
}
