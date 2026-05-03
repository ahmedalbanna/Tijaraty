import { db } from './db';
import { dbFirestore } from './firebase';
import { collection, doc, writeBatch, getDocs, OperationType } from 'firebase/firestore';

export async function syncPusHOfflineData() {
  const offlineTransactions = await db.transactions.where('synced').equals(0).toArray(); // Or false
  
  if (offlineTransactions.length === 0) return;

  try {
    const batch = writeBatch(dbFirestore);

    for (const trx of offlineTransactions) {
      const trxRef = doc(dbFirestore, 'transactions', trx.id);
      batch.set(trxRef, { ...trx, synced: true });
      
      const items = await db.transactionItems.where('transactionId').equals(trx.id).toArray();
      for (const item of items) {
        const itemRef = doc(dbFirestore, `transactions/${trx.id}/items`, item.id);
        batch.set(itemRef, item);
      }
    }

    await batch.commit();

    // Mark as synced locally
    await db.transaction('rw', db.transactions, async () => {
      for (const trx of offlineTransactions) {
        await db.transactions.update(trx.id, { synced: true });
      }
    });

  } catch (err) {
    console.error('Failed to sync data to Firestore', err);
    throw err;
  }
}

export async function syncPullProducts() {
  try {
    const querySnapshot = await getDocs(collection(dbFirestore, 'products'));
    const products: any[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    await db.transaction('rw', db.products, async () => {
      // Simplistic: replace all products
      await db.products.clear();
      await db.products.bulkAdd(products);
    });
  } catch (err) {
    console.error('Failed to pull products', err);
  }
}
