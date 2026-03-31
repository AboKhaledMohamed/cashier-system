/**
 * Shop Context - إدارة حالة المحل المركزية
 * يقرأ البيانات من SQLite عبر Electron IPC ويحافظ على حالة React متجددة
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ShopNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
  ref_type?: string;
  ref_id?: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  full_name: string;
  role: string;
  phone?: string;
  // Existing permissions
  can_view_costs: number;
  can_apply_discount: number;
  max_discount_pct: number;
  can_void_invoice: number;
  can_manage_products: number;
  can_view_reports: number;
  // New comprehensive permissions
  can_add_products: number;
  can_edit_products: number;
  can_delete_products: number;
  can_manage_inventory: number;
  can_manage_customers: number;
  can_manage_suppliers: number;
  can_manage_users: number;
  can_manage_settings: number;
  can_view_audit_log: number;
  can_delete_invoices: number;
  can_give_rewards: number;
  can_record_expenses: number;
  can_process_returns: number;
  // Granular customer/supplier permissions
  can_add_customers: number;
  can_edit_customers: number;
  can_delete_customers: number;
  can_add_suppliers: number;
  can_edit_suppliers: number;
  can_delete_suppliers: number;
  is_active: number;
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  shop_name_en?: string;
  owner_name?: string;
  phone: string;
  address?: string;
  city?: string;
  currency: string;
  currency_symbol: string;
  tax_enabled: number;
  tax_rate: number;
  tax_inclusive: number;
  tax_name?: string;
  loyalty_enabled: number;
  points_per_pound: number;
  pound_per_point: number;
  min_redeem_points: number;
  receipt_printer_width: string;
  receipt_header?: string;
  receipt_footer?: string;
  receipt_show_logo: number;
  low_stock_alert: number;
  expiry_alert_days: number;
  backup_auto: number;
  backup_schedule?: string;
  backup_time?: string;
  backup_path?: string;
  backup_keep_days: number;
  dark_mode: number;
}

export interface DashboardStats {
  // Monthly stats (new)
  month_sales: number;
  month_invoices: number;
  month_customer_debt: number;
  month_expenses: number;
  // Today stats (keeping for compatibility)
  today_sales: number;
  today_invoices: number;
  today_returns: number;
  today_expenses: number;
  today_collections: number;
  today_net: number;
  total_customer_debt: number;
  total_supplier_debt: number;
  low_stock_count: number;
  expiring_count: number;
  total_products: number;
  total_customers: number;
  last_7_days: Array<{ day: string; total: number; count: number }>;
  top_products: Array<{ product_name: string; total_qty: number; total_revenue: number }>;
}

export interface ShopContextType {
  // Auth
  currentUser: CurrentUser | null;
  login: (username: string, password: string) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;

  // Settings
  settings: ShopSettings | null;
  loadSettings: () => Promise<void>;
  updateSettings: (data: Partial<ShopSettings>) => Promise<void>;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Cash Session
  currentSession: any | null;
  loadCurrentSession: () => Promise<void>;

  // Data loading
  products: any[];
  customers: any[];
  suppliers: any[];
  categories: any[];
  loadProducts: () => Promise<void>;
  loadCustomers: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  loadCategories: () => Promise<void>;

  // Dashboard 
  dashboardStats: DashboardStats | null;
  loadDashboardStats: () => Promise<void>;

  // Notifications
  notifications: ShopNotification[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Utility
  refreshAll: () => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function ShopProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<ShopNotification[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const api = (window as any).electronAPI;

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync dark_mode from settings when loaded
  useEffect(() => {
    if (settings?.dark_mode !== undefined) {
      setIsDarkMode(Boolean(settings.dark_mode));
    }
  }, [settings?.dark_mode]);

  // Auto-load initial data on app mount (not just after login)
  useEffect(() => {
    if (api) {
      loadSuppliers();
      loadCategories();
    }
  }, []);

  // ========================================
  // AUTH
  // ========================================
  const login = useCallback(async (username: string, password: string): Promise<CurrentUser> => {
    if (!api) {
      throw new Error('التطبيق يجب أن يعمل عبر Electron. يرجى إيقافه وتشغيل: npm run dev:electron');
    }
    const user = await api.auth.login(username, password);
    setCurrentUser(user);
    // Load initial data after login
    await Promise.all([
      loadSettings(),
      loadCurrentSession(),
      loadSuppliers(),
      loadCategories(),
    ]);
    return user;
  }, []);

  const logout = useCallback(async () => {
    if (currentUser) {
      await api.auth.logout(currentUser.id);
    }
    setCurrentUser(null);
    setCurrentSession(null);
  }, [currentUser]);

  // ========================================
  // SETTINGS
  // ========================================
  const loadSettings = useCallback(async () => {
    try {
      const s = await api.settings.get();
      setSettings(s);
    } catch (e) { console.error('Failed to load settings:', e); }
  }, []);

  const updateSettings = useCallback(async (data: Partial<ShopSettings>) => {
    const updated = await api.settings.update({ ...data, user_id: currentUser?.id });
    setSettings(updated);
  }, [currentUser]);

  // ========================================
  // THEME
  // ========================================
  const toggleTheme = useCallback(async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    // Save to database
    try {
      await updateSettings({ dark_mode: newDarkMode ? 1 : 0 });
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  }, [isDarkMode, updateSettings]);

  // ========================================
  // CASH SESSION
  // ========================================
  const loadCurrentSession = useCallback(async () => {
    try {
      const session = await api.cashSessions.getCurrent();
      setCurrentSession(session);
    } catch (e) { console.error('Failed to load session:', e); }
  }, []);

  // ========================================
  // DATA LOADING
  // ========================================
  const loadProducts = useCallback(async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch (e) { console.error('Failed to load products:', e); }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await api.customers.getAll();
      setCustomers(data);
    } catch (e) { console.error('Failed to load customers:', e); }
  }, []);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await api.suppliers.getAll();
      setSuppliers(data);
    } catch (e) { console.error('Failed to load suppliers:', e); }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (e) { console.error('Failed to load categories:', e); }
  }, []);

  // ========================================
  // DASHBOARD
  // ========================================
  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await api.reports.getDashboardStats();
      setDashboardStats(stats);
    } catch (e) { console.error('Failed to load stats:', e); }
  }, []);

  // ========================================
  // NOTIFICATIONS
  // ========================================
  const loadNotifications = useCallback(async () => {
    try {
      const notifs = await api.notifications.getAll();
      setNotifications(notifs);
    } catch (e) { console.error('Failed to load notifications:', e); }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await api.notifications.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  }, []);

  // ========================================
  // REFRESH ALL
  // ========================================
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadProducts(),
      loadCustomers(),
      loadSuppliers(),
      loadCategories(),
      loadCurrentSession(),
      loadNotifications(),
      loadDashboardStats(),
    ]);
  }, []);

  // ========================================
  // FORMATTING
  // ========================================
  const formatCurrency = useCallback((amount: number) => {
    if (amount === undefined || amount === null) return '-';
    const symbol = settings?.currency_symbol || 'ج.م';
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
  }, [settings]);

  // ========================================
  // COMPUTED
  // ========================================
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isLoggedIn = currentUser !== null;

  // Auto-refresh notifications every 60 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // ========================================
  // CONTEXT VALUE
  // ========================================
  const value: ShopContextType = {
    currentUser,
    login,
    logout,
    isLoggedIn,
    settings,
    loadSettings,
    updateSettings,
    isDarkMode,
    toggleTheme,
    currentSession,
    loadCurrentSession,
    products,
    customers,
    suppliers,
    categories,
    loadProducts,
    loadCustomers,
    loadSuppliers,
    loadCategories,
    dashboardStats,
    loadDashboardStats,
    notifications,
    unreadCount,
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    refreshAll,
    formatCurrency,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useShop(): ShopContextType {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
}
