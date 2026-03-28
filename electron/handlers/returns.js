const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerReturnHandlers() {
  ipcMain.handle('returns:getAll', async () => {
    const db = getDb();
    const returns = db.prepare('SELECT * FROM returns ORDER BY created_at DESC LIMIT 500').all();
    for (const ret of returns) {
      ret.items = db.prepare('SELECT * FROM return_items WHERE return_id = ?').all(ret.id);
    }
    return returns;
  });

  ipcMain.handle('returns:getById', async (event, id) => {
    const db = getDb();
    const ret = db.prepare('SELECT * FROM returns WHERE id = ?').get(id);
    if (!ret) return null;
    ret.items = db.prepare('SELECT * FROM return_items WHERE return_id = ?').all(id);
    return ret;
  });

  ipcMain.handle('returns:getByInvoice', async (event, invoiceId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM returns WHERE original_invoice_id = ?').all(invoiceId);
  });

  ipcMain.handle('returns:create', async (event, data) => {
    const db = getDb();
    const returnId = generateId('ret');
    
    const last = db.prepare("SELECT return_number FROM returns ORDER BY created_at DESC LIMIT 1").get();
    let returnNumber = 'R-001';
    if (last) {
      const num = parseInt(last.return_number.replace('R-', '')) + 1;
      returnNumber = `R-${String(num).padStart(3, '0')}`;
    }

    return db.transaction(() => {
      db.prepare(`INSERT INTO returns (
        id, return_number, original_invoice_id, customer_id, user_id,
        return_date, reason, reason_notes, return_type,
        refund_amount, refund_method, cash_session_id, notes
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?)`).run(
        returnId, returnNumber, data.original_invoice_id,
        data.customer_id || null, data.user_id,
        data.reason || 'غير_ذلك', data.reason_notes || null,
        data.return_type || 'استرداد_نقدي',
        data.refund_amount || 0, data.refund_method || 'نقدي',
        data.cash_session_id || null, data.notes || null
      );

      const insertItem = db.prepare(`INSERT INTO return_items (
        id, return_id, product_id, product_name, invoice_item_id,
        qty_returned, unit_price, refund_amount, restock, condition
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      for (const item of (data.items || [])) {
        insertItem.run(
          generateId('ri'), returnId, item.product_id, item.product_name,
          item.invoice_item_id || null, item.qty_returned, item.unit_price,
          item.refund_amount, item.restock ? 1 : 0, item.condition || 'سليم'
        );

        // Restock if flagged
        if (item.restock) {
          const product = db.prepare('SELECT stock, is_service FROM products WHERE id = ?').get(item.product_id);
          if (product && !product.is_service) {
            const oldStock = product.stock;
            const newStock = oldStock + item.qty_returned;
            db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, item.product_id);
            db.prepare(`INSERT INTO stock_movements (id, product_id, product_name, movement_type,
              qty_before, qty_change, qty_after, unit_cost, ref_type, ref_id, user_id, notes)
              VALUES (?, ?, ?, 'مرتجع_بيع', ?, ?, ?, ?, 'return', ?, ?, ?)`).run(
              generateId('mov'), item.product_id, item.product_name,
              oldStock, item.qty_returned, newStock, item.unit_price,
              returnId, data.user_id, `مرتجع ${returnNumber}`
            );
          }
        }
      }

      // Update customer balance if deferred refund
      if (data.customer_id && data.return_type === 'رصيد_للعميل') {
        db.prepare('UPDATE customers SET current_balance = current_balance - ? WHERE id = ?').run(
          data.refund_amount, data.customer_id
        );
      }

      // Update cash session
      if (data.cash_session_id && data.refund_method === 'نقدي') {
        db.prepare(`UPDATE cash_sessions SET 
          total_returns = total_returns + ?,
          expected_balance = expected_balance - ?
          WHERE id = ?`).run(data.refund_amount, data.refund_amount, data.cash_session_id);
      }

      // Mark original invoice as returned
      db.prepare("UPDATE invoices SET status = 'مرتجع' WHERE id = ?").run(data.original_invoice_id);

      // Audit log
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
        VALUES (?, 'النظام', 'مرتجع', 'return', ?, ?)`).run(
        data.user_id, returnId, `مرتجع ${returnNumber} - المبلغ: ${data.refund_amount} جنيه`
      );

      const ret = db.prepare('SELECT * FROM returns WHERE id = ?').get(returnId);
      ret.items = db.prepare('SELECT * FROM return_items WHERE return_id = ?').all(returnId);
      return ret;
    })();
  });
}

module.exports = { registerReturnHandlers };
