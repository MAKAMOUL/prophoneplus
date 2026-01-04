export type UserRole = 'admin' | 'worker';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  ref?: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  quantityRemaining?: number;
  price: number;
  minStock: number;
  imageUrl?: string;
  imageData?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  deleted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  subcategories?: string[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  deleted?: boolean;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  soldBy: string;
  soldByName: string;
  billUrl?: string;
  createdAt: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  collection: 'products' | 'categories' | 'sales';
  documentId: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

export type SyncStatus = 'online' | 'offline' | 'syncing';

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  currentQuantity: number;
  minStock: number;
  createdAt: number;
  dismissed: boolean;
}
