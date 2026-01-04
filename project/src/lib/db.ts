import Dexie, { Table } from 'dexie';
import type { Product, Category, Sale, SyncQueueItem, User, Alert } from '../types';

export class ProPhonePlusDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  sales!: Table<Sale>;
  syncQueue!: Table<SyncQueueItem>;
  users!: Table<User>;
  alerts!: Table<Alert>;
  images!: Table<{ id: string; data: string; synced: boolean }>;

  constructor() {
    super('ProPhonePlusDB');
    this.version(1).stores({
      products: 'id, name, category, createdBy, synced, deleted, updatedAt',
      categories: 'id, name, synced, deleted',
      sales: 'id, productId, soldBy, synced, createdAt',
      syncQueue: 'id, collection, documentId, operation, timestamp',
      users: 'id, email, role',
      alerts: 'id, productId, dismissed',
      images: 'id, synced',
    });
    this.version(2).stores({
      products: 'id, name, category, subcategory, createdBy, synced, deleted, updatedAt',
      categories: 'id, name, synced, deleted',
      sales: 'id, productId, soldBy, synced, createdAt',
      syncQueue: 'id, collection, documentId, operation, timestamp',
      users: 'id, email, role',
      alerts: 'id, productId, dismissed',
      images: 'id, synced',
    });
  }
}

export const localDb = new ProPhonePlusDB();

const DEFAULT_CATEGORIES = [
  { name: 'Smartphones', subcategories: ['iPhone', 'Samsung', 'Xiaomi', 'Huawei'] },
  { name: 'Accessories', subcategories: ['Cases', 'Chargers', 'Headphones', 'Screen Protectors'] },
  { name: 'Tablets', subcategories: ['iPad', 'Android Tablets', 'Windows Tablets'] },
  { name: 'Smartwatches', subcategories: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit'] },
];

export async function initializeDefaultData(): Promise<void> {
  const categoriesCount = await localDb.categories.count();

  if (categoriesCount === 0) {
    const now = Date.now();
    const defaultCategories: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
      id: `cat-${now}-${index}`,
      name: cat.name,
      subcategories: cat.subcategories,
      createdAt: now,
      updatedAt: now,
      synced: true,
      deleted: false,
    }));

    await localDb.categories.bulkAdd(defaultCategories);
  }
}

export async function clearAllData(): Promise<void> {
  await localDb.products.clear();
  await localDb.categories.clear();
  await localDb.sales.clear();
  await localDb.syncQueue.clear();
  await localDb.alerts.clear();
  await localDb.images.clear();
}

export async function getUnsyncedCount(): Promise<number> {
  const products = await localDb.products.where('synced').equals(0).count();
  const categories = await localDb.categories.where('synced').equals(0).count();
  const sales = await localDb.sales.where('synced').equals(0).count();
  return products + categories + sales;
}
