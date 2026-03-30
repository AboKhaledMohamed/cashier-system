const { contextBridge, ipcRenderer } = require('electron');

/**
 * Electron Preload Script
 * Exposes a typed API to the renderer process via contextBridge
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ============================================================================
  // AUTH
  // ============================================================================
  auth: {
    login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
    logout: (userId) => ipcRenderer.invoke('auth:logout', userId),
    changePassword: (userId, oldPass, newPass) => ipcRenderer.invoke('auth:changePassword', userId, oldPass, newPass),
    forcePasswordChange: (userId, newPass) => ipcRenderer.invoke('auth:forcePasswordChange', userId, newPass),
  },

  // ============================================================================
  // SETTINGS
  // ============================================================================
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (data) => ipcRenderer.invoke('settings:update', data),
  },

  // ============================================================================
  // USERS
  // ============================================================================
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    getById: (id) => ipcRenderer.invoke('users:getById', id),
    create: (data) => ipcRenderer.invoke('users:create', data),
    update: (id, data) => ipcRenderer.invoke('users:update', id, data),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
    toggleActive: (id) => ipcRenderer.invoke('users:toggleActive', id),
  },

  // ============================================================================
  // CATEGORIES
  // ============================================================================
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    create: (data) => ipcRenderer.invoke('categories:create', data),
    update: (id, data) => ipcRenderer.invoke('categories:update', id, data),
    delete: (id) => ipcRenderer.invoke('categories:delete', id),
  },

  // ============================================================================
  // PRODUCTS
  // ============================================================================
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    getById: (id) => ipcRenderer.invoke('products:getById', id),
    getByBarcode: (barcode) => ipcRenderer.invoke('products:getByBarcode', barcode),
    create: (data) => ipcRenderer.invoke('products:create', data),
    update: (id, data) => ipcRenderer.invoke('products:update', id, data),
    delete: (id) => ipcRenderer.invoke('products:delete', id),
    updateStock: (id, qty, reason, userId) => ipcRenderer.invoke('products:updateStock', id, qty, reason, userId),
    getLowStock: () => ipcRenderer.invoke('products:getLowStock'),
    getExpiringSoon: () => ipcRenderer.invoke('products:getExpiringSoon'),
    search: (query) => ipcRenderer.invoke('products:search', query),
  },

  // ============================================================================
  // CUSTOMERS
  // ============================================================================
  customers: {
    getAll: () => ipcRenderer.invoke('customers:getAll'),
    getById: (id) => ipcRenderer.invoke('customers:getById', id),
    create: (data) => ipcRenderer.invoke('customers:create', data),
    update: (id, data) => ipcRenderer.invoke('customers:update', id, data),
    delete: (id) => ipcRenderer.invoke('customers:delete', id),
    search: (query) => ipcRenderer.invoke('customers:search', query),
    getDebtors: () => ipcRenderer.invoke('customers:getDebtors'),
    getDebtHistory: (id) => ipcRenderer.invoke('customers:getDebtHistory', id),
  },

  // ============================================================================
  // SUPPLIERS
  // ============================================================================
  suppliers: {
    getAll: () => ipcRenderer.invoke('suppliers:getAll'),
    getById: (id) => ipcRenderer.invoke('suppliers:getById', id),
    create: (data) => ipcRenderer.invoke('suppliers:create', data),
    update: (id, data) => ipcRenderer.invoke('suppliers:update', id, data),
    delete: (id) => ipcRenderer.invoke('suppliers:delete', id),
  },

  // ============================================================================
  // INVOICES (POS)
  // ============================================================================
  invoices: {
    getAll: (filters) => ipcRenderer.invoke('invoices:getAll', filters),
    getById: (id) => ipcRenderer.invoke('invoices:getById', id),
    create: (data) => ipcRenderer.invoke('invoices:create', data),
    void: (id, reason, userId) => ipcRenderer.invoke('invoices:void', id, reason, userId),
    delete: (id) => ipcRenderer.invoke('invoices:delete', id),
    getByCustomer: (customerId) => ipcRenderer.invoke('invoices:getByCustomer', customerId),
    getNextNumber: () => ipcRenderer.invoke('invoices:getNextNumber'),
    getSuspended: () => ipcRenderer.invoke('invoices:getSuspended'),
    suspend: (data) => ipcRenderer.invoke('invoices:suspend', data),
    resumeSuspended: (id) => ipcRenderer.invoke('invoices:resumeSuspended', id),
    deleteSuspended: (id) => ipcRenderer.invoke('invoices:deleteSuspended', id),
  },

  // ============================================================================
  // RETURNS
  // ============================================================================
  returns: {
    getAll: () => ipcRenderer.invoke('returns:getAll'),
    getById: (id) => ipcRenderer.invoke('returns:getById', id),
    create: (data) => ipcRenderer.invoke('returns:create', data),
    delete: (id) => ipcRenderer.invoke('returns:delete', id),
    getByInvoice: (invoiceId) => ipcRenderer.invoke('returns:getByInvoice', invoiceId),
  },

  // ============================================================================
  // PURCHASES
  // ============================================================================
  purchases: {
    getAll: () => ipcRenderer.invoke('purchases:getAll'),
    getById: (id) => ipcRenderer.invoke('purchases:getById', id),
    create: (data) => ipcRenderer.invoke('purchases:create', data),
    update: (id, data) => ipcRenderer.invoke('purchases:update', id, data),
    delete: (id) => ipcRenderer.invoke('purchases:delete', id),
    getNextNumber: () => ipcRenderer.invoke('purchases:getNextNumber'),
  },

  // ============================================================================
  // EXPENSES
  // ============================================================================
  expenses: {
    getAll: (filters) => ipcRenderer.invoke('expenses:getAll', filters),
    create: (data) => ipcRenderer.invoke('expenses:create', data),
    update: (id, data) => ipcRenderer.invoke('expenses:update', id, data),
    delete: (id) => ipcRenderer.invoke('expenses:delete', id),
    getCategories: () => ipcRenderer.invoke('expenses:getCategories'),
    createCategory: (data) => ipcRenderer.invoke('expenses:createCategory', data),
  },

  // ============================================================================
  // CASH SESSIONS
  // ============================================================================
  cashSessions: {
    getAll: () => ipcRenderer.invoke('cashSessions:getAll'),
    getCurrent: () => ipcRenderer.invoke('cashSessions:getCurrent'),
    open: (data) => ipcRenderer.invoke('cashSessions:open', data),
    close: (id, data) => ipcRenderer.invoke('cashSessions:close', id, data),
    getById: (id) => ipcRenderer.invoke('cashSessions:getById', id),
  },

  // ============================================================================
  // PAYMENTS & COLLECTIONS
  // ============================================================================
  payments: {
    getAll: (filters) => ipcRenderer.invoke('payments:getAll', filters),
    create: (data) => ipcRenderer.invoke('payments:create', data),
    getByParty: (partyType, partyId) => ipcRenderer.invoke('payments:getByParty', partyType, partyId),
  },

  // ============================================================================
  // INVENTORY
  // ============================================================================
  inventory: {
    getStockMovements: (productId, limit) => ipcRenderer.invoke('inventory:getStockMovements', productId, limit),
    createAdjustment: (data) => ipcRenderer.invoke('inventory:createAdjustment', data),
    getAdjustments: () => ipcRenderer.invoke('inventory:getAdjustments'),
  },

  // ============================================================================
  // REPORTS
  // ============================================================================
  reports: {
    getDailySummary: (date) => ipcRenderer.invoke('reports:getDailySummary', date),
    getSalesReport: (dateFrom, dateTo) => ipcRenderer.invoke('reports:getSalesReport', dateFrom, dateTo),
    getProductsReport: (dateFrom, dateTo) => ipcRenderer.invoke('reports:getProductsReport', dateFrom, dateTo),
    getCustomersReport: () => ipcRenderer.invoke('reports:getCustomersReport'),
    getSuppliersReport: () => ipcRenderer.invoke('reports:getSuppliersReport'),
    getExpensesReport: (dateFrom, dateTo) => ipcRenderer.invoke('reports:getExpensesReport', dateFrom, dateTo),
    getProfitReport: (dateFrom, dateTo) => ipcRenderer.invoke('reports:getProfitReport', dateFrom, dateTo),
    getDashboardStats: () => ipcRenderer.invoke('reports:getDashboardStats'),
  },

  // ============================================================================
  // AUDIT LOG
  // ============================================================================
  audit: {
    getAll: (filters) => ipcRenderer.invoke('audit:getAll', filters),
  },

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  notifications: {
    getAll: () => ipcRenderer.invoke('notifications:getAll'),
    getUnread: () => ipcRenderer.invoke('notifications:getUnread'),
    markRead: (id) => ipcRenderer.invoke('notifications:markRead', id),
    markAllRead: () => ipcRenderer.invoke('notifications:markAllRead'),
    delete: (id) => ipcRenderer.invoke('notifications:delete', id),
  },

  // ============================================================================
  // BACKUP
  // ============================================================================
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    getLog: () => ipcRenderer.invoke('backup:getLog'),
    restore: (filePath) => ipcRenderer.invoke('backup:restore', filePath),
  },
});
