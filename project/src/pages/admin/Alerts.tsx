import { Package, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function Alerts() {
  const { getLowStockProducts } = useApp();
  const { t, language } = useLanguage();
  const lowStockProducts = getLowStockProducts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.alerts.title}</h1>
        <p className="text-gray-500 mt-1">
          {t.alerts.alertsCount.replace('{count}', String(lowStockProducts.length))}
        </p>
      </div>

      {lowStockProducts.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {language === 'fr' ? `Produits en stock faible (${lowStockProducts.length})` : `Low Stock Products (${lowStockProducts.length})`}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">
                    {t.products.product}
                  </th>
                  <th className="text-right py-3 px-6 font-semibold text-gray-700">
                    {t.alerts.currentStock}
                  </th>
                  <th className="text-right py-3 px-6 font-semibold text-gray-700">
                    {t.alerts.minStock}
                  </th>
                  <th className="text-right py-3 px-6 font-semibold text-gray-700">
                    {language === 'fr' ? 'Manque' : 'Shortage'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => {
                  const shortage = product.minStock - product.quantity;
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.imageUrl || product.imageData ? (
                              <img
                                src={product.imageUrl || product.imageData}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-semibold ${
                            product.quantity === 0
                              ? 'text-red-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-gray-600">
                        {product.minStock}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {shortage > 0 && (
                          <span className="text-red-600 font-semibold">
                            -{shortage}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link
              to="/admin/products"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t.common.viewAll} {t.products.title.toLowerCase()}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.alerts.noAlerts}
          </h3>
          <p className="text-gray-500">
            {t.alerts.allStocked}
          </p>
        </div>
      )}
    </div>
  );
}
