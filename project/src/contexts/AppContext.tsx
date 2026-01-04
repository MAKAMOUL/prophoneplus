import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { localDb, initializeDefaultData } from '../lib/db';
import { setSyncCallback, getOnlineStatus, loadDataFromSupabase, syncAllData } from '../lib/sync';
import type { Product, Category, Sale, Alert, SyncStatus } from '../types';
import { useAuth } from './AuthContext';

interface AppContextType {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  alerts: Alert[];
  syncStatus: SyncStatus;
  refreshData: () => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  getLowStockProducts: () => Product[];
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online');

  const refreshData = useCallback(async () => {
    try {
      const [productsData, categoriesData, salesData, alertsData] =
        await Promise.all([
          localDb.products.filter((p) => !p.deleted).toArray(),
          localDb.categories.filter((c) => !c.deleted).toArray(),
          localDb.sales.toArray(),
          localDb.alerts.filter((a) => !a.dismissed).toArray(),
        ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setSales(salesData);
      setAlerts(alertsData);
      await checkLowStock(productsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  const checkLowStock = async (productsList: Product[]) => {
    const lowStockProducts = productsList.filter(
      (p) => p.quantity <= p.minStock && !p.deleted
    );

    for (const product of lowStockProducts) {
      const existingAlert = await localDb.alerts
        .where('productId')
        .equals(product.id)
        .first();

      if (!existingAlert || existingAlert.dismissed) {
        const alert: Alert = {
          id: `alert-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          currentQuantity: product.quantity,
          minStock: product.minStock,
          createdAt: Date.now(),
          dismissed: false,
        };

        if (existingAlert) {
          await localDb.alerts.update(existingAlert.id, {
            currentQuantity: product.quantity,
            dismissed: false,
          });
        } else {
          await localDb.alerts.add(alert);
        }
      }
    }

    const updatedAlerts = await localDb.alerts
      .filter((a) => !a.dismissed)
      .toArray();
    setAlerts(updatedAlerts);
  };

  const dismissAlert = async (alertId: string) => {
    await localDb.alerts.update(alertId, { dismissed: true });
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const getLowStockProducts = useCallback(() => {
    return products.filter((p) => p.quantity <= p.minStock && !p.deleted);
  }, [products]);

  useEffect(() => {
    setSyncCallback((status) => {
      setSyncStatus(status);
      if (status === 'online') {
        refreshData();
      }
    });
  }, [refreshData]);

  useEffect(() => {
    initializeDefaultData()
      .then(() => loadDataFromSupabase())
      .then(() => refreshData())
      .catch((error) => console.error('Initialization error:', error));
  }, [refreshData]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await syncAllData();
      await loadDataFromSupabase();
      await refreshData();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const value: AppContextType = {
    products,
    categories,
    sales,
    alerts,
    syncStatus,
    refreshData,
    dismissAlert,
    getLowStockProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
