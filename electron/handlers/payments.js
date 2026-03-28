const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerPaymentHandlers() {
  ipcMain.handle('payments:getAll', async (event, filters = {}) => {
    const db = getDb();
    let sql = 'SELECT * FROM payments WHERE 1=1';
    const params = [];
    if (filters.partyType) { sql += ' AND party_type = ?'; params.push(filters.partyType); }
    if (filters.dateFrom) { sql += ' AND date >= ?'; params.push(filters.dateFrom); }
    if (filters.dateTo) { sql += ' AND date <= ?'; params.push(filters.dateTo); }
    sql += ' ORDER BY created_at DESC LIMIT 500';
    return db.prepare(sql).all(...params);
  });

  ipcMain.handle('payments:create', async (event, data) => {
    const db = getDb();
    const id = generateId('pay');

    return db.transaction(() => {
      db.prepare(`INSERT INTO payments (id, payment_direction, party_type, party_id, party_name,
        amount, method, reference_number, invoice_id, purchase_id, cash_session_id, date, user_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, data.payment_direction, data.party_type, data.party_id, data.party_name,
        data.amount, data.method || 'نقدي', data.reference_number || null,
        data.invoice_id || null, data.purchase_id || null,
        data.cash_session_id || null, data.date || new Date().toISOString().split('T')[0],
        data.user_id, data.notes || null
      );

      // Update balances
      if (data.party_type === 'customer' && data.payment_direction === 'تحصيل') {
        db.prepare(`UPDATE customers SET 
          current_balance = MAX(0, current_balance - ?),
          credit_used = MAX(0, credit_used - ?),
          total_paid = total_paid + ?,
          last_payment_date = ?
          WHERE id = ?`).run(data.amount, data.amount, data.amount, data.date || new Date().toISOString().split('T')[0], data.party_id);

        // Update cash session collections
        if (data.cash_session_id && data.method === 'نقدي') {
          db.prepare('UPDATE cash_sessions SET total_collections = total_collections + ?, expected_balance = expected_balance + ? WHERE id = ?')
            .run(data.amount, data.amount, data.cash_session_id);
        }

        // Audit
        db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
          VALUES (?, 'النظام', 'تحصيل_دين', 'payment', ?, ?)`).run(
          data.user_id, id, `تحصيل ${data.amount} جنيه من ${data.party_name}`
        );
      } else if (data.party_type === 'supplier' && data.payment_direction === 'سداد') {
        db.prepare('UPDATE suppliers SET current_balance = MAX(0, current_balance - ?) WHERE id = ?')
          .run(data.amount, data.party_id);

        // Update related purchase
        if (data.purchase_id) {
          const purchase = db.prepare('SELECT paid, total FROM purchases WHERE id = ?').get(data.purchase_id);
          if (purchase) {
            const newPaid = purchase.paid + data.amount;
            const remaining = Math.max(0, purchase.total - newPaid);
            const status = remaining <= 0 ? 'مدفوع' : 'جزئي';
            db.prepare('UPDATE purchases SET paid = ?, remaining = ?, payment_status = ? WHERE id = ?')
              .run(newPaid, remaining, status, data.purchase_id);
          }
        }
      }

      return db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    })();
  });

  ipcMain.handle('payments:getByParty', async (event, partyType, partyId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM payments WHERE party_type = ? AND party_id = ? ORDER BY created_at DESC').all(partyType, partyId);
  });
}

module.exports = { registerPaymentHandlers };
