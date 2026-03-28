const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerCashSessionHandlers() {
  ipcMain.handle('cashSessions:getAll', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM cash_sessions ORDER BY opened_at DESC LIMIT 100').all();
  });

  ipcMain.handle('cashSessions:getCurrent', async () => {
    const db = getDb();
    return db.prepare("SELECT * FROM cash_sessions WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1").get() || null;
  });

  ipcMain.handle('cashSessions:getById', async (event, id) => {
    const db = getDb();
    const session = db.prepare('SELECT * FROM cash_sessions WHERE id = ?').get(id);
    if (!session) return null;

    // Get related invoices
    session.invoices = db.prepare('SELECT * FROM invoices WHERE cash_session_id = ? ORDER BY created_at').all(id);
    session.expenses = db.prepare('SELECT * FROM expenses WHERE cash_session_id = ? ORDER BY created_at').all(id);
    session.payments = db.prepare('SELECT * FROM payments WHERE cash_session_id = ? ORDER BY created_at').all(id);
    return session;
  });

  ipcMain.handle('cashSessions:open', async (event, data) => {
    const db = getDb();
    
    // Check if there's already an open session
    const existing = db.prepare("SELECT id FROM cash_sessions WHERE status = 'open'").get();
    if (existing) throw new Error('يوجد جلسة صندوق مفتوحة بالفعل');

    const id = generateId('ses');
    db.prepare(`INSERT INTO cash_sessions (id, user_id, user_name, opening_balance, expected_balance, status)
      VALUES (?, ?, ?, ?, ?, 'open')`).run(
      id, data.user_id, data.user_name, data.opening_balance || 0, data.opening_balance || 0
    );

    // Audit log
    db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
      VALUES (?, ?, 'فتح_صندوق', 'cash_session', ?, ?)`).run(
      data.user_id, data.user_name, id, `فتح صندوق برصيد ${data.opening_balance || 0} جنيه`
    );

    return db.prepare('SELECT * FROM cash_sessions WHERE id = ?').get(id);
  });

  ipcMain.handle('cashSessions:close', async (event, id, data) => {
    const db = getDb();
    const session = db.prepare('SELECT * FROM cash_sessions WHERE id = ?').get(id);
    if (!session) throw new Error('الجلسة غير موجودة');
    if (session.status === 'closed') throw new Error('الجلسة مغلقة بالفعل');

    const closingBalance = data.closing_balance || 0;
    const difference = closingBalance - session.expected_balance;

    db.prepare(`UPDATE cash_sessions SET 
      closing_balance = ?,
      difference = ?,
      closed_at = datetime('now'),
      status = 'closed',
      notes = ?
      WHERE id = ?`).run(closingBalance, difference, data.notes || null, id);

    // Audit log
    db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
      VALUES (?, ?, 'إغلاق_صندوق', 'cash_session', ?, ?)`).run(
      data.user_id || session.user_id, data.user_name || session.user_name, id,
      `إغلاق صندوق - الرصيد: ${closingBalance} جنيه، الفرق: ${difference} جنيه`
    );

    return db.prepare('SELECT * FROM cash_sessions WHERE id = ?').get(id);
  });
}

module.exports = { registerCashSessionHandlers };
