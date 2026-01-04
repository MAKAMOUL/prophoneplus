import { useState, useRef } from 'react';
import { Search, Download, ShoppingCart, Calendar, User, FileText, Eye, Upload, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { exportSalesToExcel } from '../../lib/excel';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function MySales() {
  const { sales } = useApp();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewingBill, setViewingBill] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSales = sales
    .filter((sale) => {
      const matchesSearch =
        sale.productName.toLowerCase().includes(search.toLowerCase()) ||
        sale.soldByName.toLowerCase().includes(search.toLowerCase());

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const saleDate = new Date(sale.createdAt);
        const today = new Date();

        if (dateFilter === 'today') {
          matchesDate = saleDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = saleDate >= weekAgo;
        } else if (dateFilter === 'month') {
          matchesDate =
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + sale.totalPrice,
    0
  );
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} MAD`;
  };

  const handleExport = async () => {
    try {
      await exportSalesToExcel(filteredSales, 'sales');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    alert(language === 'fr' ? 'Fonctionnalité d\'importation à venir' : 'Import functionality coming soon');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t.sales.title}</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            {t.common.export}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t.common.import}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/worker/sell')}
          >
            {t.makeSale.title}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{t.dashboard.totalSales}</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredSales.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{language === 'fr' ? 'Articles vendus' : 'Items Sold'}</p>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{t.dashboard.totalRevenue}</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t.sales.searchSales}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        >
          <option value="all">{t.sales.allTime}</option>
          <option value="today">{t.sales.today}</option>
          <option value="week">{t.sales.thisWeek}</option>
          <option value="month">{t.sales.thisMonth}</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredSales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {sale.productName}
                    </h3>
                    {sale.billUrl && (
                      <button
                        onClick={() => setViewingBill(sale.billUrl!)}
                        className="text-blue-600 hover:text-blue-700"
                        title={language === 'fr' ? 'Voir la facture' : 'View bill'}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {sale.quantity} x {formatCurrency(sale.unitPrice)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <User className="w-3 h-3" />
                    <span>{sale.soldByName}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatCurrency(sale.totalPrice)}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(sale.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredSales.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t.sales.noSales}</p>
          </div>
        )}
      </div>

      {viewingBill && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingBill(null)}
        >
          <div className="bg-white rounded-xl p-4 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'fr' ? 'Facture / Reçu' : 'Bill / Receipt'}
              </h3>
              <button
                onClick={() => setViewingBill(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <img
              src={viewingBill}
              alt="Bill"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
