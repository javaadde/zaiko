export type TimestampMs = number;

export type User = {
  uid: string;
  displayName: string;
  email: string;
  personalColor: string;
  photoURL: string | null;
  phoneNumber?: string | null;
  companyIds?: string[];
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
  deletedAt: TimestampMs | null;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  logoPath?: string | null;
  ownerId: string;
  members: string[];
  admins: string[];
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
  deletedAt: TimestampMs | null;
};

export type Environment = {
  id: string;
  companyId: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  members: string[];
  admins: string[];
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
  deletedAt: TimestampMs | null;
};

export type InventoryItem = {
  id: string;
  companyId: string;
  environmentId: string;
  model: string;
  brand: string;
  imei?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minWholesalePrice?: number | null;
  minRetailPrice?: number | null;
  supplier?: string | null;
  purchaseDate?: TimestampMs | null;
  status: 'in_stock' | 'low' | 'out_of_stock';
  color?: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
  isArchived: boolean;
  createdBy: string;
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
  deletedAt: TimestampMs | null;
};

export type Sale = {
  id: string;
  companyId: string;
  environmentId: string;
  itemId: string;
  customerName: string;
  customerPhotoUrl?: string | null;
  customerPhotoPath?: string | null;
  imei: string;
  salePrice: number;
  saleType: 'retail' | 'wholesale';
  saleDate: TimestampMs;
  createdBy: string;
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
  deletedAt: TimestampMs | null;
};

export type BrandKey = 'Apple' | 'Samsung' | 'Google' | 'Xiaomi' | 'OnePlus' | 'Vivo' | 'Oppo' | 'Motorola' | 'IQOO' | 'Realme' | 'Other';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentOption = 'emerald' | 'ocean' | 'amber' | 'rose';
export type CornerPreset = 'standard' | 'rounded' | 'pill';
export type HeadlineOption = 'system' | 'editorial';
