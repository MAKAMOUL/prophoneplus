import { AlertTriangle, X, CheckCircle, Package } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function WorkerAlerts() {
  const { alerts, dismissAlert, getLowStockProducts } = useApp();
  const { t, language } = useLanguage();
  const lowStockProducts = getLowStockProducts();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">{t.alerts.title}</h1>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-amber-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {alert.productName}
                  </h3>
                  <p className="text-sm text-amber-600 mt-1">
                    {alert.currentQuantity} {t.dashboard.left} ({t.dashboard.min}: {alert.minStock})
                  </p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'fr' ? 'Tout est bon!' : 'All Clear!'}
          </h3>
          <p className="text-gray-500">{t.alerts.noAlerts}</p>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              {language === 'fr'
                ? `Articles en stock faible (${lowStockProducts.length})`
                : `Low Stock Items (${lowStockProducts.length})`}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.imageUrl || product.imageData ? (
                    <img
                      src={product.imageUrl || product.imageData}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      product.quantity === 0 ? 'text-red-600' : 'text-amber-600'
                    }`}
                  >
                    {product.quantity}
                  </p>
                  <p className="text-xs text-gray-400">{t.dashboard.min}: {product.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
