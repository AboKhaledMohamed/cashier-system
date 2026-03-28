/**
 * Register all IPC handlers
 */
const { registerAuthHandlers } = require('./auth');
const { registerProductHandlers } = require('./products');
const { registerCustomerHandlers } = require('./customers');
const { registerSupplierHandlers } = require('./suppliers');
const { registerInvoiceHandlers } = require('./invoices');
const { registerPurchaseHandlers } = require('./purchases');
const { registerReturnHandlers } = require('./returns');
const { registerExpenseHandlers } = require('./expenses');
const { registerCashSessionHandlers } = require('./cashSessions');
const { registerPaymentHandlers } = require('./payments');
const { registerInventoryHandlers } = require('./inventory');
const { registerReportHandlers } = require('./reports');
const { registerUserHandlers } = require('./users');
const { registerSettingsHandlers } = require('./settings');
const { registerAuditHandlers, registerNotificationHandlers, registerBackupHandlers } = require('./audit');
const { registerCategoryHandlers } = require('./categories');

function registerAllHandlers() {
  registerAuthHandlers();
  registerProductHandlers();
  registerCustomerHandlers();
  registerSupplierHandlers();
  registerInvoiceHandlers();
  registerPurchaseHandlers();
  registerReturnHandlers();
  registerExpenseHandlers();
  registerCashSessionHandlers();
  registerPaymentHandlers();
  registerInventoryHandlers();
  registerReportHandlers();
  registerUserHandlers();
  registerSettingsHandlers();
  registerAuditHandlers();
  registerNotificationHandlers();
  registerBackupHandlers();
  registerCategoryHandlers();
}

module.exports = { registerAllHandlers };
