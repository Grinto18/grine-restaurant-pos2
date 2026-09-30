import {
  Product,
  Category,
  Table,
  Order,
  Ingredient,
  RestaurantSettings,
  CashRegisterShift,
  Expense,
  AuditLog,
  User,
  Customer,
} from '../types/pos';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_INGREDIENTS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'grine_pos_settings_v3',
  USERS: 'grine_pos_users_v2',
  CATEGORIES: 'grine_official_menu_v3_categories',
  PRODUCTS: 'grine_official_menu_v2_products',
  TABLES: 'grine_pos_tables_v2',
  ORDERS: 'grine_pos_orders_v2',
  INGREDIENTS: 'grine_pos_ingredients_v2',
  SHIFTS: 'grine_pos_shifts_v2',
  EXPENSES: 'grine_pos_expenses_v2',
  AUDIT_LOGS: 'grine_pos_audit_logs_v2',
  ACTIVE_USER: 'grine_pos_active_user_v2',
  CUSTOMERS: 'grine_pos_customers_v1',
};

export class StorageService {
  public static getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  }

  public static saveCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }
  // --- Settings ---
  public static getSettings(): RestaurantSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  }

  public static saveSettings(settings: RestaurantSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Users ---
  public static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  }

  public static saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public static getActiveUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return data ? JSON.parse(data) : INITIAL_USERS[0]; // default admin
  }

  public static setActiveUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  }

  // --- Categories ---
  public static getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  }

  public static saveCategories(categories: Category[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // --- Products ---
  public static getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  }

  public static saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  // --- Tables ---
  public static getTables(): Table[] {
    const data = localStorage.getItem(STORAGE_KEYS.TABLES);
    return data ? JSON.parse(data) : INITIAL_TABLES;
  }

  public static saveTables(tables: Table[]) {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }

  // --- Orders ---
  public static getOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }

  public static saveOrders(orders: Order[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  // --- Ingredients ---
  public static getIngredients(): Ingredient[] {
    const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return data ? JSON.parse(data) : INITIAL_INGREDIENTS;
  }

  public static saveIngredients(ingredients: Ingredient[]) {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }

  // --- Cash Register Shifts ---
  public static getShifts(): CashRegisterShift[] {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    if (!data) {
      // Create initial active shift
      const initialShift: CashRegisterShift = {
        id: 'shift-1',
        openedAt: new Date().toISOString(),
        openedBy: 'Karim Grine',
        openingCash: 20000, // 20,000 DA
        cashSales: 0,
        cardSales: 0,
        otherSales: 0,
        totalExpenses: 0,
        expectedCash: 20000,
        status: 'open',
      };
      this.saveShifts([initialShift]);
      return [initialShift];
    }
    return JSON.parse(data);
  }

  public static saveShifts(shifts: CashRegisterShift[]) {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }

  // --- Expenses ---
  public static getExpenses(): Expense[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  }

  public static saveExpenses(expenses: Expense[]) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // --- Audit Logs ---
  public static getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  }

  public static addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 500))); // keep 500
  }

  // --- Backup & Restore ---
  public static exportDatabaseBackup(): string {
    const backup = {
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      restaurant: 'GRINE RESTAURANT',
      settings: this.getSettings(),
      users: this.getUsers(),
      categories: this.getCategories(),
      products: this.getProducts(),
      tables: this.getTables(),
      orders: this.getOrders(),
      ingredients: this.getIngredients(),
      shifts: this.getShifts(),
      expenses: this.getExpenses(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public static restoreDatabaseBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.users) this.saveUsers(data.users);
      if (data.categories) this.saveCategories(data.categories);
      if (data.products) this.saveProducts(data.products);
      if (data.tables) this.saveTables(data.tables);
      if (data.orders) this.saveOrders(data.orders);
      if (data.ingredients) this.saveIngredients(data.ingredients);
      if (data.shifts) this.saveShifts(data.shifts);
      if (data.expenses) this.saveExpenses(data.expenses);
      if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
      return true;
    } catch {
      return false;
    }
  }

  public static resetToFactoryDefaults() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  }
}
