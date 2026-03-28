const { ipcMain } = require('electron');
const { getDb, generateId, hashPassword } = require('../database');

function registerUserHandlers() {
  ipcMain.handle('users:getAll', async () => {
    const db = getDb();
    return db.prepare('SELECT id, username, full_name, role, phone, can_view_costs, can_apply_discount, max_discount_pct, can_void_invoice, can_manage_products, can_view_reports, pin_code, is_active, last_login_at, created_at FROM users ORDER BY created_at').all();
  });

  ipcMain.handle('users:getById', async (event, id) => {
    const db = getDb();
    const user = db.prepare('SELECT id, username, full_name, role, phone, can_view_costs, can_apply_discount, max_discount_pct, can_void_invoice, can_manage_products, can_view_reports, pin_code, is_active, last_login_at, created_at FROM users WHERE id = ?').get(id);
    return user;
  });

  ipcMain.handle('users:create', async (event, data) => {
    const db = getDb();
    const id = generateId('user');
    const passwordHash = hashPassword(data.password || '1234');

    db.prepare(`INSERT INTO users (id, username, password_hash, full_name, role, phone,
      can_view_costs, can_apply_discount, max_discount_pct, can_void_invoice,
      can_manage_products, can_view_reports, pin_code, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, data.username, passwordHash, data.full_name, data.role || 'cashier',
      data.phone || null,
      data.can_view_costs ? 1 : 0, data.can_apply_discount !== false ? 1 : 0,
      data.max_discount_pct || 0, data.can_void_invoice ? 1 : 0,
      data.can_manage_products ? 1 : 0, data.can_view_reports ? 1 : 0,
      data.pin_code || null, 1
    );
    return db.prepare('SELECT id, username, full_name, role, phone, is_active, created_at FROM users WHERE id = ?').get(id);
  });

  ipcMain.handle('users:update', async (event, id, data) => {
    const db = getDb();
    const old = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!old) throw new Error('المستخدم غير موجود');

    let sql = `UPDATE users SET full_name = ?, role = ?, phone = ?,
      can_view_costs = ?, can_apply_discount = ?, max_discount_pct = ?,
      can_void_invoice = ?, can_manage_products = ?, can_view_reports = ?,
      pin_code = ? WHERE id = ?`;
    const params = [
      data.full_name ?? old.full_name, data.role ?? old.role, data.phone ?? old.phone,
      data.can_view_costs !== undefined ? (data.can_view_costs ? 1 : 0) : old.can_view_costs,
      data.can_apply_discount !== undefined ? (data.can_apply_discount ? 1 : 0) : old.can_apply_discount,
      data.max_discount_pct ?? old.max_discount_pct,
      data.can_void_invoice !== undefined ? (data.can_void_invoice ? 1 : 0) : old.can_void_invoice,
      data.can_manage_products !== undefined ? (data.can_manage_products ? 1 : 0) : old.can_manage_products,
      data.can_view_reports !== undefined ? (data.can_view_reports ? 1 : 0) : old.can_view_reports,
      data.pin_code ?? old.pin_code, id
    ];
    db.prepare(sql).run(...params);

    // Update password if provided
    if (data.password) {
      const hash = hashPassword(data.password);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
    }

    return db.prepare('SELECT id, username, full_name, role, phone, can_view_costs, can_apply_discount, max_discount_pct, can_void_invoice, can_manage_products, can_view_reports, pin_code, is_active, created_at FROM users WHERE id = ?').get(id);
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
    return db.prepare('SELECT id, username, full_name, role, is_active FROM users WHERE id = ?').get(id);
  });
}

module.exports = { registerUserHandlers };
