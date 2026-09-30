import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  Percent,
  X,
  MessageSquare,
  AlertCircle,
  Tag,
  Check,
  ChevronDown,
  Sparkles,
  UtensilsCrossed,
  LayoutGrid,
} from 'lucide-react';
import { Product, ProductVariant, ProductAddon, Table } from '../../types/pos';

interface PosTerminalProps {
  onOpenTableModal: () => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({ onOpenTableModal }) => {
  const {
    products,
    categories,
    tables,
    cart,
    selectedTable,
    setSelectedTable,
    orderType,
    setOrderType,
    orderNote,
    setOrderNote,
    cartSubtotal,
    cartDiscountAmount,
    cartServiceCharge,
    cartTax,
    cartTotal,
    discountValue,
    discountType,
    setDiscount,
    addToCart,
    updateCartItemQty,
    removeCartItem,
    updateCartItemNote,
    clearCart,
    sendOrderToKitchen,
    setIsPaymentModalOpen,
    settings,
    t,
    language,
    showToast,
  } = useApp();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState<string>('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);
  const [customDiscountValue, setCustomDiscountValue] = useState<number>(discountValue);
  const [customDiscountType, setCustomDiscountType] = useState<'percentage' | 'fixed'>(discountType);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);

  // Pizza / Variant selection modal
  const [pizzaModalProduct, setPizzaModalProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);

  // Keyboard shortcuts for high-speed cashier operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        onOpenTableModal();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setIsDiscountModalOpen(true);
      } else if (e.key === 'F9' || (e.code === 'Space' && cart.length > 0 && !pizzaModalProduct)) {
        e.preventDefault();
        if (cart.length > 0) {
          setIsPaymentModalOpen(true);
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0) {
          setIsClearConfirmOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, onOpenTableModal, setIsPaymentModalOpen, pizzaModalProduct]);

