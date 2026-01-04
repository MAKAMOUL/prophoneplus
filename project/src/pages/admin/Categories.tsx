import { useState } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Package, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { addCategory, updateCategory, deleteCategory } from '../../lib/sync';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

export default function Categories() {
  const { categories, products, refreshData } = useApp();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    subcategories?: string[];
  } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [loading, setLoading] = useState(false);

  const getProductCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  const addSubcategory = () => {
    if (newSubcategory.trim() && !subcategories.includes(newSubcategory.trim())) {
      setSubcategories([...subcategories, newSubcategory.trim()]);
      setNewSubcategory('');
    }
  };

  const removeSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      await addCategory(newCategoryName.trim(), subcategories);
      await refreshData();
      setNewCategoryName('');
      setSubcategories([]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !newCategoryName.trim()) return;

    setLoading(true);
    try {
      await updateCategory(editingCategory.id, newCategoryName.trim(), subcategories);
      await refreshData();
      setEditingCategory(null);
      setNewCategoryName('');
      setSubcategories([]);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    const productCount = getProductCount(categoryName);
    if (productCount > 0) {
      alert(t.categories.deleteConfirm);
      return;
    }

    if (!confirm(t.categories.deleteConfirm)) return;

    try {
      await deleteCategory(categoryId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.categories.title}</h1>
          <p className="text-gray-500 mt-1">
            {t.categories.categoriesTotal.replace('{count}', String(categories.length))}
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          {t.categories.addCategory}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const productCount = getProductCount(category.name);
          return (
            <div
              key={category.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Package className="w-4 h-4" />
                      <span>{t.categories.productsCount.replace('{count}', String(productCount))}</span>
                    </div>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {category.subcategories.map((sub, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setNewCategoryName(category.name);
                      setSubcategories(category.subcategories || []);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteCategory(category.id, category.name)
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {!category.synced && (
                <span className="inline-block mt-3 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  {t.common.pendingSync}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.categories.noCategories}
          </h3>
          <p className="text-gray-500 mb-4">
            {t.categories.createFirst}
          </p>
          <Button onClick={() => setShowAddModal(true)}>{t.categories.addCategory}</Button>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewCategoryName('');
          setSubcategories([]);
          setNewSubcategory('');
        }}
        title={t.categories.addCategory}
        size="md"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.categories.categoryName}
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t.categories.categoryName}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategories
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubcategory();
                  }
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a subcategory"
              />
              <Button
                type="button"
                onClick={addSubcategory}
                icon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {subcategories.map((sub, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {sub}
                    <button
                      type="button"
                      onClick={() => removeSubcategory(idx)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setNewCategoryName('');
                setSubcategories([]);
                setNewSubcategory('');
              }}
              className="flex-1"
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {t.categories.addCategory}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
          setNewCategoryName('');
          setSubcategories([]);
          setNewSubcategory('');
        }}
        title={t.categories.editCategory}
        size="md"
      >
        <form onSubmit={handleEditCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.categories.categoryName}
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t.categories.categoryName}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategories
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubcategory();
                  }
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a subcategory"
              />
              <Button
                type="button"
                onClick={addSubcategory}
                icon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {subcategories.map((sub, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {sub}
                    <button
                      type="button"
                      onClick={() => removeSubcategory(idx)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingCategory(null);
                setNewCategoryName('');
                setSubcategories([]);
                setNewSubcategory('');
              }}
              className="flex-1"
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {t.common.update} {t.categories.title}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
