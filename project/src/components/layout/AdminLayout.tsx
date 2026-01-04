import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    { path: '/admin', icon: LayoutDashboard, label: t.nav.dashboard },
    { path: '/admin/products', icon: Package, label: t.nav.products },
    { path: '/admin/categories', icon: FolderOpen, label: t.nav.categories },
    { path: '/admin/sales', icon: ShoppingCart, label: t.nav.sales },
    { path: '/admin/users', icon: Users, label: t.nav.users },
    { path: '/admin/alerts', icon: AlertTriangle, label: t.nav.alerts },
  ];

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'online':
        return { icon: Wifi, text: t.common.online, color: 'text-green-500' };
      case 'offline':
        return { icon: WifiOff, text: t.common.offline, color: 'text-red-500' };
      case 'syncing':
        return { icon: RefreshCw, text: t.common.syncing, color: 'text-blue-500' };
    }
  };

  const status = getSyncStatusDisplay();
  const StatusIcon = status.icon;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-950">
          <h1 className="text-xl font-bold text-white">Pro Phone Plus</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hasAlert =
              item.path === '/admin/alerts' && alerts.length > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
                {hasAlert && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-blue-800 rounded-lg p-4 mb-4">
            <div className="text-blue-100 text-sm mb-1">{user?.name}</div>
            <div className="text-blue-300 text-xs">{user?.email}</div>
            <div className="text-blue-300 text-xs uppercase mt-1">
              {user?.role === 'admin' ? t.auth.admin : t.auth.worker}
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center w-full px-4 py-3 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>{t.common.signOut}</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:ml-0" />

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'FR' : 'EN'}
            </button>

            <div
              className={`flex items-center gap-2 ${status.color}`}
            >
              <StatusIcon
                className={`w-5 h-5 ${
                  syncStatus === 'syncing' ? 'animate-spin' : ''
                }`}
              />
              <span className="text-sm font-medium hidden sm:inline">
                {status.text}
              </span>
            </div>

            {alerts.length > 0 && (
              <Link
                to="/admin/alerts"
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {alerts.length}
                </span>
              </Link>
            )}
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

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
