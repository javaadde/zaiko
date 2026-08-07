import { firestore, storage } from '@/lib/firebase';
import { tsToMs, serverTs } from '@/lib/firestore';
import type { InventoryItem } from '@/types';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';

export function getEnvRef() {
  const company = useAuthStore.getState().currentCompany;
  const environment = useAuthStore.getState().currentEnvironment;
  if (!company || !environment) {
    throw new Error('No active company or environment');
  }
  return firestore()
    .collection('companies')
    .doc(company.id)
    .collection('environments')
    .doc(environment.id);
}

export async function getInventoryItems(filters?: {
  brand?: string;
  status?: string;
  search?: string;
  isArchived?: boolean;
}) {
  const envRef = getEnvRef();
  let query: FirebaseFirestoreTypes.Query = envRef.collection('inventory');

  if (filters?.brand) {
    query = query.where('brand', '==', filters.brand);
  }
  if (filters?.status) {
    query = query.where('status', '==', filters.status);
  }
  if (filters?.isArchived !== undefined) {
    query = query.where('isArchived', '==', filters.isArchived);
  }

  const snap = await query.get();
  let items: InventoryItem[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      companyId: data.companyId ?? '',
      environmentId: data.environmentId ?? '',
      model: data.model ?? '',
      brand: data.brand ?? '',
      imei: data.imei ?? null,
      purchasePrice: data.purchasePrice ?? 0,
      sellingPrice: data.sellingPrice ?? 0,
      quantity: data.quantity ?? 0,
      minWholesalePrice: data.minWholesalePrice ?? null,
      minRetailPrice: data.minRetailPrice ?? null,
      supplier: data.supplier ?? null,
      purchaseDate: data.purchaseDate?.toMillis() ?? null,
      status: data.status ?? 'in_stock',
      color: data.color ?? null,
      imageUrl: data.imageUrl ?? null,
      imagePath: data.imagePath ?? null,
      isArchived: data.isArchived ?? false,
      createdBy: data.createdBy ?? '',
      createdAt: tsToMs(data.createdAt),
      updatedAt: tsToMs(data.updatedAt),
      deletedAt: data.deletedAt?.toMillis() ?? null,
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.model.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        (i.supplier ?? '').toLowerCase().includes(q),
    );
  }

  return items;
}

export async function getInventoryItem(id: string) {
  const snap = await getEnvRef().collection('inventory').doc(id).get();
  if (!snap.exists) throw new Error('Item not found');
  const data = snap.data()!;
  return {
    id: snap.id,
    companyId: data.companyId ?? '',
    environmentId: data.environmentId ?? '',
    model: data.model ?? '',
    brand: data.brand ?? '',
    imei: data.imei ?? null,
    purchasePrice: data.purchasePrice ?? 0,
    sellingPrice: data.sellingPrice ?? 0,
    quantity: data.quantity ?? 0,
    minWholesalePrice: data.minWholesalePrice ?? null,
    minRetailPrice: data.minRetailPrice ?? null,
    supplier: data.supplier ?? null,
    purchaseDate: data.purchaseDate?.toMillis() ?? null,
    status: data.status ?? 'in_stock',
    color: data.color ?? null,
    imageUrl: data.imageUrl ?? null,
    imagePath: data.imagePath ?? null,
    isArchived: data.isArchived ?? false,
    createdBy: data.createdBy ?? '',
    createdAt: tsToMs(data.createdAt),
    updatedAt: tsToMs(data.updatedAt),
    deletedAt: data.deletedAt?.toMillis() ?? null,
  } satisfies InventoryItem;
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  const envRef = getEnvRef();
  const user = useAuthStore.getState().currentUser;
  const docRef = envRef.collection('inventory').doc();
  await docRef.set({
    ...item,
    id: docRef.id,
    createdAt: serverTs(),
    updatedAt: serverTs(),
    createdBy: user?.uid ?? '',
  });
  return docRef.id;
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'createdBy' | 'deletedAt'>>,
) {
  await getEnvRef().collection('inventory').doc(id).update({
    ...updates,
    updatedAt: serverTs(),
  });
}

export async function deleteInventoryItem(id: string) {
  await getEnvRef().collection('inventory').doc(id).update({
    deletedAt: serverTs(),
    updatedAt: serverTs(),
  });
}

export async function archiveInventoryItem(id: string) {
  await getEnvRef().collection('inventory').doc(id).update({
    isArchived: true,
    updatedAt: serverTs(),
  });
}

export async function unarchiveInventoryItem(id: string) {
  await getEnvRef().collection('inventory').doc(id).update({
    isArchived: false,
    updatedAt: serverTs(),
  });
}

export async function uploadInventoryImage(uri: string, path: string) {
  const ref = storage().ref(`inventory/${path}`);
  await ref.putFile(uri);
  const url = await ref.getDownloadURL();
  return { url, path };
}

export async function getInventoryStats() {
  const items = await getInventoryItems();
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPurchase = items.reduce((sum, i) => sum + i.purchasePrice * i.quantity, 0);
  const totalSelling = items.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0);
  const brandDistribution = new Map<string, { _id: string; totalQuantity: number }>();
  for (const item of items) {
    const current = brandDistribution.get(item.brand) ?? { _id: item.brand, totalQuantity: 0 };
    current.totalQuantity += item.quantity;
    brandDistribution.set(item.brand, current);
  }
  return {
    totalQuantity,
    totalPurchase,
    totalSelling,
    potentialProfit: totalSelling - totalPurchase,
    brandDistribution: Array.from(brandDistribution.values()),
    bestSelling: items[0] ?? null,
  };
}

export async function restockItem(id: string, quantity: number) {
  const envRef = getEnvRef();
  const docRef = envRef.collection('inventory').doc(id);
  await docRef.update({
    quantity: firestore.FieldValue.increment(quantity),
    updatedAt: serverTs(),
  });
  const snap = await docRef.get();
  if (!snap.exists) throw new Error('Item not found');
  const data = snap.data()!;
  return {
    id: snap.id,
    companyId: data.companyId ?? '',
    environmentId: data.environmentId ?? '',
    model: data.model ?? '',
    brand: data.brand ?? '',
    imei: data.imei ?? null,
    purchasePrice: data.purchasePrice ?? 0,
    sellingPrice: data.sellingPrice ?? 0,
    quantity: data.quantity ?? 0,
    minWholesalePrice: data.minWholesalePrice ?? null,
    minRetailPrice: data.minRetailPrice ?? null,
    supplier: data.supplier ?? null,
    purchaseDate: data.purchaseDate?.toMillis() ?? null,
    status: data.status ?? 'in_stock',
    color: data.color ?? null,
    imageUrl: data.imageUrl ?? null,
    imagePath: data.imagePath ?? null,
    isArchived: data.isArchived ?? false,
    createdBy: data.createdBy ?? '',
    createdAt: tsToMs(data.createdAt),
    updatedAt: tsToMs(data.updatedAt),
    deletedAt: data.deletedAt?.toMillis() ?? null,
  } satisfies InventoryItem;
}
