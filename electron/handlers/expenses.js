const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerExpenseHandlers() {
  ipcMain.handle('expenses:getAll', async (event, filters = {}) => {
    const db = getDb();
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];
    if (filters.dateFrom) { sql += ' AND date >= ?'; params.push(filters.dateFrom); }
    if (filters.dateTo) { sql += ' AND date <= ?'; params.push(filters.dateTo); }
    if (filters.categoryId) { sql += ' AND category_id = ?'; params.push(filters.categoryId); }
    sql += ' ORDER BY created_at DESC LIMIT 500';
    return db.prepare(sql).all(...params);
  });

  ipcMain.handle('expenses:create', async (event, data) => {
    const db = getDb();
    const id = generateId('exp');
    
    // Debug logging
    console.log('Expense create called with:', data);
    
    // Validate user_id exists in users table
    const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(data.user_id);
    console.log('User exists check:', data.user_id, userExists ? 'YES' : 'NO');
    if (!userExists) {
      throw new Error(`المستخدم غير موجود: ${data.user_id}. يرجى تسجيل الدخول.`);
    }
    
    // Validate category_id exists
    const categoryExists = db.prepare('SELECT id FROM expense_categories WHERE id = ?').get(data.category_id);
    console.log('Category exists check:', data.category_id, categoryExists ? 'YES' : 'NO');
    if (!categoryExists) {
      throw new Error(`التصنيف غير موجود: ${data.category_id}`);
    }
    
    try {
      db.transaction(() => {
        db.prepare(`INSERT INTO expenses (id, category_id, category_name, amount, description, method,
          date, cash_session_id, user_id, user_name, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          id, data.category_id, data.category_name || null, data.amount, data.description,
          data.method || 'نقدي', data.date || new Date().toISOString().split('T')[0],
          data.cash_session_id || null, data.user_id, data.user_name || null, data.notes || null
        );

        // Update cash session if cash expense
        if (data.cash_session_id && data.method === 'نقدي') {
          db.prepare('UPDATE cash_sessions SET total_expenses = total_expenses + ?, expected_balance = expected_balance - ? WHERE id = ?')
            .run(data.amount, data.amount, data.cash_session_id);
        }
      })();
    } catch (err) {
      console.error('Database error during expense creation:', err);
      throw err;
    }

    return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  });

  ipcMain.handle('expenses:update', async (event, id, data) => {
    const db = getDb();
    db.prepare(`UPDATE expenses SET category_id = ?, category_name = ?, amount = ?, description = ?,
      method = ?, date = ?, notes = ? WHERE id = ?`).run(
      data.category_id, data.category_name || null, data.amount, data.description,
      data.method || 'نقدي', data.date, data.notes || null, id
    );
    return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  });

  ipcMain.handle('expenses:delete', async (event, id) => {
    const db = getDb();
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (expense && expense.cash_session_id && expense.method === 'نقدي') {
      db.prepare('UPDATE cash_sessions SET total_expenses = MAX(0, total_expenses - ?), expected_balance = expected_balance + ? WHERE id = ?')
        .run(expense.amount, expense.amount, expense.cash_session_id);
    }
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('expenses:getCategories', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('expenses:createCategory', async (event, data) => {
    const db = getDb();
    const id = generateId('ec');
    db.prepare('INSERT INTO expense_categories (id, name) VALUES (?, ?)').run(id, data.name);
    return db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(id);
  });
}

module.exports = { registerExpenseHandlers };
