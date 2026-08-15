import { getApp } from '@react-native-firebase/app';
import { tsToMs, tsToMsOrNull, serverTs } from '@/lib/firestore';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import type { InventoryItem } from '@/types';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getActiveCompanyId, getActiveEnvironmentId } from '@/lib/mmkv';
import { useAuthStore } from '@/stores/auth-store';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  query,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

const firebaseApp = getApp();
const db = getFirestore(firebaseApp);

export function getEnvRef() {
  const { currentCompany, currentEnvironment } = useAuthStore.getState();
  const companyId = currentCompany?.id ?? getActiveCompanyId();
  const environmentId = currentEnvironment?.id ?? getActiveEnvironmentId();
  if (!companyId || !environmentId) {
    throw new Error('No active company or environment');
  }
  return doc(db, 'companies', companyId, 'environments', environmentId);
}

export async function getInventoryItems(filters?: {
  brand?: string;
  status?: string;
  search?: string;
  isArchived?: boolean;
}) {
  const envRef = getEnvRef();
  const inventoryRef = collection(envRef, 'inventory');
  let q: FirebaseFirestoreTypes.Query = query(inventoryRef);
  const isArchived = filters?.isArchived ?? false;

  if (filters?.brand) {
    q = query(q, where('brand', '==', filters.brand));
  }
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  q = query(q, where('isArchived', '==', isArchived));

  const snap = await getDocs(q);
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
      purchaseDate: tsToMsOrNull(data.purchaseDate),
      status: data.status ?? 'in_stock',
      color: data.color ?? null,
      imageUrl: data.imageUrl ?? null,
      imagePath: data.imagePath ?? null,
      isArchived: data.isArchived ?? false,
      createdBy: data.createdBy ?? '',
      createdAt: tsToMs(data.createdAt),
      updatedAt: tsToMs(data.updatedAt),
      deletedAt: tsToMsOrNull(data.deletedAt),
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
  const snap = await getDoc(doc(collection(getEnvRef(), 'inventory'), id));
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
    purchaseDate: tsToMsOrNull(data.purchaseDate),
    status: data.status ?? 'in_stock',
    color: data.color ?? null,
    imageUrl: data.imageUrl ?? null,
    imagePath: data.imagePath ?? null,
    isArchived: data.isArchived ?? false,
    createdBy: data.createdBy ?? '',
    createdAt: tsToMs(data.createdAt),
    updatedAt: tsToMs(data.updatedAt),
    deletedAt: tsToMsOrNull(data.deletedAt),
  } satisfies InventoryItem;
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  const envRef = getEnvRef();
  const user = useAuthStore.getState().currentUser;
  const company = useAuthStore.getState().currentCompany;
  const environment = useAuthStore.getState().currentEnvironment;
  const docRef = await addDoc(collection(envRef, 'inventory'), {
    ...item,
    companyId: company?.id ?? item.companyId,
    environmentId: environment?.id ?? item.environmentId,
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
  await updateDoc(doc(collection(getEnvRef(), 'inventory'), id), {
    ...updates,
    updatedAt: serverTs(),
  });
}

export async function deleteInventoryItem(id: string) {
  await updateDoc(doc(collection(getEnvRef(), 'inventory'), id), {
    deletedAt: serverTs(),
    updatedAt: serverTs(),
  });
}

export async function archiveInventoryItem(id: string) {
  await updateDoc(doc(collection(getEnvRef(), 'inventory'), id), {
    isArchived: true,
    updatedAt: serverTs(),
  });
}

export async function unarchiveInventoryItem(id: string) {
  await updateDoc(doc(collection(getEnvRef(), 'inventory'), id), {
    isArchived: false,
    updatedAt: serverTs(),
  });
}

export async function uploadInventoryImage(asset: { uri: string; mimeType?: string | null; fileName?: string | null }, path: string) {
  return uploadImageToCloudinary(asset, {
    folder: 'inventory',
    publicId: path,
  });
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
  const docRef = doc(collection(envRef, 'inventory'), id);
  await updateDoc(docRef, {
    quantity: increment(quantity),
    updatedAt: serverTs(),
  });
  const snap = await getDoc(docRef);
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
    purchaseDate: tsToMsOrNull(data.purchaseDate),
    status: data.status ?? 'in_stock',
    color: data.color ?? null,
    imageUrl: data.imageUrl ?? null,
    imagePath: data.imagePath ?? null,
    isArchived: data.isArchived ?? false,
    createdBy: data.createdBy ?? '',
    createdAt: tsToMs(data.createdAt),
    updatedAt: tsToMs(data.updatedAt),
    deletedAt: tsToMsOrNull(data.deletedAt),
  } satisfies InventoryItem;
}
