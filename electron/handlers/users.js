const { ipcMain } = require('electron');
const { getDb, generateId, hashPassword } = require('../database');

// Helper function to get role-based default permissions
function getRoleDefaultPermissions(role) {
  const defaults = {
    admin: {
      can_view_costs: 1, can_apply_discount: 1, max_discount_pct: 100,
      can_void_invoice: 1, can_manage_products: 1, can_view_reports: 1,
      can_add_products: 1, can_edit_products: 1, can_delete_products: 1,
      can_manage_inventory: 1, can_manage_customers: 1, can_manage_suppliers: 1,
      can_manage_users: 1, can_manage_settings: 1, can_view_audit_log: 1,
      can_delete_invoices: 1, can_give_rewards: 1, can_record_expenses: 1, can_process_returns: 1,
      can_add_customers: 1, can_edit_customers: 1, can_delete_customers: 1,
      can_add_suppliers: 1, can_edit_suppliers: 1, can_delete_suppliers: 1
    },
    manager: {
      can_view_costs: 1, can_apply_discount: 1, max_discount_pct: 100,
      can_void_invoice: 1, can_manage_products: 1, can_view_reports: 1,
      can_add_products: 1, can_edit_products: 1, can_delete_products: 1,
      can_manage_inventory: 1, can_manage_customers: 1, can_manage_suppliers: 1,
      can_manage_users: 0, can_manage_settings: 0, can_view_audit_log: 0,
      can_delete_invoices: 0, can_give_rewards: 1, can_record_expenses: 1, can_process_returns: 1,
      can_add_customers: 1, can_edit_customers: 1, can_delete_customers: 1,
      can_add_suppliers: 1, can_edit_suppliers: 1, can_delete_suppliers: 1
    },
    cashier: {
      can_view_costs: 0, can_apply_discount: 1, max_discount_pct: 10,
      can_void_invoice: 0, can_manage_products: 0, can_view_reports: 1,
      can_add_products: 0, can_edit_products: 0, can_delete_products: 0,
      can_manage_inventory: 0, can_manage_customers: 0, can_manage_suppliers: 0,
      can_manage_users: 0, can_manage_settings: 0, can_view_audit_log: 0,
      can_delete_invoices: 0, can_give_rewards: 0, can_record_expenses: 1, can_process_returns: 1,
      can_add_customers: 1, can_edit_customers: 0, can_delete_customers: 0,
      can_add_suppliers: 1, can_edit_suppliers: 0, can_delete_suppliers: 0
    }
  };
  return defaults[role] || defaults.cashier;
}

// All user columns to select (excluding password_hash)
const USER_COLUMNS = `
  id, username, full_name, role, phone,
  can_view_costs, can_apply_discount, max_discount_pct,
  can_void_invoice, can_manage_products, can_view_reports,
  can_add_products, can_edit_products, can_delete_products,
  can_manage_inventory, can_manage_customers, can_manage_suppliers,
  can_manage_users, can_manage_settings, can_view_audit_log,
  can_delete_invoices, can_give_rewards, can_record_expenses, can_process_returns,
  can_add_customers, can_edit_customers, can_delete_customers,
  can_add_suppliers, can_edit_suppliers, can_delete_suppliers,
  pin_code, is_active, last_login_at, created_at
`;

