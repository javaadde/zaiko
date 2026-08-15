import { tsToMs, tsToMsOrNull, serverTs } from '@/lib/firestore';
import type { Sale } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { addDoc, collection, getDocs, orderBy, query } from '@react-native-firebase/firestore';
import { getEnvRef } from './inventory';

export async function createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  const envRef = getEnvRef();
  const user = useAuthStore.getState().currentUser;
  const docRef = await addDoc(collection(envRef, 'sales'), {
    ...sale,
    createdAt: serverTs(),
    updatedAt: serverTs(),
    createdBy: user?.uid ?? sale.createdBy,
  });
  return docRef.id;
}

export async function getSales() {
  const { currentCompany, currentEnvironment } = useAuthStore.getState();
  if (!currentCompany || !currentEnvironment) {
    return [];
  }
  const snap = await getDocs(query(collection(getEnvRef(), 'sales'), orderBy('saleDate', 'desc')));
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
      deletedAt: tsToMsOrNull(data.deletedAt),
    } satisfies Sale;
  });
}
