import { useState, useRef } from 'react';
import { Search, Download, ShoppingCart, Calendar, User, FileText, Eye, Upload, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { exportSalesToExcel, importSalesFromExcel, downloadSalesTemplate } from '../../lib/excel';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function Sales() {
  const { sales, refreshData } = useApp();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewingBill, setViewingBill] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
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
      await exportSalesToExcel(filteredSales);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    setImportResult(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await importSalesFromExcel(file, user.id, user.name, refreshData);
      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: 0,
        errors: ['Failed to import sales. Please check the file format.'],
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.sales.title}</h1>
          <p className="text-gray-500 mt-1">
            {t.sales.salesTotal.replace('{count}', String(filteredSales.length))}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
            onClick={handleImportClick}
          >
            {t.common.import}
          </Button>
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            {t.common.export}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{t.dashboard.totalSales}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredSales.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{language === 'fr' ? 'Articles vendus' : 'Items Sold'}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{t.dashboard.totalRevenue}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.sales.searchSales}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t.sales.allTime}</option>
            <option value="today">{t.sales.today}</option>
            <option value="week">{t.sales.thisWeek}</option>
            <option value="month">{t.sales.thisMonth}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t.products.product}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t.sales.soldBy}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t.products.quantity}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t.products.price}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t.sales.total}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t.sales.date}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {sale.productName}
                      </span>
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
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{sale.soldByName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {sale.quantity}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatCurrency(sale.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">
                    {formatCurrency(sale.totalPrice)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(sale.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t.sales.noSales}</p>
            </div>
          )}
        </div>
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

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={language === 'fr' ? 'Importer des ventes' : 'Import Sales'}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              {language === 'fr'
                ? 'Le fichier Excel doit contenir ces colonnes :'
                : 'The Excel file must contain these columns:'}
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>{language === 'fr' ? 'Nom du produit' : 'Product Name'}</li>
              <li>{language === 'fr' ? 'Quantité' : 'Quantity'}</li>
              <li>{language === 'fr' ? 'Prix unitaire' : 'Unit Price'}</li>
              <li>{language === 'fr' ? 'Vendu par' : 'Sold By Name'}</li>
              <li>{language === 'fr' ? 'Date (Optionnel)' : 'Date (Optional)'}</li>
            </ul>
          </div>

          <Button
            variant="secondary"
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={downloadSalesTemplate}
            className="w-full"
          >
            {language === 'fr' ? 'Télécharger le modèle' : 'Download Template'}
          </Button>

          <div className="border-t pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="sales-file-input"
            />
            <label htmlFor="sales-file-input">
              <Button
                as="span"
                variant="primary"
                icon={<Upload className="w-4 h-4" />}
                disabled={importing}
                className="w-full cursor-pointer"
              >
                {importing
                  ? language === 'fr'
                    ? 'Importation...'
                    : 'Importing...'
                  : language === 'fr'
                  ? 'Choisir un fichier'
                  : 'Choose File'}
              </Button>
            </label>
          </div>

          {importResult && (
            <div className="space-y-2">
              {importResult.success > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    {language === 'fr'
                      ? `✓ ${importResult.success} vente(s) importée(s) avec succès`
                      : `✓ ${importResult.success} sale(s) imported successfully`}
                  </p>
                </div>
              )}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    {language === 'fr' ? 'Erreurs :' : 'Errors:'}
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
