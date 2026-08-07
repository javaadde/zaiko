import { tsToMs, serverTs } from '@/lib/firestore';
import type { Sale } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { getEnvRef } from './inventory';

export async function createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  const envRef = getEnvRef();
  const user = useAuthStore.getState().currentUser;
  const docRef = envRef.collection('sales').doc();
  await docRef.set({
    ...sale,
    id: docRef.id,
    createdAt: serverTs(),
    updatedAt: serverTs(),
    createdBy: user?.uid ?? sale.createdBy,
  });
  return docRef.id;
}

export async function getSales() {
  const snap = await getEnvRef().collection('sales').orderBy('saleDate', 'desc').get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      companyId: data.companyId ?? '',
      environmentId: data.environmentId ?? '',
      itemId: data.itemId ?? '',
      customerName: data.customerName ?? '',
      customerPhotoUrl: data.customerPhotoUrl ?? null,
      customerPhotoPath: data.customerPhotoPath ?? null,
      imei: data.imei ?? '',
      salePrice: data.salePrice ?? 0,
      saleType: data.saleType ?? 'retail',
      saleDate: tsToMs(data.saleDate),
      createdBy: data.createdBy ?? '',
      createdAt: tsToMs(data.createdAt),
      updatedAt: tsToMs(data.updatedAt),
      deletedAt: data.deletedAt?.toMillis() ?? null,
    } satisfies Sale;
  });
}
