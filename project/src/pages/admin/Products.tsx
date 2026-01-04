import { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  Package,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  saveProductImage,
} from '../../lib/sync';
import { exportProductsToExcel, importProductsFromExcel } from '../../lib/excel';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import type { Product } from '../../types';

export default function Products() {
  const { products, categories, refreshData } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const product = await addProduct({
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        quantity: data.quantity,
        price: data.price,
        minStock: data.minStock,
        createdBy: user?.id || '',
      });

      if (data.image) {
        await saveProductImage(product.id, data.image);
      }

      await refreshData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      await updateProduct(editingProduct.id, {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        quantity: data.quantity,
        price: data.price,
        minStock: data.minStock,
      });

      if (data.image) {
        await saveProductImage(editingProduct.id, data.image);
      }

      await refreshData();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t.products.deleteConfirm)) return;

    try {
      await deleteProduct(productId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportProductsToExcel(products);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await importProductsFromExcel(file, user?.id || '', refreshData);
    } catch (error) {
      console.error('Import error:', error);
      alert(t.products.importFailed);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.products.title}</h1>
          <p className="text-gray-500 mt-1">
            {t.products.productsTotal.replace('{count}', String(products.length))}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            {t.common.export}
          </Button>
          <Button
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
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            {t.products.addProduct}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.products.searchProducts}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t.products.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
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
                  {t.products.category}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Subcategory
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t.products.quantity}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t.products.price}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t.products.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isLowStock = product.quantity <= product.minStock;
                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
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
                          {!product.synced && (
                            <span className="text-xs text-amber-600">
                              {t.common.pendingSync}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.category}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.subcategory || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isLowStock ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {isLowStock && (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {product.price.toFixed(2)} MAD
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t.products.noProducts}</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t.products.addProduct}
        size="lg"
      >
        <ProductForm
          categories={categories.map((c) => c.name)}
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddModal(false)}
          loading={loading}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        title={t.products.editProduct}
        size="lg"
      >
        {editingProduct && (
          <ProductForm
            categories={categories.map((c) => c.name)}
            initialData={editingProduct}
            onSubmit={handleEditProduct}
            onCancel={() => {
              setShowEditModal(false);
              setEditingProduct(null);
            }}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
}

interface ProductFormData {
  name: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number;
  minStock: number;
  image?: string;
}

interface ProductFormProps {
  categories: string[];
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  loading: boolean;
}

function ProductForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  loading,
}: ProductFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || 0);
  const [price, setPrice] = useState(initialData?.price || 0);
  const [minStock, setMinStock] = useState(initialData?.minStock || 5);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState(
    initialData?.imageUrl || initialData?.imageData || ''
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, category, subcategory, quantity, price, minStock, image });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.products.productName}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.products.category}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">{t.products.selectCategory}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter subcategory"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.products.quantity}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.products.price} (MAD)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.products.minStockLevel}
        </label>
        <input
          type="number"
          value={minStock}
          onChange={(e) => setMinStock(Number(e.target.value))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.products.productImage}
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <label className="flex-1">
            <div className="px-4 py-2.5 border border-gray-300 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50">
              <p className="text-sm text-gray-600">{t.products.clickToUpload}</p>
            </div>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          {t.common.cancel}
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initialData ? t.common.update : t.common.add} {t.products.product}
        </Button>
      </div>
    </form>
  );
}
