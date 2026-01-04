import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FolderOpen,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { products, sales, alerts, categories } = useApp();
  const { t, language } = useLanguage();

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const lowStockCount = products.filter((p) => p.quantity <= p.minStock).length;
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const todaySales = sales.filter((sale) => {
    const today = new Date();
    const saleDate = new Date(sale.createdAt);
    return saleDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalPrice, 0);

  const recentSales = [...sales]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const stats = [
    {
      label: t.dashboard.totalProducts,
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products',
    },
    {
      label: t.dashboard.totalCategories,
      value: totalCategories,
      icon: FolderOpen,
      color: 'bg-teal-500',
      link: '/admin/categories',
    },
    {
      label: t.dashboard.totalSales,
      value: totalSales,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/sales',
    },
    {
      label: t.dashboard.lowStockItems,
      value: lowStockCount,
      icon: AlertTriangle,
      color: lowStockCount > 0 ? 'bg-red-500' : 'bg-gray-500',
      link: '/admin/alerts',
    },
  ];

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} MAD`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
        <p className="text-gray-500 mt-1">{t.dashboard.overview}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t.dashboard.revenueOverview}
            </h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-600">{t.dashboard.totalRevenue}</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-blue-600">{t.dashboard.todayRevenue}</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(todayRevenue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">
                  {todaySales.length} {language === 'fr' ? 'ventes' : 'sales'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t.dashboard.recentSales}</h2>
            <Link
              to="/admin/sales"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {t.common.viewAll}
            </Link>
          </div>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {sale.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {sale.quantity} x {formatCurrency(sale.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(sale.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t.dashboard.noSales}</p>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-800">
              {t.dashboard.lowStockAlerts}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.slice(0, 6).map((alert) => (
              <div
                key={alert.id}
                className="bg-white p-4 rounded-lg border border-amber-200"
              >
                <p className="font-medium text-gray-900">{alert.productName}</p>
                <p className="text-sm text-amber-600">
                  {alert.currentQuantity} {t.dashboard.left} ({t.dashboard.min}: {alert.minStock})
                </p>
              </div>
            ))}
          </div>
          {alerts.length > 6 && (
            <Link
              to="/admin/alerts"
              className="mt-4 inline-block text-amber-700 hover:text-amber-800 text-sm font-medium"
            >
              {t.dashboard.viewAllAlerts.replace('{count}', String(alerts.length))}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
