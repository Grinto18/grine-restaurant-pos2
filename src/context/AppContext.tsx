import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  Table,
  Order,
  OrderItem,
  Ingredient,
  RestaurantSettings,
  CashRegisterShift,
  Expense,
  AuditLog,
  User,
  Language,
  PaymentMethod,
  OrderStatus,
  Role,
} from '../types/pos';
import { StorageService } from '../services/storage';
import { PrintService } from '../services/printService';
import { getTranslation } from '../i18n/translations';
import { CloudSync } from '../services/cloudSync';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  // Settings & Localization
  settings: RestaurantSettings;
  updateSettings: (newSettings: RestaurantSettings) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: ReturnType<typeof getTranslation>;

  // Authentication & RBAC
  currentUser: User;
  switchUser: (userId: string) => void;
  hasPermission: (allowedRoles: Role[]) => boolean;

  // Active View Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Master Data
  categories: Category[];
  products: Product[];
  tables: Table[];
  orders: Order[];
  ingredients: Ingredient[];
  shifts: CashRegisterShift[];
  currentShift: CashRegisterShift | null;
  expenses: Expense[];
  auditLogs: AuditLog[];

  // POS Active Cart
  cart: OrderItem[];
  selectedTable: Table | null;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  orderNote: string;
  editingOrderId: string | null;

  // Cart Calculations
  cartSubtotal: number;
  cartDiscountAmount: number;
  cartServiceCharge: number;
  cartTax: number;
  cartTotal: number;

  // Cart Actions
  addToCart: (
    product: Product,
    options?: { variant?: import('../types/pos').ProductVariant; addons?: import('../types/pos').ProductAddon[]; note?: string }
  ) => void;
  updateCartItemQty: (itemId: string, delta: number) => void;
  setCartItemQty: (itemId: string, qty: number) => void;
  removeCartItem: (itemId: string) => void;
  updateCartItemNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  setDiscount: (value: number, type: 'percentage' | 'fixed') => void;
  setSelectedTable: (table: Table | null) => void;
  setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void;
  setOrderNote: (note: string) => void;

  // Business Operations
  sendOrderToKitchen: () => Order | null;
  completePayment: (method: PaymentMethod, received: number) => { order: Order; change: number } | null;
  cancelCurrentOrder: () => void;
  openTableOrder: (table: Table) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reprintReceipt: (order: Order) => void;

  // Inventory & Product Management
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  saveIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;
  updateTable: (table: Table) => void;
  deleteTable: (tableId: string) => void;
  saveTable: (table: Table) => void;

  // Cash Register & Shifts
  openNewShift: (openingCash: number) => void;
  closeCurrentShift: (actualCash: number, notes?: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  // UI Modals & Toasts
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master state initialized from persistent StorageService
  const [settings, setSettingsState] = useState<RestaurantSettings>(StorageService.getSettings);
  const [language, setLanguageState] = useState<Language>(settings.language || 'fr');
  const [currentUser, setCurrentUserState] = useState<User>(StorageService.getActiveUser);
  const [activeTab, setActiveTab] = useState<string>('pos');

  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories);
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts);
  const [tables, setTables] = useState<Table[]>(StorageService.getTables);
  const [orders, setOrders] = useState<Order[]>(StorageService.getOrders);
  const [ingredients, setIngredients] = useState<Ingredient[]>(StorageService.getIngredients);
  const [shifts, setShifts] = useState<CashRegisterShift[]>(StorageService.getShifts);
  const [expenses, setExpenses] = useState<Expense[]>(StorageService.getExpenses);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(StorageService.getAuditLogs);

  // Active POS Cart
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [orderNote, setOrderNote] = useState<string>('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Modals & Feedback
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        CloudSync.push('orders', orders), CloudSync.push('products', products),
        CloudSync.push('categories', categories), CloudSync.push('tables', tables),
        CloudSync.push('inventory', ingredients), CloudSync.push('settings', settings),
        CloudSync.push('shifts', shifts), CloudSync.push('customers', StorageService.getCustomers()),
      ]);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [orders, products, categories, tables, ingredients, settings, shifts]);

  // Translations
  const t = getTranslation(language);
  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const updated = { ...settings, language: lang };
    setSettingsState(updated);
    StorageService.saveSettings(updated);
  };

  const updateSettings = (newSettings: RestaurantSettings) => {
    setSettingsState(newSettings);
    StorageService.saveSettings(newSettings);
    StorageService.addAuditLog({
      action: 'Paramètres mis à jour',
      details: 'Modification des coordonnées / imprimante / taxes',
      userName: currentUser.name,
      type: 'settings',
    });
    showToast('Paramètres enregistrés avec succès', 'success');
  };

  const switchUser = (userId: string) => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserState(found);
      StorageService.setActiveUser(found);
      StorageService.addAuditLog({
        action: 'Changement d’utilisateur',
        details: `Connexion sous ${found.name} (${found.role})`,
        userName: found.name,
        type: 'auth',
      });
      showToast(`Connecté en tant que: ${found.name}`, 'info');
      // If kitchen role, auto switch to kds
      if (found.role === 'kitchen') {
        setActiveTab('kds');
      }
    }
  };

  const hasPermission = (allowedRoles: Role[]): boolean => {
    return allowedRoles.includes(currentUser.role);
  };

  // --- Cart Calculations ---
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartDiscountAmount = Math.min(
    cartSubtotal,
    discountType === 'percentage'
      ? Math.round((cartSubtotal * discountValue) / 100)
      : discountValue
  );

  const discountedBase = Math.max(0, cartSubtotal - cartDiscountAmount);
  const cartServiceCharge = Math.round((discountedBase * settings.serviceChargeRate) / 100);
  const cartTax = Math.round(((discountedBase + cartServiceCharge) * settings.taxRate) / 100);
  const cartTotal = discountedBase + cartServiceCharge + cartTax;

  // --- Cart Operations ---
  const addToCart = (
    product: Product,
    options?: { variant?: import('../types/pos').ProductVariant; addons?: import('../types/pos').ProductAddon[]; note?: string }
  ) => {
    if (product.stock <= 0) {
      showToast(`${product.name}: Rupture de stock !`, 'warning');
      return;
    }

    const variant = options?.variant;
    const addons = options?.addons || [];
    const variantPrice = variant ? variant.price : product.price;
    const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0);
    const finalPrice = variantPrice + addonsPrice;

    const itemTitle = variant ? `${product.name} (${variant.name})` : product.name;
    const itemTitleAr = variant ? `${product.nameAr || product.name} (${variant.nameAr || variant.name})` : (product.nameAr || product.name);

    const addonsNote = addons.length > 0 ? addons.map((a) => `+ ${a.nameAr || a.name} (${a.price} ${settings.currency})`).join(', ') : '';
    const finalNote = [options?.note, addonsNote].filter(Boolean).join(' | ');

    // Unique cart item identifier so same pizza with different size or addons gets separate line item
    const cartItemId = variant || addons.length > 0
      ? `item-${product.id}-${variant?.id || 'std'}-${addons.map((a) => a.id).sort().join('-')}`
      : `item-${product.id}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        if (item.quantity >= product.stock) {
          showToast(`Stock maximum atteint pour ${product.name}`, 'warning');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: item.quantity + 1 };
        return updated;
      } else {
        const newItem: OrderItem = {
          id: cartItemId,
          productId: product.id,
          productName: itemTitle,
          productNameAr: itemTitleAr,
          variantName: variant?.name,
          addons: addons.map((a) => a.nameAr || a.name),
          price: finalPrice,
          quantity: 1,
          note: finalNote,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateCartItemQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const product = products.find((p) => p.id === item.productId);
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (product && newQty > product.stock) {
              showToast(`Stock maximum atteint (${product.stock})`, 'warning');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const setCartItemQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeCartItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const product = products.find((p) => p.id === item.productId);
          if (product && qty > product.stock) {
            showToast(`Stock disponible : ${product.stock}`, 'warning');
            return { ...item, quantity: product.stock };
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartItemNote = (itemId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, note } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setOrderNote('');
    setEditingOrderId(null);
  };

  const setDiscount = (value: number, type: 'percentage' | 'fixed') => {
    setDiscountValue(value);
    setDiscountType(type);
    if (value > 0) {
      StorageService.addAuditLog({
        action: 'Application d’une remise',
        details: `Remise de ${value} ${type === 'percentage' ? '%' : settings.currency}`,
        userName: currentUser.name,
        type: 'discount',
      });
    }
  };

  const cancelCurrentOrder = () => {
    if (editingOrderId) {
      // Mark order cancelled
      const updatedOrders = orders.map((o) =>
        o.id === editingOrderId ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date().toISOString() } : o
      );
      setOrders(updatedOrders);
      StorageService.saveOrders(updatedOrders);

      // Free table
      if (selectedTable) {
        const updatedTables = tables.map((t) =>
          t.id === selectedTable.id ? { ...t, status: 'free' as const, currentOrderId: undefined } : t
        );
        setTables(updatedTables);
        StorageService.saveTables(updatedTables);
      }

      StorageService.addAuditLog({
        action: 'Annulation de commande',
        details: `Commande #${editingOrderId} annulée`,
        userName: currentUser.name,
        type: 'order',
      });
      showToast('Commande annulée avec succès', 'info');
    }
    clearCart();
    setSelectedTable(null);
  };

  // --- Open Table Order ---
  const openTableOrder = (table: Table) => {
    setSelectedTable(table);
    setOrderType('dine_in');

    if (table.currentOrderId) {
      const existing = orders.find((o) => o.id === table.currentOrderId && o.status !== 'completed' && o.status !== 'cancelled');
      if (existing) {
        setCart(existing.items);
        setDiscountValue(existing.discount);
        setDiscountType(existing.discountType);
        setOrderNote(existing.note || '');
        setEditingOrderId(existing.id);
        setActiveTab('pos');
        showToast(`Commande ${table.name} chargée`, 'info');
        return;
      }
    }

    clearCart();
    setActiveTab('pos');
    showToast(`${table.name} sélectionnée`, 'info');
  };

  // --- Send Order to Kitchen ---
  const sendOrderToKitchen = (): Order | null => {
    if (cart.length === 0) {
      showToast('Le panier est vide !', 'warning');
      return null;
    }

    const orderNum = editingOrderId
      ? orders.find((o) => o.id === editingOrderId)?.orderNumber || String(Math.floor(1000 + Math.random() * 9000))
      : `GR-${String(orders.length + 1).padStart(6, '0')}`;

    const newOrder: Order = {
      id: editingOrderId || `order-${Date.now()}`,
      orderNumber: orderNum,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      type: orderType,
      status: 'pending',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountValue,
      discountType: discountType,
      discountAmount: cartDiscountAmount,
      serviceCharge: cartServiceCharge,
      tax: cartTax,
      total: cartTotal,
      createdAt: editingOrderId ? orders.find((o) => o.id === editingOrderId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cashierName: currentUser.name,
      note: orderNote,
    };

    let updatedOrders: Order[];
    if (editingOrderId) {
      updatedOrders = orders.map((o) => (o.id === editingOrderId ? newOrder : o));
    } else {
      updatedOrders = [newOrder, ...orders];
    }

    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);

    // Update table status to occupied/waiting
    if (selectedTable) {
      const updatedTables = tables.map((t) =>
        t.id === selectedTable.id
          ? { ...t, status: 'occupied' as const, currentOrderId: newOrder.id, activeGuests: t.capacity }
          : t
      );
      setTables(updatedTables);
      StorageService.saveTables(updatedTables);
    }

    // Print KOT to kitchen printer
    if (settings.autoPrintReceipt) {
      try {
        PrintService.printKitchenTicket(newOrder, settings);
      } catch (e) {
        console.warn('Kitchen print error', e);
      }
    }

    StorageService.addAuditLog({
      action: 'Commande envoyée en cuisine',
      details: `Ticket #${newOrder.orderNumber} - ${selectedTable?.name || 'À Emporter'} (${cartTotal} ${settings.currency})`,
      userName: currentUser.name,
      type: 'order',
    });

    showToast(`Commande #${newOrder.orderNumber} envoyée en cuisine !`, 'success');
    clearCart();
    setSelectedTable(null);
    return newOrder;
  };

  // --- Complete Payment & Checkout ---
  const completePayment = (
    method: PaymentMethod,
    received: number
  ): { order: Order; change: number } | null => {
    if (cart.length === 0) {
      showToast('Le panier est vide !', 'warning');
      return null;
    }

    if (method === 'cash' && received < cartTotal) {
      showToast(t.insufficientAmount, 'error');
      return null;
    }

    const change = method === 'cash' ? Math.max(0, received - cartTotal) : 0;
    const orderNum = editingOrderId
      ? orders.find((o) => o.id === editingOrderId)?.orderNumber || String(Math.floor(1000 + Math.random() * 9000))
      : `GR-${String(orders.length + 1).padStart(6, '0')}`;

    const completedOrder: Order = {
      id: editingOrderId || `order-${Date.now()}`,
      orderNumber: orderNum,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      type: orderType,
      status: 'paid',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountValue,
      discountType: discountType,
      discountAmount: cartDiscountAmount,
      serviceCharge: cartServiceCharge,
      tax: cartTax,
      total: cartTotal,
      paymentMethod: method,
      amountReceived: method === 'cash' ? received : cartTotal,
      change: change,
      createdAt: editingOrderId ? orders.find((o) => o.id === editingOrderId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cashierName: currentUser.name,
      note: orderNote,
    };

    // 1. Deduct Product Stock & Ingredients (Recipe)
    const updatedProducts = [...products];
    const updatedIngredients = [...ingredients];

    cart.forEach((cartItem) => {
      const prodIndex = updatedProducts.findIndex((p) => p.id === cartItem.productId);
      if (prodIndex > -1) {
        const prod = updatedProducts[prodIndex];
        // Deduct finished product
        const remainingStock = Math.max(0, prod.stock - cartItem.quantity);
        updatedProducts[prodIndex] = { ...prod, stock: remainingStock };

        // Deduct recipe ingredients
        if (prod.recipe && prod.recipe.length > 0) {
          prod.recipe.forEach((recItem) => {
            const ingIndex = updatedIngredients.findIndex((ing) => ing.id === recItem.ingredientId);
            if (ingIndex > -1) {
              const currentIng = updatedIngredients[ingIndex];
              const totalNeeded = recItem.quantity * cartItem.quantity;
              updatedIngredients[ingIndex] = {
                ...currentIng,
                stock: Math.max(0, Number((currentIng.stock - totalNeeded).toFixed(3))),
              };
            }
          });
        }
      }
    });

    setProducts(updatedProducts);
    StorageService.saveProducts(updatedProducts);
    setIngredients(updatedIngredients);
    StorageService.saveIngredients(updatedIngredients);

    // 2. Save Order to Database
    let updatedOrders: Order[];
    if (editingOrderId) {
      updatedOrders = orders.map((o) => (o.id === editingOrderId ? completedOrder : o));
    } else {
      updatedOrders = [completedOrder, ...orders];
    }
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);

    // 3. Free Table
    if (selectedTable) {
      const updatedTables = tables.map((t) =>
        t.id === selectedTable.id ? { ...t, status: 'free' as const, currentOrderId: undefined } : t
      );
      setTables(updatedTables);
      StorageService.saveTables(updatedTables);
    }

    // 4. Update Active Shift Register
    const activeShiftIndex = shifts.findIndex((s) => s.status === 'open');
    if (activeShiftIndex > -1) {
      const curShift = shifts[activeShiftIndex];
      const cashAddition = method === 'cash' ? cartTotal : 0;
      const cardAddition = method === 'card' ? cartTotal : 0;
      const otherAddition = method === 'other' ? cartTotal : 0;

      const updatedShift: CashRegisterShift = {
        ...curShift,
        cashSales: curShift.cashSales + cashAddition,
        cardSales: curShift.cardSales + cardAddition,
        otherSales: curShift.otherSales + otherAddition,
        expectedCash: curShift.expectedCash + cashAddition,
      };

      const updatedShifts = [...shifts];
      updatedShifts[activeShiftIndex] = updatedShift;
      setShifts(updatedShifts);
      StorageService.saveShifts(updatedShifts);
    }

    // 5. Trigger 80mm Thermal Receipt Print
    if (settings.autoPrintReceipt) {
      try {
        PrintService.printReceipt(completedOrder, settings);
      } catch (err) {
        console.warn('Auto print failed', err);
      }
    }

    // 6. Audit Log
    StorageService.addAuditLog({
      action: 'Vente encaissée',
      details: `Ticket #${completedOrder.orderNumber} - ${cartTotal} ${settings.currency} (${method.toUpperCase()})`,
      userName: currentUser.name,
      type: 'order',
    });

    setLastCompletedOrder(completedOrder);
    setIsReceiptModalOpen(true);
    showToast(`Paiement réussi ! Monnaie : ${change} ${settings.currency}`, 'success');

    clearCart();
    setSelectedTable(null);
    setIsPaymentModalOpen(false);

    return { order: completedOrder, change };
  };

  // --- KDS Order Status Transitions ---
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const item: Order = { ...o, status, updatedAt: new Date().toISOString() };
        if (status === 'cooking' && !o.cookingStartedAt) {
          item.cookingStartedAt = new Date().toISOString();
        }
        if (status === 'ready' && !o.readyAt) {
          item.readyAt = new Date().toISOString();
        }
        return item;
      }
      return o;
    });

    setOrders(updated);
    StorageService.saveOrders(updated);
    showToast(`Statut commande #${orderId.slice(-4)} : ${status.toUpperCase()}`, 'info');
  };

  const reprintReceipt = (order: Order) => {
    PrintService.printReceipt(order, settings);
    showToast(`Réimpression Ticket #${order.orderNumber}`, 'info');
  };

  // --- Admin Master Data Operations ---
  const saveProduct = (product: Product) => {
    const existingIndex = products.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (existingIndex > -1) {
      updated = [...products];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...products];
    }
    setProducts(updated);
    StorageService.saveProducts(updated);
    StorageService.addAuditLog({
      action: existingIndex > -1 ? 'Produit modifié' : 'Produit ajouté',
      details: `${product.name} (${product.price} ${settings.currency})`,
      userName: currentUser.name,
      type: 'inventory',
    });
    showToast(`Produit ${product.name} sauvegardé`, 'success');
  };

  const deleteProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    StorageService.saveProducts(updated);
    StorageService.addAuditLog({
      action: 'Produit supprimé',
      details: `${product?.name || productId}`,
      userName: currentUser.name,
      type: 'inventory',
    });
    showToast('Produit supprimé', 'info');
  };

  const saveCategory = (category: Category) => {
    const existingIndex = categories.findIndex((c) => c.id === category.id);
    let updated: Category[];
    if (existingIndex > -1) {
      updated = [...categories];
      updated[existingIndex] = category;
    } else {
      updated = [...categories, category];
    }
    setCategories(updated);
    StorageService.saveCategories(updated);
    showToast('Catégorie mise à jour', 'success');
  };

  const deleteCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    StorageService.saveCategories(updated);
    showToast('Catégorie supprimée', 'info');
  };

  const saveIngredient = (ingredient: Ingredient) => {
    const existingIndex = ingredients.findIndex((i) => i.id === ingredient.id);
    let updated: Ingredient[];
    if (existingIndex > -1) {
      updated = [...ingredients];
      updated[existingIndex] = ingredient;
    } else {
      updated = [...ingredients, ingredient];
    }
    setIngredients(updated);
    StorageService.saveIngredients(updated);
    showToast('Matière première mise à jour', 'success');
  };

  const deleteIngredient = (ingredientId: string) => {
    const updated = ingredients.filter((i) => i.id !== ingredientId);
    setIngredients(updated);
    StorageService.saveIngredients(updated);
    showToast('Matière première supprimée', 'info');
  };

  const updateTable = (table: Table) => {
    const updated = tables.map((t) => (t.id === table.id ? table : t));
    setTables(updated);
    StorageService.saveTables(updated);
    showToast(`Table ${table.name} mise à jour`, 'success');
  };

  const saveTable = (table: Table) => {
    const existing = tables.findIndex((t) => t.id === table.id);
    let updated: Table[];
    if (existing > -1) {
      updated = tables.map((t) => (t.id === table.id ? table : t));
    } else {
      updated = [...tables, table];
    }
    setTables(updated);
    StorageService.saveTables(updated);
    showToast(`Table ${table.name} enregistrée`, 'success');
  };

  const deleteTable = (tableId: string) => {
    const updated = tables.filter((t) => t.id !== tableId);
    setTables(updated);
    StorageService.saveTables(updated);
    showToast('Table supprimée', 'info');
  };

  // --- Shifts & Expenses ---
  const currentShift = shifts.find((s) => s.status === 'open') || null;

  const openNewShift = (openingCash: number) => {
    const newShift: CashRegisterShift = {
      id: `shift-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy: currentUser.name,
      openingCash,
      cashSales: 0,
      cardSales: 0,
      otherSales: 0,
      totalExpenses: 0,
      expectedCash: openingCash,
      status: 'open',
    };
    const updated = [newShift, ...shifts.map((s) => ({ ...s, status: 'closed' as const }))];
    setShifts(updated);
    StorageService.saveShifts(updated);
    StorageService.addAuditLog({
      action: 'Ouverture de caisse',
      details: `Fond de caisse initial : ${openingCash} ${settings.currency}`,
      userName: currentUser.name,
      type: 'order',
    });
    showToast(`Caisse ouverte avec ${openingCash} ${settings.currency}`, 'success');
  };

  const closeCurrentShift = (actualCash: number, notes?: string) => {
    if (!currentShift) return;
    const diff = actualCash - currentShift.expectedCash;
    const updatedShift: CashRegisterShift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      closedBy: currentUser.name,
      actualCash,
      difference: diff,
      status: 'closed',
      notes,
    };
    const updated = shifts.map((s) => (s.id === currentShift.id ? updatedShift : s));
    setShifts(updated);
    StorageService.saveShifts(updated);
    StorageService.addAuditLog({
      action: 'Clôture de caisse Z',
      details: `Théorique: ${currentShift.expectedCash} ${settings.currency} | Réel: ${actualCash} ${settings.currency} (Écart: ${diff} ${settings.currency})`,
      userName: currentUser.name,
      type: 'order',
    });
    showToast(`Caisse clôturée. Écart: ${diff} ${settings.currency}`, diff === 0 ? 'success' : 'warning');
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    StorageService.saveExpenses(updatedExpenses);

    // Update shift expected cash
    if (currentShift) {
      const activeShiftIndex = shifts.findIndex((s) => s.id === currentShift.id);
      if (activeShiftIndex > -1) {
        const updatedShift = {
          ...currentShift,
          totalExpenses: currentShift.totalExpenses + newExpense.amount,
          expectedCash: currentShift.expectedCash - newExpense.amount,
        };
        const updatedShifts = [...shifts];
        updatedShifts[activeShiftIndex] = updatedShift;
        setShifts(updatedShifts);
        StorageService.saveShifts(updatedShifts);
      }
    }

    StorageService.addAuditLog({
      action: 'Dépense enregistrée',
      details: `${newExpense.title} (${newExpense.type}) : ${newExpense.amount} ${settings.currency}`,
      userName: currentUser.name,
      type: 'order',
    });
    showToast(`Dépense enregistrée : -${newExpense.amount} ${settings.currency}`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        language,
        setLanguage,
        isRTL,
        t,
        currentUser,
        switchUser,
        hasPermission,
        activeTab,
        setActiveTab,
        categories,
        products,
        tables,
        orders,
        ingredients,
        shifts,
        currentShift,
        expenses,
        auditLogs,
        cart,
        selectedTable,
        orderType,
        discountValue,
        discountType,
        orderNote,
        editingOrderId,
        cartSubtotal,
        cartDiscountAmount,
        cartServiceCharge,
        cartTax,
        cartTotal,
        addToCart,
        updateCartItemQty,
        setCartItemQty,
        removeCartItem,
        updateCartItemNote,
        clearCart,
        setDiscount,
        setSelectedTable,
        setOrderType,
        setOrderNote,
        sendOrderToKitchen,
        completePayment,
        cancelCurrentOrder,
        openTableOrder,
        updateOrderStatus,
        reprintReceipt,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveIngredient,
        deleteIngredient,
        updateTable,
        deleteTable,
        saveTable,
        openNewShift,
        closeCurrentShift,
        addExpense,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        lastCompletedOrder,
        setLastCompletedOrder,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
