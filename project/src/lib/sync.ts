import { localDb } from './db';
import { supabase } from './supabase';
import type { Product, Category, Sale, SyncStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

type SyncCallback = (status: SyncStatus) => void;

let syncCallback: SyncCallback | null = null;

export function setSyncCallback(callback: SyncCallback): void {
  syncCallback = callback;
}

export function getOnlineStatus(): boolean {
  return navigator.onLine && supabase !== null;
}

function updateStatus(status: SyncStatus): void {
  if (syncCallback) {
    syncCallback(status);
  }
}

async function syncProductToSupabase(product: Product): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('products')
      .upsert({
        id: product.id,
        ref: product.ref,
        product_name: product.name,
        category: product.category,
        subcategory: product.subcategory || null,
        quantity: product.quantity,
        quantity_remaining: product.quantityRemaining || product.quantity,
        price: product.price,
        min_stock: product.minStock,
        inserted_by: product.createdBy,
        created_at: new Date(product.createdAt).toISOString(),
        updated_at: new Date(product.updatedAt).toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing product to Supabase:', error);
    throw error;
  }
}

async function syncCategoryToSupabase(category: Category): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('categories')
      .upsert({
        id: category.id,
        name: category.name,
        subcategories: category.subcategories || [],
        created_at: new Date(category.createdAt).toISOString(),
        updated_at: new Date(category.updatedAt).toISOString(),
        deleted: category.deleted || false,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing category to Supabase:', error);
    throw error;
  }
}

async function syncSaleToSupabase(sale: Sale): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('sales')
      .upsert({
        id: sale.id,
        product_id: sale.productId,
        product_name: sale.productName,
        quantity: sale.quantity,
        unit_price: sale.unitPrice,
        total_price: sale.totalPrice,
        sold_by: sale.soldBy,
        sold_by_name: sale.soldByName,
        bill_url: sale.billUrl || null,
        created_at: new Date(sale.createdAt).toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing sale to Supabase:', error);
    throw error;
  }
}

export async function syncAllData(): Promise<void> {
  if (!supabase) {
    updateStatus('online');
    return;
  }

  updateStatus('syncing');

  try {
    const products = await localDb.products.toArray();
    const categories = await localDb.categories.toArray();
    const sales = await localDb.sales.toArray();

    for (const product of products) {
      if (!product.synced) {
        await syncProductToSupabase(product);
        await localDb.products.update(product.id, { synced: true });
      }
    }

    for (const category of categories) {
      if (!category.synced) {
        await syncCategoryToSupabase(category);
        await localDb.categories.update(category.id, { synced: true });
      }
    }

    for (const sale of sales) {
      if (!sale.synced) {
        await syncSaleToSupabase(sale);
        await localDb.sales.update(sale.id, { synced: true });
      }
    }

    updateStatus('online');
  } catch (error) {
    console.error('Sync error:', error);
    updateStatus('offline');
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'synced' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const now = Date.now();
  const id = uuidv4();
  const ref = `STK${now}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newProduct: Product = {
    ...product,
    id,
    ref,
    createdAt: now,
    updatedAt: now,
    synced: false,
  };

  await localDb.products.add(newProduct);

  if (supabase && navigator.onLine) {
    try {
      await syncProductToSupabase(newProduct);
      await localDb.products.update(id, { synced: true });
    } catch (error) {
      console.error('Failed to sync product:', error);
    }
  }

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const now = Date.now();

  await localDb.products.update(id, {
    ...updates,
    updatedAt: now,
    synced: false,
  });

  if (supabase && navigator.onLine) {
    try {
      const product = await localDb.products.get(id);
      if (product) {
        await syncProductToSupabase(product);
        await localDb.products.update(id, { synced: true });
      }
    } catch (error) {
      console.error('Failed to sync product update:', error);
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await localDb.products.delete(id);
}

export async function addCategory(name: string, subcategories?: string[]): Promise<Category> {
  const now = Date.now();
  const newCategory: Category = {
    id: uuidv4(),
    name,
    subcategories: subcategories || [],
    createdAt: now,
    updatedAt: now,
    synced: false,
  };

  await localDb.categories.add(newCategory);

  if (supabase && navigator.onLine) {
    try {
      await syncCategoryToSupabase(newCategory);
      await localDb.categories.update(newCategory.id, { synced: true });
    } catch (error) {
      console.error('Failed to sync category:', error);
    }
  }

  return newCategory;
}

export async function updateCategory(id: string, name: string, subcategories?: string[]): Promise<void> {
  await localDb.categories.update(id, {
    name,
    subcategories: subcategories || [],
    updatedAt: Date.now(),
    synced: false,
  });

  if (supabase && navigator.onLine) {
    try {
      const category = await localDb.categories.get(id);
      if (category) {
        await syncCategoryToSupabase(category);
        await localDb.categories.update(id, { synced: true });
      }
    } catch (error) {
      console.error('Failed to sync category update:', error);
    }
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await localDb.categories.update(id, {
    deleted: true,
    updatedAt: Date.now(),
    synced: false,
  });

  if (supabase && navigator.onLine) {
    try {
      const category = await localDb.categories.get(id);
      if (category) {
        await syncCategoryToSupabase(category);
        await localDb.categories.update(id, { synced: true });
      }
    } catch (error) {
      console.error('Failed to sync category deletion:', error);
    }
  }
}

export async function addSale(sale: Omit<Sale, 'id' | 'synced' | 'createdAt'>): Promise<Sale> {
  const newSale: Sale = {
    ...sale,
    id: uuidv4(),
    createdAt: Date.now(),
    synced: false,
  };

  await localDb.sales.add(newSale);

  const product = await localDb.products.get(sale.productId);
  if (product) {
    const newQuantity = product.quantity - sale.quantity;
    await updateProduct(sale.productId, {
      quantity: newQuantity,
    });
  }

  if (supabase && navigator.onLine) {
    try {
      await syncSaleToSupabase(newSale);
      await localDb.sales.update(newSale.id, { synced: true });
    } catch (error) {
      console.error('Failed to sync sale:', error);
    }
  }

  return newSale;
}

export async function deleteSale(id: string): Promise<void> {
  const sale = await localDb.sales.get(id);
  if (sale) {
    const product = await localDb.products.get(sale.productId);
    if (product) {
      const newQuantity = product.quantity + sale.quantity;
      await updateProduct(sale.productId, {
        quantity: newQuantity,
      });
    }
    await localDb.sales.delete(id);
  }
}

export async function saveProductImage(productId: string, imageData: string): Promise<void> {
  await localDb.images.put({
    id: productId,
    data: imageData,
    synced: false,
  });

  await localDb.products.update(productId, {
    imageData,
    synced: false,
  });
}

export async function getProductImage(productId: string): Promise<string | null> {
  const image = await localDb.images.get(productId);
  return image?.data || null;
}

export async function loadDataFromSupabase(): Promise<void> {
  if (!supabase) {
    console.error('Cannot load data: Supabase client is not initialized');
    return;
  }

  if (!navigator.onLine) {
    console.warn('Cannot load data: Browser is offline');
    return;
  }

  console.log('Loading data from Supabase...');

  try {
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      console.log(`Loaded ${productsData?.length || 0} products from Supabase`);
    }

    if (productsData) {
      for (const item of productsData) {
        const existingProduct = await localDb.products.get(item.id);
        const cloudUpdatedAt = new Date(item.updated_at).getTime();

        if (!existingProduct) {
          const product: Product = {
            id: item.id,
            ref: item.ref,
            name: item.product_name,
            category: item.category,
            subcategory: item.subcategory,
            quantity: item.quantity,
            quantityRemaining: item.quantity_remaining,
            price: parseFloat(item.price) || 0,
            minStock: item.min_stock,
            createdBy: item.inserted_by || 'unknown',
            createdAt: new Date(item.created_at).getTime(),
            updatedAt: cloudUpdatedAt,
            synced: true,
          };
          await localDb.products.add(product);
        } else if (cloudUpdatedAt > existingProduct.updatedAt) {
          await localDb.products.update(item.id, {
            ref: item.ref,
            name: item.product_name,
            category: item.category,
            subcategory: item.subcategory,
            quantity: item.quantity,
            quantityRemaining: item.quantity_remaining,
            price: parseFloat(item.price) || 0,
            minStock: item.min_stock,
            updatedAt: cloudUpdatedAt,
            synced: true,
          });
        }
      }
    }

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      console.log(`Loaded ${categoriesData?.length || 0} categories from Supabase`);
    }

    if (categoriesData) {
      for (const item of categoriesData) {
        const existingCategory = await localDb.categories.get(item.id);
        const cloudUpdatedAt = new Date(item.updated_at).getTime();

        if (!existingCategory) {
          const category: Category = {
            id: item.id,
            name: item.name,
            subcategories: item.subcategories || [],
            createdAt: new Date(item.created_at).getTime(),
            updatedAt: cloudUpdatedAt,
            synced: true,
            deleted: item.deleted || false,
          };
          await localDb.categories.add(category);
        } else if (cloudUpdatedAt > existingCategory.updatedAt) {
          await localDb.categories.update(item.id, {
            name: item.name,
            subcategories: item.subcategories || [],
            updatedAt: cloudUpdatedAt,
            synced: true,
            deleted: item.deleted || false,
          });
        }
      }
    }

    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('Error fetching sales:', salesError);
    } else {
      console.log(`Loaded ${salesData?.length || 0} sales from Supabase`);
    }

    if (salesData) {
      for (const item of salesData) {
        const existingSale = await localDb.sales.get(item.id);
        if (!existingSale) {
          const sale: Sale = {
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price) || 0,
            totalPrice: parseFloat(item.total_price) || 0,
            soldBy: item.sold_by,
            soldByName: item.sold_by_name,
            billUrl: item.bill_url,
            createdAt: new Date(item.created_at).getTime(),
            synced: true,
          };
          await localDb.sales.add(sale);
        }
      }
    }
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
  }
}
