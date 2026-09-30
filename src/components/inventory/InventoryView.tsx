import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  ChefHat,
  Search,
  X,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Product, Ingredient } from '../../types/pos';

export const InventoryView: React.FC = () => {
  const {
    products,
    categories,
    ingredients,
    saveProduct,
    deleteProduct,
    saveIngredient,
    deleteIngredient,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'ingredients' | 'categories'>('products');
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<import('../../types/pos').Category | null>(null);
  const [catNameFr, setCatNameFr] = useState('');
  const [catNameAr, setCatNameAr] = useState('');
  const [catIcon, setCatIcon] = useState('🍲');

  // Form states for Product
  const [prodName, setProdName] = useState('');
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.id || '');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodCostPrice, setProdCostPrice] = useState<number>(0);
  const [prodStock, setProdStock] = useState<number>(0);
  const [prodMinStock, setProdMinStock] = useState<number>(5);
  const [prodSku, setProdSku] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [variantLPrice, setVariantLPrice] = useState<number>(350);
  const [variantXLPrice, setVariantXLPrice] = useState<number>(700);

  // Form states for Ingredient
  const [ingName, setIngName] = useState('');
  const [ingUnit, setIngUnit] = useState<'kg' | 'g' | 'l' | 'ml' | 'piece'>('kg');
  const [ingStock, setIngStock] = useState<number>(0);
  const [ingMinStock, setIngMinStock] = useState<number>(5);
  const [ingCost, setIngCost] = useState<number>(0);

  // Low stock counters
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const lowStockIngredients = ingredients.filter((i) => i.stock <= i.minStock);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdNameAr('');
    setProdCategory(categories[0]?.id || '');
    setProdPrice(400);
    setProdCostPrice(180);
    setProdStock(20);
    setProdMinStock(5);
    setProdSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setProdImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80');
    setProdDescription('');
    setHasVariants(false);
    setVariantLPrice(350);
    setVariantXLPrice(700);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdNameAr(p.nameAr || '');
    setProdCategory(p.categoryId);
    setProdPrice(p.price);
    setProdCostPrice(p.costPrice || 0);
    setProdStock(p.stock);
    setProdMinStock(p.minStock);
    setProdSku(p.sku);
    setProdImage(p.image);
    setProdDescription(p.description || '');
    const isVar = Boolean((p.variants && p.variants.length > 0) || p.categoryId === 'cat-pizza');
    setHasVariants(isVar);
    setVariantLPrice(p.variants?.find((v) => v.name === 'L')?.price || p.price);
    setVariantXLPrice(p.variants?.find((v) => v.name === 'XL')?.price || p.price * 2);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    let variants = editingProduct?.variants;
    let addons = editingProduct?.addons;

    if (hasVariants) {
      variants = [
        { id: `var-L`, name: 'L', nameAr: 'حجم L', price: Number(variantLPrice) },
        { id: `var-XL`, name: 'XL', nameAr: 'حجم XL', price: Number(variantXLPrice) },
      ];
      if (!addons || addons.length === 0) {
        addons = [
          { id: 'addon-1', name: 'Sauce blanche', nameAr: 'صلصة بيضاء', price: 100 },
          { id: 'addon-2', name: 'Fromage extra', nameAr: 'فرماج', price: 150 },
        ];
      }
    } else {
      variants = undefined;
    }

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: prodName,
      nameAr: prodNameAr,
      categoryId: prodCategory,
      price: hasVariants ? Number(variantLPrice) : Number(prodPrice),
      costPrice: Number(prodCostPrice),
      stock: Number(prodStock),
      minStock: Number(prodMinStock),
      sku: prodSku,
      image: prodImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      description: prodDescription,
      isAvailable: true,
      variants,
      addons,
      recipe: editingProduct?.recipe || [],
    };
    saveProduct(productData);
    setIsProductModalOpen(false);
  };

  const handleOpenAddIngredient = () => {
    setEditingIngredient(null);
    setIngName('');
    setIngUnit('kg');
    setIngStock(10);
    setIngMinStock(3);
    setIngCost(500);
    setIsIngredientModalOpen(true);
  };

  const handleOpenEditIngredient = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setIngName(ing.name);
    setIngUnit(ing.unit);
    setIngStock(ing.stock);
    setIngMinStock(ing.minStock);
    setIngCost(ing.costPerUnit);
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = () => {
    const ingredientData: Ingredient = {
      id: editingIngredient ? editingIngredient.id : `ing-${Date.now()}`,
      name: ingName,
      unit: ingUnit,
      stock: Number(ingStock),
      minStock: Number(ingMinStock),
      costPerUnit: Number(ingCost),
    };
    saveIngredient(ingredientData);
    setIsIngredientModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-hidden p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-blue-400" />
            <span>Gestion du Stock & Fiches Techniques (Recettes)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Contrôle des stocks de produits finis, matières premières et calcul de la marge (Food Cost)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'products' ? (
            <button
              onClick={handleOpenAddProduct}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Plat / Produit</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddIngredient}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Matière Première</span>
            </button>
          )}
        </div>
      </div>

      {/* Low stock alert banner */}
      {(lowStockProducts.length > 0 || lowStockIngredients.length > 0) && (
        <div className="my-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <b>Alerte Stock Faible :</b> {lowStockProducts.length} produits et {lowStockIngredients.length} matières premières ont atteint leur seuil minimal !
            </span>
          </div>
          <span className="font-bold underline cursor-pointer">Voir les réapprovisionnements</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-3 shrink-0">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Plats & Produits Finis ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition ${
              activeTab === 'ingredients'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Matières Premières ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Catégories ({categories.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer la liste..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-[#0a0f1d] custom-scrollbar">
        {activeTab === 'products' ? (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="p-3.5">Plat / Produit</th>
                <th className="p-3.5">SKU / Code</th>
                <th className="p-3.5">Catégorie</th>
                <th className="p-3.5 text-right">Prix Vente</th>
                <th className="p-3.5 text-right">Food Cost</th>
                <th className="p-3.5 text-right">Marge Brute</th>
                <th className="p-3.5 text-center">Stock</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {products
                .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
                .map((product) => {
                  const cat = categories.find((c) => c.id === product.categoryId);
                  const cost = product.costPrice || 0;
                  const profit = product.price - cost;
                  const marginPct = product.price > 0 ? Math.round((profit / product.price) * 100) : 0;
                  const isLow = product.stock <= product.minStock;

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-white">{product.name}</div>
                            {product.nameAr && (
                              <div className="text-[10px] text-slate-400">{product.nameAr}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{product.sku}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px]">
                          {cat?.name || 'Général'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-amber-400">
                        {product.price} {settings.currency}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-400">
                        {cost} {settings.currency}
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="font-bold text-emerald-400">+{profit} {settings.currency}</span>{' '}
                        <span className="text-[10px] text-slate-400">({marginPct}%)</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                            product.stock === 0
                              ? 'bg-red-950/60 text-red-400 border border-red-800'
                              : isLow
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {product.stock} portions
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Supprimer ${product.name} ?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-900/40"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        ) : activeTab === 'ingredients' ? (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="p-3.5">Matière Première</th>
                <th className="p-3.5">Unité</th>
                <th className="p-3.5 text-right">Coût Unitaire</th>
                <th className="p-3.5 text-center">Stock Actuel</th>
                <th className="p-3.5 text-center">Seuil Min.</th>
                <th className="p-3.5 text-center">État</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {ingredients
                .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
                .map((ing) => {
                  const isLow = ing.stock <= ing.minStock;
                  return (
                    <tr key={ing.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white">{ing.name}</td>
                      <td className="p-3.5 uppercase font-mono text-slate-400">{ing.unit}</td>
                      <td className="p-3.5 text-right font-black text-amber-400">
                        {ing.costPerUnit} {settings.currency} / {ing.unit}
                      </td>
                      <td className="p-3.5 text-center font-black text-white">
                        {ing.stock} {ing.unit}
                      </td>
                      <td className="p-3.5 text-center text-slate-400 font-mono">
                        {ing.minStock} {ing.unit}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                            isLow
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {isLow ? 'À réapprovisionner' : 'Normal'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditIngredient(ing)}
                            className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Supprimer ${ing.name} ?`)) {
                                deleteIngredient(ing.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-900/40"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="p-3.5">Icône</th>
                <th className="p-3.5">Nom Catégorie (Français)</th>
                <th className="p-3.5">الاسم بالعربية</th>
                <th className="p-3.5">Nom en Anglais</th>
                <th className="p-3.5 text-center">Nombre de Plats</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 text-xl">{cat.icon}</td>
                    <td className="p-3.5 font-bold text-white">{cat.name}</td>
                    <td className="p-3.5 font-bold text-amber-300 font-arabic">{cat.nameAr || '—'}</td>
                    <td className="p-3.5 font-medium text-slate-400">{cat.nameEn || '—'}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                        {count} plats
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCatNameFr(cat.name);
                            setCatNameAr(cat.nameAr || '');
                            setCatIcon(cat.icon);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0c1322] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nom (Français) :</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">الاسم (بالعربية) :</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={prodNameAr}
                    onChange={(e) => setProdNameAr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Catégorie :</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">SKU / Code :</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-600"
                  />
                  <span className="text-white font-bold text-xs">
                    Ce produit a des variantes de taille (ex: L / XL pour Pizza)
                  </span>
                </label>

                {hasVariants && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Prix Taille L ({settings.currency}) :</label>
                      <input
                        type="number"
                        value={variantLPrice}
                        onChange={(e) => setVariantLPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-black text-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Prix Taille XL ({settings.currency}) :</label>
                      <input
                        type="number"
                        value={variantXLPrice}
                        onChange={(e) => setVariantXLPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-black text-amber-400"
                      />
                    </div>
                    <div className="col-span-2 text-[11px] text-amber-300">
                      ✨ الإضافات التلقائية: صلصة بيضاء (100 DA) + فرماج (150 DA)
                    </div>
                  </div>
                )}
              </div>

              {!hasVariants && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Prix de Vente ({settings.currency}) :</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-black text-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Coût Estimé ({settings.currency}) :</label>
                    <input
                      type="number"
                      value={prodCostPrice}
                      onChange={(e) => setProdCostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Initial :</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Minimum (Alerte) :</label>
                  <input
                    type="number"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">URL Image (Photo HD) :</label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description courte :</label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-md shadow-blue-600/30"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingredient Modal */}
      {isIngredientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0c1322] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingIngredient ? 'Modifier Ingrédient' : 'Ajouter Matière Première'}
              </h3>
              <button onClick={() => setIsIngredientModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom matière :</label>
                <input
                  type="text"
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  placeholder="Ex: Viande hachée, Huile d'olive..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Unité :</label>
                  <select
                    value={ingUnit}
                    onChange={(e) => setIngUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="kg">kg (Kilogramme)</option>
                    <option value="g">g (Gramme)</option>
                    <option value="l">L (Litre)</option>
                    <option value="ml">ml (Millilitre)</option>
                    <option value="piece">Pièce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Coût / Unité ({settings.currency}) :</label>
                  <input
                    type="number"
                    value={ingCost}
                    onChange={(e) => setIngCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Actuel :</label>
                  <input
                    type="number"
                    value={ingStock}
                    onChange={(e) => setIngStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Min (Alerte) :</label>
                  <input
                    type="number"
                    value={ingMinStock}
                    onChange={(e) => setIngMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsIngredientModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveIngredient}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
