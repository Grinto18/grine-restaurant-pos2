export type Role = 'admin' | 'manager' | 'cashier' | 'kitchen';

export type Language = 'fr' | 'ar' | 'en';

export type TableStatus = 'free' | 'occupied' | 'waiting' | 'reserved';

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'paid' | 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'cib' | 'dahabia' | 'baridimob' | 'transfer' | 'other';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  avatar?: string;
  pin?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'piece';
  stock: number;
  minStock: number;
  costPerUnit: number; // Cost in DA
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. 'L' or 'XL'
  nameAr?: string; // e.g. 'حجم L' or 'حجم XL'
  price: number; // price in DA
}

export interface ProductAddon {
  id: string;
  name: string; // e.g. 'Sauce blanche'
  nameAr: string; // e.g. 'صلصة بيضاء'
  price: number; // price in DA
}

export interface Product {
  id: string;
  name: string; // name_fr
  nameAr: string; // name_ar
  nameEn?: string; // name_en
  categoryId: string;
  price: number; // in DA (base price or L price for pizzas)
  costPrice?: number; // Food cost in DA
  image: string;
  stock: number;
  minStock: number;
  sku: string;
  description?: string;
  isAvailable: boolean;
  sortOrder?: number;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  recipe?: RecipeItem[];
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  icon: string;
  color?: string;
  sortOrder?: number;
}

export interface Table {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  activeGuests?: number;
  floor?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameAr?: string;
  variantName?: string;
  addons?: string[];
  price: number;
  quantity: number;
  note?: string;
  selectedVariants?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableName?: string;
  type: 'dine_in' | 'takeaway' | 'delivery';
  customerId?: string;
  customerName?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  serviceCharge: number;
  tax: number;
  total: number;
  paymentMethod?: PaymentMethod;
  amountReceived?: number;
  change?: number;
  createdAt: string; // ISO date
  updatedAt: string;
  cookingStartedAt?: string;
  readyAt?: string;
  cashierName?: string;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  type: 'Electricity' | 'Water' | 'Purchase' | 'Maintenance' | 'Rent' | 'Other';
  amount: number;
  date: string;
  note?: string;
  recordedBy: string;
}

export interface CashRegisterShift {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userName: string;
  timestamp: string;
  type: 'order' | 'price' | 'inventory' | 'discount' | 'auth' | 'settings';
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number; // percentage
  serviceChargeRate: number; // percentage
  printerName: string;
  kitchenPrinterName: string;
  receiptWidth: '80mm' | '58mm';
  language: Language;
  enableSoundAlerts: boolean;
  autoPrintReceipt: boolean;
}
