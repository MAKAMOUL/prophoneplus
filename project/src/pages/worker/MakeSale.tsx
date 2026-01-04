import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  AlertTriangle,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { addSale } from '../../lib/sync';
import Button from '../../components/common/Button';
import type { Product } from '../../types';

export default function MakeSale() {
  const { products, refreshData } = useApp();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    location.state?.product || null
  );
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [billImage, setBillImage] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.quantity > 0 &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (selectedProduct?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const totalPrice = selectedProduct
    ? selectedProduct.price * quantity
    : 0;

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} MAD`;
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSale = async () => {
    if (!selectedProduct || !user) return;

    setLoading(true);
    try {
      await addSale({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitPrice: selectedProduct.price,
        totalPrice,
        soldBy: user.id,
        soldByName: user.name,
        billUrl: billImage || undefined,
      });

      await refreshData();
      setSuccess(true);

      setTimeout(() => {
        setSelectedProduct(null);
        setQuantity(1);
        setSearch('');
        setSuccess(false);
        setBillImage(null);
      }, 2000);
    } catch (error) {
      console.error('Error making sale:', error);
      alert(t.makeSale.failedSale);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.makeSale.saleComplete}</h2>
        <p className="text-gray-500 text-center">
          {quantity}x {selectedProduct?.name}
          <br />
          {t.sales.total}: {formatCurrency(totalPrice)}
        </p>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">{t.makeSale.title}</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t.products.searchProducts}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>

        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
                setQuantity(1);
              }}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:border-blue-300 transition-colors"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.imageUrl || product.imageData ? (
                    <img
                      src={product.imageUrl || product.imageData}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">
                      {t.makeSale.available.replace('{count}', String(product.quantity))}
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t.makeSale.noProductsAvailable}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t.makeSale.title}</h1>
        <button
          onClick={() => setSelectedProduct(null)}
          className="text-blue-600 text-sm font-medium"
        >
          {t.makeSale.changeProduct}
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {selectedProduct.imageUrl || selectedProduct.imageData ? (
              <img
                src={selectedProduct.imageUrl || selectedProduct.imageData}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedProduct.name}
            </h2>
            <p className="text-gray-500">{selectedProduct.category}</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatCurrency(selectedProduct.price)}
            </p>
          </div>
        </div>

        {selectedProduct.quantity <= selectedProduct.minStock && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg mb-4 text-amber-700 text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>{t.makeSale.lowStock.replace('{count}', String(selectedProduct.quantity))}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.products.quantity}
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-6 h-6" />
            </button>
            <div className="w-20 text-center">
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= selectedProduct.quantity) {
                    setQuantity(val);
                  }
                }}
                className="w-full text-center text-2xl font-bold border-0 focus:ring-0"
                min="1"
                max={selectedProduct.quantity}
              />
              <p className="text-xs text-gray-500">
                max: {selectedProduct.quantity}
              </p>
            </div>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= selectedProduct.quantity}
              className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">{t.makeSale.subtotal}</span>
          <span className="font-medium">
            {quantity} x {formatCurrency(selectedProduct.price)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xl font-bold">
          <span>{t.sales.total}</span>
          <span className="text-green-600">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {language === 'fr' ? 'Facture / Reçu (Optionnel)' : 'Bill / Receipt (Optional)'}
        </label>
        {billImage ? (
          <div className="relative">
            <img
              src={billImage}
              alt="Bill"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => setBillImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {language === 'fr' ? 'Cliquez pour télécharger' : 'Click to upload'}
            </span>
            <input
              type="file"
              onChange={handleBillUpload}
              accept="image/*"
              className="hidden"
            />
          </label>
        )}
      </div>

      <Button
        onClick={handleSale}
        loading={loading}
        className="w-full py-4 text-lg"
        icon={<ShoppingCart className="w-6 h-6" />}
      >
        {t.makeSale.completeSale}
      </Button>
    </div>
  );
}
