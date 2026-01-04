import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  FolderOpen,
  Receipt,
  Globe,
  CheckCircle,
  XCircle,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function WorkerLayout() {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'online' | 'offline'>('online');
  const { user, signOut } = useAuth();
  const { syncStatus, alerts } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const prevStatus = useRef(syncStatus);

  useEffect(() => {
    if (prevStatus.current !== syncStatus && (syncStatus === 'online' || syncStatus === 'offline')) {
      setNotificationType(syncStatus);
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 4000);
      return () => clearTimeout(timer);
    }
    prevStatus.current = syncStatus;
  }, [syncStatus]);

  const navItems = [
    { path: '/worker/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { path: '/worker', icon: Package, label: t.nav.products },
    { path: '/worker/categories', icon: FolderOpen, label: t.nav.categories },
    { path: '/worker/my-sales', icon: Receipt, label: t.sales.title },
    { path: '/worker/alerts', icon: AlertTriangle, label: t.nav.alerts },
  ];

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'online':
        return { icon: Wifi, text: t.common.online, color: 'bg-green-500' };
      case 'offline':
        return { icon: WifiOff, text: t.common.offline, color: 'bg-red-500' };
      case 'syncing':
        return { icon: RefreshCw, text: t.common.syncing, color: 'bg-blue-500' };
    }
  };

  const status = getSyncStatusDisplay();
  const StatusIcon = status.icon;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-blue-900 text-white">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold">Pro Phone Plus</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'FR' : 'EN'}
            </button>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.color}`}
            >
              <StatusIcon
                className={`w-4 h-4 ${
                  syncStatus === 'syncing' ? 'animate-spin' : ''
                }`}
              />
              <span className="text-xs font-medium">{status.text}</span>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
              aria-label={t.common.signOut}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="px-4 pb-2 text-sm text-blue-200">
          {t.common.welcome}, {user?.name}
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/worker' && location.pathname === '/worker');
            const hasAlert =
              item.path === '/worker/alerts' && alerts.length > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 min-w-0 flex-1 relative ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 truncate">{item.label}</span>
                {hasAlert && (
                  <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {alerts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {showNotification && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-down ${
            notificationType === 'online'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notificationType === 'online' ? (
            <>
              <CheckCircle className="w-6 h-6" />
              <div>
                <div className="font-semibold">{t.common.online}</div>
                <div className="text-sm opacity-90">{t.common.connectionRestored || 'Connection restored'}</div>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6" />
              <div>
                <div className="font-semibold">{t.common.offline}</div>
                <div className="text-sm opacity-90">{t.common.workingOffline || 'Working offline'}</div>
              </div>
            </>
          )}
          <button
            onClick={() => setShowNotification(false)}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