  // Handle clicking on a product card
  const handleProductClick = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setPizzaModalProduct(product);
      setSelectedVariant(product.variants[0]);
      setSelectedAddons([]);
    } else {
      addToCart(product);
      showToast(`تمت إضافة ${product.nameAr || product.name}`, 'info');
    }
  };

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        activeCategoryId === 'all' || prod.categoryId === activeCategoryId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        (prod.nameAr && prod.nameAr.includes(q)) ||
        prod.sku.toLowerCase().includes(q);
      return matchesCategory && matchesSearch && prod.isAvailable;
    });
  }, [products, activeCategoryId, searchQuery]);

  const handleOpenItemNote = (itemId: string, currentNote?: string) => {
    setActiveNoteItemId(itemId);
    setItemNoteInput(currentNote || '');
  };

  const handleSaveItemNote = (itemId: string) => {
    updateCartItemNote(itemId, itemNoteInput.trim());
    setActiveNoteItemId(null);
    setItemNoteInput('');
  };

  const handleApplyDiscount = () => {
    setDiscount(Number(customDiscountValue) || 0, customDiscountType);
    setIsDiscountModalOpen(false);
    showToast(`تم تطبيق الخصم: ${customDiscountValue} ${customDiscountType === 'percentage' ? '%' : settings.currency}`, 'info');
  };

  // Status helper for Table
  const getTableStatusDisplay = (table: Table) => {
    if (table.status === 'occupied') {
      return { icon: '🔴', label: 'مشغولة', color: 'text-red-400 bg-red-950/60 border-red-800/60' };
    }
    if (table.status === 'waiting') {
      return { icon: '🟡', label: 'طلب جاهز', color: 'text-amber-300 bg-amber-950/60 border-amber-700/60' };
    }
    return { icon: '🟢', label: 'متاحة', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#120a05] text-[#fef3c7] font-['Cairo',sans-serif] select-none">
      {/* ================= 2. PRODUCT AREA (CENTER COLUMN) ================= */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-[#3a2514]">
        {/* Top Controls: Search Bar & Luxury Categories Carousel */}
        <div className="p-4 border-b border-[#362111] bg-[#180f08] space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن طبق، بيتزا، مشروب أو رمز SKU..."
              className="w-full pr-11 pl-10 py-2.5 bg-[#22150b] border border-[#422915] rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-bold text-sm transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${
                activeCategoryId === 'all'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-950/80 scale-102 border border-amber-400/50'
                  : 'bg-[#24170d] text-amber-200/80 border border-[#3e2715] hover:bg-[#322012] hover:text-white'
              }`}
            >
              <span>🍽</span>
              <span>جميع الأقسام</span>
            </button>

            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-950/80 scale-102 border border-amber-400/50'
                      : 'bg-[#24170d] text-amber-200/80 border border-[#3e2715] hover:bg-[#322012] hover:text-white'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.nameAr || cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-3">
              <AlertCircle className="w-12 h-12 text-stone-600" />
              <p className="text-base font-bold text-stone-400">لا توجد أطباق مطابقة</p>
              <p className="text-xs text-stone-600">جرّب البحث باسم آخر أو اختر قسمًا مختلفًا</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                const cartItem = cart.find((i) => i.productId === product.id);
                const cartQuantity = cartItem ? cartItem.quantity : 0;
                const isPizza = Boolean(product.variants && product.variants.length > 0);

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleProductClick(product)}
                    className={`group relative flex flex-col bg-[#1c1209] border rounded-2xl overflow-hidden transition-all duration-150 text-right active:scale-97 select-none cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-red-950/50'
                        : cartQuantity > 0
                        ? 'border-amber-500 shadow-xl shadow-amber-950/60 ring-2 ring-amber-500/50'
                        : 'border-[#382313] hover:border-amber-500/60 hover:bg-[#25180c]'
                    }`}
                  >
                    {/* Food Photo Container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#24170d]">
                      <img
                        src={product.image}
                        alt={product.nameAr || product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1209] via-transparent to-transparent opacity-85" />

                      {/* Stock / Availability Status Badge */}
                      <div className="absolute top-2 right-2">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white font-black text-[10px] shadow backdrop-blur-sm">
                            نفد المخزون
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-black font-black text-[10px] shadow backdrop-blur-sm">
                            متبقي {product.stock}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-black/70 text-emerald-300 font-bold text-[10px] backdrop-blur-sm border border-emerald-500/30">
                            متوفر
                          </span>
                        )}
                      </div>

                      {/* Quantity in Cart Badge */}
                      {cartQuantity > 0 && (
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-amber-500 text-[#120a05] font-black text-xs flex items-center justify-center shadow-lg shadow-amber-900/60 animate-bounce border border-yellow-200">
                          {cartQuantity}
                        </div>
                      )}

                      {/* Pizza Size Indicator */}
                      {isPizza && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-600/90 text-white font-extrabold text-[10px] border border-amber-300/40">
                          L / XL
                        </div>
                      )}
                    </div>

                    {/* Food Metadata */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-sm text-[#fffdfa] leading-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {product.nameAr || product.name}
                        </h3>
                        {product.name && product.name !== product.nameAr && (
                          <p className="text-[10px] text-stone-400 font-medium line-clamp-1 mt-0.5">
                            {product.name}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="font-mono font-black text-amber-400 text-base">
                          {product.price}{' '}
                          <span className="text-xs font-bold text-amber-300">{settings.currency}</span>
                        </div>

                        {/* Touch '+' Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOutOfStock) handleProductClick(product);
                          }}
                          disabled={isOutOfStock}
                          className="w-8 h-8 rounded-xl bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-950/50 active:scale-95 transition"
                          title="إضافة إلى الطلب"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= 3. CART (RIGHT COLUMN) ================= */}
      <div className="w-96 bg-[#160e08] border-r border-[#3a2514] flex flex-col h-full overflow-hidden select-none shrink-0 shadow-2xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-[#362111] bg-[#1a1109] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-base font-black text-[#fffdfa]">الطلب الحالي</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#291b10] border border-[#4a301a] text-amber-300">
                {cart.length} أصناف
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setIsClearConfirmOpen(true)}
                className="text-xs text-red-400 hover:text-red-300 font-bold p-1 rounded-lg hover:bg-red-950/40 transition"
                title="تفريغ السلة (F2)"
              >
                مسح الطلب
              </button>
            )}
          </div>

          {/* Dine-in vs Takeaway Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#22150b] border border-[#3e2715]">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`py-1.5 text-xs font-extrabold rounded-lg transition ${
                orderType === 'dine_in'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              🍽 محلي (Sur place)
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-1.5 text-xs font-extrabold rounded-lg transition ${
                orderType === 'takeaway'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              🛍 سفري (Emporter)
            </button>
            <button
              onClick={() => { setOrderType('delivery'); setSelectedTable(null); }}
              className={`flex-1 min-h-11 px-3 py-2 rounded-xl text-xs font-black transition ${orderType === 'delivery' ? 'bg-amber-600 text-white' : 'bg-[#24170d] text-stone-300 border border-[#3e2715]'}`}
            >Livraison</button>
          </div>

          {/* Table Selector with Status Badge */}
          {orderType === 'dine_in' && (
            <button
              onClick={onOpenTableModal}
              className="w-full p-2.5 rounded-xl bg-[#22150b] border border-[#422915] flex items-center justify-between text-xs font-bold hover:border-amber-500 transition group"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300">الطاولة:</span>
                <span className="text-white font-black text-sm">
                  {selectedTable ? selectedTable.name : 'اختر طاولة'}
                </span>
              </div>

              {selectedTable ? (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black border flex items-center gap-1 ${
                    getTableStatusDisplay(selectedTable).color
                  }`}
                >
                  <span>{getTableStatusDisplay(selectedTable).icon}</span>
                  <span>{getTableStatusDisplay(selectedTable).label}</span>
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 group-hover:underline">
                  تحديد (F4) ➔
                </span>
              )}
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-500 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#24170d] border border-[#3e2715] flex items-center justify-center text-2xl">
                🛒
              </div>
              <div>
                <p className="text-sm font-bold text-stone-400">السلة فارغة</p>
                <p className="text-xs text-stone-600 mt-1">المس أي طبق لإضافته فورا إلى الفاتورة</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-2xl bg-[#1c1209] border border-[#382313] hover:border-amber-500/50 transition flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-xs text-[#fffdfa] truncate">
                      {item.productNameAr || item.productName}
                    </div>

                    {/* Variant & Addons info */}
                    {(item.variantName || (item.addons && item.addons.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {item.variantName && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950/70 border border-amber-700/60 text-amber-300 font-bold text-[10px]">
                            حجم {item.variantName}
                          </span>
                        )}
                        {item.addons?.map((ad, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-[#2e1d10] border border-[#4a301a] text-stone-300 text-[10px]"
                          >
                            + {ad}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.note && (
                      <p className="text-[10px] text-amber-300/80 italic mt-0.5">
                        ملاحظة: {item.note}
                      </p>
                    )}
                  </div>

                  {/* Item Price */}
                  <div className="font-mono font-black text-amber-400 text-xs shrink-0">
                    {item.price * item.quantity} {settings.currency}
                  </div>
                </div>

                {/* Bottom Row: Quantity Controls, Note, Delete */}
                <div className="flex items-center justify-between pt-1 border-t border-[#291b10]">
                  {/* Quantity Touch Buttons */}
                  <div className="flex items-center gap-1 bg-[#24170d] p-0.5 rounded-xl border border-[#3e2715]">
                    <button
                      onClick={() => updateCartItemQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-[#2e1d10] hover:bg-amber-700 text-white flex items-center justify-center font-bold text-xs transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-black text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-[#2e1d10] hover:bg-amber-700 text-white flex items-center justify-center font-bold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenItemNote(item.id, item.note)}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        item.note
                          ? 'bg-amber-950/70 border-amber-600 text-amber-300'
                          : 'bg-[#24170d] border-[#3e2715] text-stone-400 hover:text-white'
                      }`}
                      title="ملاحظة للمطبخ"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="p-1.5 rounded-lg bg-[#24170d] border border-[#3e2715] text-stone-400 hover:text-red-400 hover:border-red-800 transition"
                      title="حذف من السلة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Item Note Modal/Popover */}
        {activeNoteItemId && (
          <div className="p-3 bg-[#24170d] border-t border-[#3e2715] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-stone-300">
              <span>إضافة ملاحظة خاصة للمطبخ:</span>
              <button
                onClick={() => setActiveNoteItemId(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={itemNoteInput}
              onChange={(e) => setItemNoteInput(e.target.value)}
              placeholder="مثال: بدون بصل، صوص زيادة..."
              className="w-full p-2 bg-[#1c1209] border border-[#422915] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setActiveNoteItemId(null)}
                className="px-2.5 py-1 rounded-lg bg-[#1c1209] text-stone-400 text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleSaveItemNote(activeNoteItemId)}
                className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold"
              >
                حفظ
              </button>
            </div>
          </div>
        )}

        {/* Financial Summary & Big Action Buttons */}
        <div className="p-4 border-t border-[#362111] bg-[#1a1109] space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-bold text-stone-200">
                {cartSubtotal} {settings.currency}
              </span>
            </div>

            {/* Discount Row */}
            <div className="flex justify-between items-center text-stone-400">
              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="flex items-center gap-1 text-amber-400 hover:underline"
              >
                <Tag className="w-3 h-3" />
                <span>الخصم:</span>
                {cartDiscountAmount > 0 && (
                  <span className="text-[10px] text-amber-300 font-bold">
                    ({discountValue} {discountType === 'percentage' ? '%' : settings.currency})
                  </span>
                )}
              </button>
              <span className="font-mono font-bold text-emerald-400">
                {cartDiscountAmount > 0 ? `-${cartDiscountAmount}` : '0'} {settings.currency}
              </span>
            </div>

            {/* Tax */}
            {settings.taxRate > 0 && (
              <div className="flex justify-between text-stone-400">
                <span>الضريبة ({settings.taxRate}%):</span>
                <span className="font-mono font-bold text-stone-200">
                  {cartTax} {settings.currency}
                </span>
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-2 border-t border-[#362111] flex justify-between items-baseline">
              <span className="text-sm font-black text-white">المجموع الإجمالي:</span>
              <div className="text-2xl font-black font-mono text-amber-400">
                {cartTotal} <span className="text-sm font-bold text-amber-300">{settings.currency}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Kitchen & Big ENCAISSER */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={sendOrderToKitchen}
                disabled={cart.length === 0}
                className="py-2.5 px-3 rounded-xl bg-[#26180c] border border-[#422915] text-amber-300 hover:bg-[#322012] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-97"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>إرسال للمطبخ</span>
              </button>

              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-[#26180c] border border-[#422915] text-stone-300 hover:bg-[#322012] hover:text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-97"
              >
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>خصم (F8)</span>
              </button>
            </div>

            {/* BIG ENCAISSER BUTTON */}
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={cart.length === 0}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-lg tracking-wider shadow-xl shadow-emerald-950/70 border border-emerald-400/40 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <CreditCard className="w-6 h-6" />
              <span>ENCAISSER (الدفع)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Clear Cart Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#1c1209] border border-[#422915] rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-black text-white">تأكيد إلغاء الطلب</h3>
              <p className="text-xs text-stone-400 mt-1">
                هل أنت متأكد من تفريغ السلة وإلغاء جميع المنتجات المضافة؟
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#26180c] border border-[#422915] text-stone-300 text-xs font-bold hover:bg-[#322012]"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setIsClearConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-950/50"
              >
                نعم، مسح الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pizza L / XL & Addons Selection Modal */}
      {pizzaModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#1c1209] border border-[#422915] rounded-3xl p-6 shadow-2xl space-y-5 text-right">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#362111] pb-3">
              <div>
                <span className="text-xs font-bold text-amber-400">تخصيص البيتزا</span>
                <h3 className="text-lg font-black text-white">
                  {pizzaModalProduct.nameAr || pizzaModalProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setPizzaModalProduct(null)}
                className="p-1.5 rounded-xl bg-[#26180c] text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Size Selector: L and XL */}
            <div>
              <label className="block text-xs font-black uppercase text-amber-300 tracking-wider mb-2">
                اختر الحجم (Size):
              </label>
              <div className="grid grid-cols-2 gap-3">
                {pizzaModalProduct.variants?.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/50 scale-102'
                          : 'bg-[#24170d] border-[#3e2715] text-stone-300 hover:bg-[#2e1d10]'
                      }`}
                    >
                      <span className="text-3xl font-black text-amber-400">{v.name}</span>
                      <span className="text-xs font-bold text-stone-400">{v.nameAr || `حجم ${v.name}`}</span>
                      <span className="text-sm font-black text-white mt-1">
                        {v.price} {settings.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Addons Selection: صلصة بيضاء (+100 DA) / فرماج (+150 DA) */}
            {pizzaModalProduct.addons && pizzaModalProduct.addons.length > 0 && (
              <div>
                <label className="block text-xs font-black uppercase text-amber-300 tracking-wider mb-2">
                  إضافات البيتزا (Suppléments):
                </label>
                <div className="space-y-2">
                  {pizzaModalProduct.addons.map((addon) => {
                    const isChecked = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
                          } else {
                            setSelectedAddons([...selectedAddons, addon]);
                          }
                        }}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                          isChecked
                            ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                            : 'bg-[#24170d] border-[#3e2715] text-stone-300 hover:bg-[#2e1d10]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border ${
                              isChecked
                                ? 'bg-amber-500 text-[#120a05] border-amber-400 font-black'
                                : 'border-[#4a301a] bg-[#1c1209]'
                            }`}
                          >
                            {isChecked && '✓'}
                          </div>
                          <span>{addon.nameAr || addon.name}</span>
                        </div>
                        <span className="font-mono font-black text-amber-400">
                          +{addon.price} {settings.currency}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Computed Total & Confirm */}
            <div className="pt-3 border-t border-[#362111] flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 font-bold block">السعر الإجمالي للقطعة:</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {(selectedVariant?.price || pizzaModalProduct.price) +
                    selectedAddons.reduce((s, a) => s + a.price, 0)}{' '}
                  <span className="text-xs font-bold text-amber-300">{settings.currency}</span>
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPizzaModalProduct(null)}
                  className="py-2.5 px-4 rounded-xl bg-[#26180c] border border-[#422915] text-stone-300 text-xs font-bold hover:bg-[#322012]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(pizzaModalProduct, {
                      variant: selectedVariant || undefined,
                      addons: selectedAddons,
                    });
                    setPizzaModalProduct(null);
                    showToast(`تمت إضافة ${pizzaModalProduct.nameAr} (${selectedVariant?.name || 'L'})`, 'success');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-950/60 active:scale-98 transition"
                >
                  إضافة للطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Discount Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#1c1209] border border-[#422915] rounded-3xl p-5 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-[#362111] pb-2">
              <h3 className="text-base font-black text-white">تطبيق خصم على الفاتورة</h3>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomDiscountType('percentage')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    customDiscountType === 'percentage'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-[#24170d] border-[#3e2715] text-stone-300'
                  }`}
                >
                  نسبة مئوية (%)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDiscountType('fixed')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    customDiscountType === 'fixed'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-[#24170d] border-[#3e2715] text-stone-300'
                  }`}
                >
                  مبلغ ثابت ({settings.currency})
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">
                  قيمة الخصم:
                </label>
                <input
                  type="number"
                  min="0"
                  value={customDiscountValue}
                  onChange={(e) => setCustomDiscountValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#22150b] border border-[#422915] rounded-xl text-white font-mono text-base font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Percentage Presets */}
              {customDiscountType === 'percentage' && (
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCustomDiscountValue(p)}
                      className="py-1.5 rounded-lg bg-[#24170d] border border-[#3e2715] text-xs font-bold text-amber-300 hover:bg-[#322012]"
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#362111]">
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#26180c] border border-[#422915] text-stone-400 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleApplyDiscount}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg"
              >
                تطبيق الخصم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
