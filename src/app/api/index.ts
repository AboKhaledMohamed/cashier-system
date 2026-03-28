/**
 * Frontend API - Typed wrapper around window.electronAPI
 * This provides the bridge between React frontend and Electron backend
 */

// Type declaration for the Electron API exposed via preload
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface ElectronAPI {
  auth: {
    login: (username: string, password: string) => Promise<any>;
    logout: (userId: string) => Promise<any>;
    changePassword: (userId: string, oldPass: string, newPass: string) => Promise<any>;
  };
  settings: {
    get: () => Promise<any>;
    update: (data: any) => Promise<any>;
  };
  users: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
    toggleActive: (id: string) => Promise<any>;
  };
  categories: {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  products: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    getByBarcode: (barcode: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
    updateStock: (id: string, qty: number, reason: string, userId: string) => Promise<any>;
    getLowStock: () => Promise<any[]>;
    getExpiringSoon: () => Promise<any[]>;
    search: (query: string) => Promise<any[]>;
  };
  customers: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
    search: (query: string) => Promise<any[]>;
    getDebtors: () => Promise<any[]>;
    getDebtHistory: (id: string) => Promise<any>;
  };
  suppliers: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  invoices: {
    getAll: (filters?: any) => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    void: (id: string, reason: string, userId: string) => Promise<any>;
    getByCustomer: (customerId: string) => Promise<any[]>;
    getNextNumber: () => Promise<string>;
    getSuspended: () => Promise<any[]>;
    suspend: (data: any) => Promise<any>;
    resumeSuspended: (id: string) => Promise<any>;
    deleteSuspended: (id: string) => Promise<any>;
  };
  returns: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    getByInvoice: (invoiceId: string) => Promise<any[]>;
  };
  purchases: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
    getNextNumber: () => Promise<string>;
  };
  expenses: {
    getAll: (filters?: any) => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
    getCategories: () => Promise<any[]>;
    createCategory: (data: any) => Promise<any>;
  };
  cashSessions: {
    getAll: () => Promise<any[]>;
    getCurrent: () => Promise<any>;
    open: (data: any) => Promise<any>;
    close: (id: string, data: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
  };
  payments: {
    getAll: (filters?: any) => Promise<any[]>;
    create: (data: any) => Promise<any>;
    getByParty: (partyType: string, partyId: string) => Promise<any[]>;
  };
  inventory: {
    getStockMovements: (productId?: string, limit?: number) => Promise<any[]>;
    createAdjustment: (data: any) => Promise<any>;
    getAdjustments: () => Promise<any[]>;
  };
  reports: {
    getDailySummary: (date?: string) => Promise<any>;
    getSalesReport: (dateFrom: string, dateTo: string) => Promise<any>;
    getProductsReport: (dateFrom: string, dateTo: string) => Promise<any[]>;
    getCustomersReport: () => Promise<any[]>;
    getSuppliersReport: () => Promise<any[]>;
    getExpensesReport: (dateFrom: string, dateTo: string) => Promise<any>;
    getProfitReport: (dateFrom: string, dateTo: string) => Promise<any>;
    getDashboardStats: () => Promise<any>;
  };
  audit: {
    getAll: (filters?: any) => Promise<any[]>;
  };
  notifications: {
    getAll: () => Promise<any[]>;
    getUnread: () => Promise<any[]>;
    markRead: (id: string) => Promise<any>;
    markAllRead: () => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  backup: {
    create: () => Promise<any>;
    getLog: () => Promise<any[]>;
    restore: (filePath: string) => Promise<any>;
  };
}

/**
 * Get the Electron API. Returns window.electronAPI in Electron, or a mock for dev mode.
 */
export function getAPI(): ElectronAPI {
  if (window.electronAPI) {
    return window.electronAPI;
  }
  // If running in browser without Electron (dev mode), throw helpful error
  throw new Error('Electron API not available. Please run the app through Electron.');
}

/**
 * Check if running inside Electron
 */
export function isElectron(): boolean {
  return !!(window as any).electronAPI;
}

export const api = typeof window !== 'undefined' && (window as any).electronAPI 
  ? (window as any).electronAPI as ElectronAPI 
  : null;
