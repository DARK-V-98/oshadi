import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, writeBatch, collection, serverTimestamp, query, where, getDocs } from 'firebase-admin/firestore';
import { adminApp, adminAuth } from '@/firebase/admin';
import { Unit } from '@/lib/data';
import { CartItem } from '@/context/CartContext';


export async function POST(req: NextRequest) {
    console.log('Unlock API received request.');
    const authHeader = req.headers.get('authorization');
    console.log('Authorization header:', authHeader);

    try {
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid authorization header.' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Token missing from authorization header.' }, { status: 401 });
        }

        const { orderId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 });
        }
        
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = getFirestore(adminApp);

        // 1. Verify the user owns the order and it's 'completed' but not yet unlocked
        const orderDocRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderDocRef);

        if (!orderDoc.exists() || orderDoc.data()?.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized or order not found.' }, { status: 403 });
        }
        
        const orderData = orderDoc.data();

        if (orderData.status !== 'completed') {
             return NextResponse.json({ error: 'Order is not yet completed.' }, { status: 400 });
        }

        if (orderData.contentUnlocked) {
            return NextResponse.json({ error: 'Content for this order has already been unlocked.' }, { status: 400 });
        }
        
        // 2. Unlock content for the user
        const batch = writeBatch(db);
        const itemsToUnlock: CartItem[] = orderData.items;
        const unitsRef = collection(db, 'units');

        for (const item of itemsToUnlock) {
            // item.unitId is the Firestore document ID of the unit
            const unitDocRef = doc(unitsRef, item.unitId);
            const unitDoc = await getDoc(unitDocRef);
            
            if (!unitDoc.exists()) {
                console.warn(`Unit with ID ${item.unitId} not found during unlock for order ${orderId}`);
                continue; // Skip if unit doesn't exist
            }
            const unitData = unitDoc.data() as Unit;

            const unlockedPdfRef = doc(collection(db, 'userUnlockedPdfs'));
            batch.set(unlockedPdfRef, {
                userId: userId,
                orderId: orderId,
                unitId: item.unitId, // Firestore Document ID
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
        
        // 3. Mark the order as contentUnlocked
        batch.update(orderDocRef, { contentUnlocked: true });
        
        await batch.commit();

        return NextResponse.json({ success: true, message: "Content unlocked successfully." });

    } catch (error: any) {
        console.error('Unlock Content API Error:', error);
        let errorMessage = 'An internal server error occurred.';
        let statusCode = 500;
        
        if (error.code) { // Firebase errors often have a 'code'
             errorMessage = `A server error occurred: ${error.code}.`;
             if(error.code.startsWith('auth/')) {
                statusCode = 401;
             }
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: statusCode });
    }
}

    