function registerUserHandlers() {
  ipcMain.handle('users:getAll', async () => {
    const db = getDb();
    return db.prepare(`SELECT ${USER_COLUMNS} FROM users ORDER BY created_at`).all();
  });

  ipcMain.handle('users:getById', async (event, id) => {
    const db = getDb();
    return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id);
  });

  ipcMain.handle('users:create', async (event, data) => {
    const db = getDb();
    const id = generateId('user');
    const passwordHash = hashPassword(data.password || '1234');
    const role = data.role || 'cashier';
    const defaults = getRoleDefaultPermissions(role);

    // Override defaults with provided values
    const perms = {
      can_view_costs: data.can_view_costs !== undefined ? (data.can_view_costs ? 1 : 0) : defaults.can_view_costs,
      can_apply_discount: data.can_apply_discount !== undefined ? (data.can_apply_discount ? 1 : 0) : defaults.can_apply_discount,
      max_discount_pct: data.max_discount_pct !== undefined ? data.max_discount_pct : defaults.max_discount_pct,
      can_void_invoice: data.can_void_invoice !== undefined ? (data.can_void_invoice ? 1 : 0) : defaults.can_void_invoice,
      can_manage_products: data.can_manage_products !== undefined ? (data.can_manage_products ? 1 : 0) : defaults.can_manage_products,
      can_view_reports: data.can_view_reports !== undefined ? (data.can_view_reports ? 1 : 0) : defaults.can_view_reports,
      can_add_products: data.can_add_products !== undefined ? (data.can_add_products ? 1 : 0) : defaults.can_add_products,
      can_edit_products: data.can_edit_products !== undefined ? (data.can_edit_products ? 1 : 0) : defaults.can_edit_products,
      can_delete_products: data.can_delete_products !== undefined ? (data.can_delete_products ? 1 : 0) : defaults.can_delete_products,
      can_manage_inventory: data.can_manage_inventory !== undefined ? (data.can_manage_inventory ? 1 : 0) : defaults.can_manage_inventory,
      can_manage_customers: data.can_manage_customers !== undefined ? (data.can_manage_customers ? 1 : 0) : defaults.can_manage_customers,
      can_manage_suppliers: data.can_manage_suppliers !== undefined ? (data.can_manage_suppliers ? 1 : 0) : defaults.can_manage_suppliers,
      can_manage_users: data.can_manage_users !== undefined ? (data.can_manage_users ? 1 : 0) : defaults.can_manage_users,
      can_manage_settings: data.can_manage_settings !== undefined ? (data.can_manage_settings ? 1 : 0) : defaults.can_manage_settings,
      can_view_audit_log: data.can_view_audit_log !== undefined ? (data.can_view_audit_log ? 1 : 0) : defaults.can_view_audit_log,
      can_delete_invoices: data.can_delete_invoices !== undefined ? (data.can_delete_invoices ? 1 : 0) : defaults.can_delete_invoices,
      can_give_rewards: data.can_give_rewards !== undefined ? (data.can_give_rewards ? 1 : 0) : defaults.can_give_rewards,
      can_record_expenses: data.can_record_expenses !== undefined ? (data.can_record_expenses ? 1 : 0) : defaults.can_record_expenses,
      can_process_returns: data.can_process_returns !== undefined ? (data.can_process_returns ? 1 : 0) : defaults.can_process_returns,
      can_add_customers: data.can_add_customers !== undefined ? (data.can_add_customers ? 1 : 0) : defaults.can_add_customers,
      can_edit_customers: data.can_edit_customers !== undefined ? (data.can_edit_customers ? 1 : 0) : defaults.can_edit_customers,
      can_delete_customers: data.can_delete_customers !== undefined ? (data.can_delete_customers ? 1 : 0) : defaults.can_delete_customers,
      can_add_suppliers: data.can_add_suppliers !== undefined ? (data.can_add_suppliers ? 1 : 0) : defaults.can_add_suppliers,
      can_edit_suppliers: data.can_edit_suppliers !== undefined ? (data.can_edit_suppliers ? 1 : 0) : defaults.can_edit_suppliers,
      can_delete_suppliers: data.can_delete_suppliers !== undefined ? (data.can_delete_suppliers ? 1 : 0) : defaults.can_delete_suppliers,
    };

    db.prepare(`INSERT INTO users (
      id, username, password_hash, full_name, role, phone,
      can_view_costs, can_apply_discount, max_discount_pct, can_void_invoice,
      can_manage_products, can_view_reports,
      can_add_products, can_edit_products, can_delete_products, can_manage_inventory,
      can_manage_customers, can_manage_suppliers, can_manage_users, can_manage_settings,
      can_view_audit_log, can_delete_invoices, can_give_rewards, can_record_expenses, can_process_returns,
      can_add_customers, can_edit_customers, can_delete_customers,
      can_add_suppliers, can_edit_suppliers, can_delete_suppliers,
      pin_code, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, data.username, passwordHash, data.full_name, role, data.phone || null,
      perms.can_view_costs, perms.can_apply_discount, perms.max_discount_pct, perms.can_void_invoice,
      perms.can_manage_products, perms.can_view_reports,
      perms.can_add_products, perms.can_edit_products, perms.can_delete_products, perms.can_manage_inventory,
      perms.can_manage_customers, perms.can_manage_suppliers, perms.can_manage_users, perms.can_manage_settings,
      perms.can_view_audit_log, perms.can_delete_invoices, perms.can_give_rewards, perms.can_record_expenses, perms.can_process_returns,
      perms.can_add_customers, perms.can_edit_customers, perms.can_delete_customers,
      perms.can_add_suppliers, perms.can_edit_suppliers, perms.can_delete_suppliers,
      data.pin_code || null, 1
    );

    return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id);
  });

  ipcMain.handle('users:update', async (event, id, data) => {
    const db = getDb();
    const old = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!old) throw new Error('المستخدم غير موجود');
    if (id === 'user-admin-001' && data.role && data.role !== 'admin') {
      throw new Error('لا يمكن تغيير دور المدير العام');
    }

    // If role changed, apply new defaults (unless explicitly overridden)
    const roleChanged = data.role && data.role !== old.role;
    const defaults = roleChanged ? getRoleDefaultPermissions(data.role) : {};

    let sql = `UPDATE users SET 
      full_name = ?, role = ?, phone = ?,
      can_view_costs = ?, can_apply_discount = ?, max_discount_pct = ?,
      can_void_invoice = ?, can_manage_products = ?, can_view_reports = ?,
      can_add_products = ?, can_edit_products = ?, can_delete_products = ?,
      can_manage_inventory = ?, can_manage_customers = ?, can_manage_suppliers = ?,
      can_manage_users = ?, can_manage_settings = ?, can_view_audit_log = ?,
      can_delete_invoices = ?, can_give_rewards = ?, can_record_expenses = ?, can_process_returns = ?,
      can_add_customers = ?, can_edit_customers = ?, can_delete_customers = ?,
      can_add_suppliers = ?, can_edit_suppliers = ?, can_delete_suppliers = ?,
      pin_code = ? 
    WHERE id = ?`;

    const params = [
      data.full_name ?? old.full_name,
      data.role ?? old.role,
      data.phone ?? old.phone,
      data.can_view_costs !== undefined ? (data.can_view_costs ? 1 : 0) : (defaults.can_view_costs ?? old.can_view_costs),
      data.can_apply_discount !== undefined ? (data.can_apply_discount ? 1 : 0) : (defaults.can_apply_discount ?? old.can_apply_discount),
      data.max_discount_pct ?? defaults.max_discount_pct ?? old.max_discount_pct,
      data.can_void_invoice !== undefined ? (data.can_void_invoice ? 1 : 0) : (defaults.can_void_invoice ?? old.can_void_invoice),
      data.can_manage_products !== undefined ? (data.can_manage_products ? 1 : 0) : (defaults.can_manage_products ?? old.can_manage_products),
      data.can_view_reports !== undefined ? (data.can_view_reports ? 1 : 0) : (defaults.can_view_reports ?? old.can_view_reports),
      data.can_add_products !== undefined ? (data.can_add_products ? 1 : 0) : (defaults.can_add_products ?? old.can_add_products),
      data.can_edit_products !== undefined ? (data.can_edit_products ? 1 : 0) : (defaults.can_edit_products ?? old.can_edit_products),
      data.can_delete_products !== undefined ? (data.can_delete_products ? 1 : 0) : (defaults.can_delete_products ?? old.can_delete_products),
      data.can_manage_inventory !== undefined ? (data.can_manage_inventory ? 1 : 0) : (defaults.can_manage_inventory ?? old.can_manage_inventory),
      data.can_manage_customers !== undefined ? (data.can_manage_customers ? 1 : 0) : (defaults.can_manage_customers ?? old.can_manage_customers),
      data.can_manage_suppliers !== undefined ? (data.can_manage_suppliers ? 1 : 0) : (defaults.can_manage_suppliers ?? old.can_manage_suppliers),
      data.can_manage_users !== undefined ? (data.can_manage_users ? 1 : 0) : (defaults.can_manage_users ?? old.can_manage_users),
      data.can_manage_settings !== undefined ? (data.can_manage_settings ? 1 : 0) : (defaults.can_manage_settings ?? old.can_manage_settings),
      data.can_view_audit_log !== undefined ? (data.can_view_audit_log ? 1 : 0) : (defaults.can_view_audit_log ?? old.can_view_audit_log),
      data.can_delete_invoices !== undefined ? (data.can_delete_invoices ? 1 : 0) : (defaults.can_delete_invoices ?? old.can_delete_invoices),
      data.can_give_rewards !== undefined ? (data.can_give_rewards ? 1 : 0) : (defaults.can_give_rewards ?? old.can_give_rewards),
      data.can_record_expenses !== undefined ? (data.can_record_expenses ? 1 : 0) : (defaults.can_record_expenses ?? old.can_record_expenses),
      data.can_process_returns !== undefined ? (data.can_process_returns ? 1 : 0) : (defaults.can_process_returns ?? old.can_process_returns),
      data.can_add_customers !== undefined ? (data.can_add_customers ? 1 : 0) : (defaults.can_add_customers ?? old.can_add_customers),
      data.can_edit_customers !== undefined ? (data.can_edit_customers ? 1 : 0) : (defaults.can_edit_customers ?? old.can_edit_customers),
      data.can_delete_customers !== undefined ? (data.can_delete_customers ? 1 : 0) : (defaults.can_delete_customers ?? old.can_delete_customers),
      data.can_add_suppliers !== undefined ? (data.can_add_suppliers ? 1 : 0) : (defaults.can_add_suppliers ?? old.can_add_suppliers),
      data.can_edit_suppliers !== undefined ? (data.can_edit_suppliers ? 1 : 0) : (defaults.can_edit_suppliers ?? old.can_edit_suppliers),
      data.can_delete_suppliers !== undefined ? (data.can_delete_suppliers ? 1 : 0) : (defaults.can_delete_suppliers ?? old.can_delete_suppliers),
      data.pin_code ?? old.pin_code,
      id
    ];

    db.prepare(sql).run(...params);

    // Update password if provided
    if (data.password) {
      const hash = hashPassword(data.password);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
    }

    return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id);
  });

  ipcMain.handle('users:delete', async (event, id) => {
    const db = getDb();
    if (id === 'user-admin-001') throw new Error('لا يمكن حذف المدير العام');
    db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('users:toggleActive', async (event, id) => {
    const db = getDb();
    if (id === 'user-admin-001') throw new Error('لا يمكن تعطيل المدير العام');
    db.prepare('UPDATE users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
    return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id);
  });
}

module.exports = { registerUserHandlers };
