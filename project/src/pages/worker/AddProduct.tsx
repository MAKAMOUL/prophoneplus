import { useState } from 'react';
import { Package, Image as ImageIcon, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { addProduct, saveProductImage } from '../../lib/sync';
import Button from '../../components/common/Button';

export default function AddProduct() {
  const { categories, refreshData } = useApp();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const product = await addProduct({
        name,
        category,
        quantity,
        price,
        minStock,
        createdBy: user?.id || '',
      });

      if (image) {
        await saveProductImage(product.id, image);
      }

      await refreshData();
      setSuccess(true);

      setTimeout(() => {
        setName('');
        setCategory('');
        setQuantity(0);
        setPrice(0);
        setMinStock(5);
        setImage(undefined);
        setImagePreview('');
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      alert(language === 'fr' ? "Echec de l'ajout du produit" : 'Failed to add product');
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t.addProduct.success}
        </h2>
        <p className="text-gray-500">
          {language === 'fr'
            ? "Le produit a ete ajoute a l'inventaire"
            : 'The product has been added to inventory'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">{t.addProduct.title}</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.products.productImage}
          </label>
          <label className="block">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50">
                <p className="text-sm text-gray-600">
                  {language === 'fr' ? 'Appuyez pour telecharger' : 'Tap to upload image'}
                </p>
              </div>
            </div>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.products.productName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder={t.products.productName}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.products.category}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            required
          >
            <option value="">{t.products.selectCategory}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.products.price} ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            min="0"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'fr'
              ? 'Vous recevrez une alerte lorsque le stock atteindra ce niveau'
              : "You'll get an alert when stock reaches this level"}
          </p>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full py-3 text-base"
          icon={<Package className="w-5 h-5" />}
        >
          {t.addProduct.createProduct}
        </Button>
      </form>
    </div>
  );
}
