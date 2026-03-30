const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerReturnHandlers() {
  ipcMain.handle('returns:getAll', async () => {
    const db = getDb();
    const returns = db.prepare(`
      SELECT r.*, i.invoice_number as original_invoice_number 
      FROM returns r
      LEFT JOIN invoices i ON r.original_invoice_id = i.id
      ORDER BY r.created_at DESC LIMIT 500
    `).all();
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
    
    console.log('[DEBUG] Received return creation request:', {
      original_invoice_id: data.original_invoice_id,
      refund_amount: data.refund_amount,
      items_count: data.items?.length
    });
    
    const last = db.prepare("SELECT return_number FROM returns ORDER BY created_at DESC LIMIT 1").get();
    let returnNumber = 'R-001';
    if (last) {
      const num = parseInt(last.return_number.replace('R-', '')) + 1;
      returnNumber = `R-${String(num).padStart(3, '0')}`;
    }

    return db.transaction(() => {
      // Verify invoice exists first
      const invoice = db.prepare('SELECT id, payment_method, customer_id, paid, credit_amount, cash_session_id, total FROM invoices WHERE id = ?').get(data.original_invoice_id);
      if (!invoice) {
        throw new Error(`الفاتورة الأصلية غير موجودة: ${data.original_invoice_id}`);
      }

      // Check for duplicate returns of same product from same invoice
      console.log('[DEBUG] Checking for existing returns for invoice:', data.original_invoice_id);
      
      const existingReturns = db.prepare(`
        SELECT ri.product_id, SUM(ri.qty_returned) as total_returned
        FROM returns r
        JOIN return_items ri ON r.id = ri.return_id
        WHERE r.original_invoice_id = ?
        GROUP BY ri.product_id
      `).all(data.original_invoice_id);
      
      console.log('[DEBUG] Existing returns found:', existingReturns);
      
      const returnedQuantities = {};
      for (const row of existingReturns) {
        returnedQuantities[row.product_id] = row.total_returned;
      }
      
      console.log('[DEBUG] Returned quantities map:', returnedQuantities);
      
      // Validate no duplicate returns and quantities don't exceed invoice
      const invoiceItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(data.original_invoice_id);
      console.log('[DEBUG] Invoice items:', invoiceItems);
      
      for (const item of (data.items || [])) {
        const invoiceItem = invoiceItems.find(ii => ii.product_id === item.product_id);
        if (!invoiceItem) {
          throw new Error(`المنتج ${item.product_name} غير موجود في الفاتورة الأصلية`);
        }
        
        const alreadyReturned = returnedQuantities[item.product_id] || 0;
        const newTotal = alreadyReturned + item.qty_returned;
        
        console.log(`[DEBUG] Product ${item.product_id}: alreadyReturned=${alreadyReturned}, qty_returned=${item.qty_returned}, newTotal=${newTotal}, invoiceQty=${invoiceItem.qty}`);
        
        if (newTotal > invoiceItem.qty) {
          throw new Error(`الكمية المسترجعة للمنتج ${item.product_name} (${newTotal}) تتجاوز الكمية في الفاتورة (${invoiceItem.qty}). تم إرجاع ${alreadyReturned} سابقاً`);
        }
      }

      // Verify user exists
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(data.user_id);
      if (!user) {
        throw new Error(`المستخدم غير موجود: ${data.user_id}`);
      }

      // Verify customer exists if provided
      if (data.customer_id) {
        const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(data.customer_id);
        if (!customer) {
          throw new Error(`العميل غير موجود: ${data.customer_id}`);
        }
      }

      // Verify all products exist
      for (const item of (data.items || [])) {
        const product = db.prepare('SELECT id FROM products WHERE id = ?').get(item.product_id);
        if (!product) {
          throw new Error(`المنتج غير موجود: ${item.product_id}`);
        }
      }

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

      // Update customer balance if original invoice was deferred (آجل)
      console.log('[DEBUG] Checking deferred return conditions:');
      console.log('[DEBUG] - Payment method:', invoice.payment_method);
      console.log('[DEBUG] - Customer ID:', invoice.customer_id);
      console.log('[DEBUG] - Refund amount:', data.refund_amount);
      
      if (invoice.payment_method === 'آجل' && invoice.customer_id && data.refund_amount > 0) {
        console.log('[DEBUG] Processing deferred return - deducting from customer debt');
        
        db.prepare(`UPDATE customers SET 
          current_balance = MAX(0, current_balance - ?),
          credit_used = MAX(0, credit_used - ?),
          total_debts = MAX(0, total_debts - ?)
          WHERE id = ?`).run(
          data.refund_amount, data.refund_amount, data.refund_amount, invoice.customer_id
        );
        
        // Log the debt reduction
        db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
          VALUES (?, 'النظام', 'تخفيض_دين', 'customer', ?, ?)`).run(
          data.user_id, invoice.customer_id, `تخفيض دين بسبب مرتجع ${returnNumber} - المبلغ: ${data.refund_amount} جنيه`
        );
      } else {
        console.log('[DEBUG] Skipping deferred return processing - conditions not met');
      }

      // Update cash session - deduct from revenue for cash payments
      console.log('[DEBUG] Checking cash session conditions:');
      console.log('[DEBUG] - Cash session ID:', invoice.cash_session_id);
      
      if (invoice.cash_session_id) {
        if (invoice.payment_method === 'نقدي') {
          console.log('[DEBUG] Processing cash return - deducting from revenue');
          
          db.prepare(`UPDATE cash_sessions SET 
            total_returns = total_returns + ?,
            total_sales_cash = MAX(0, total_sales_cash - ?),
            expected_balance = expected_balance - ?
            WHERE id = ?`).run(
            data.refund_amount, data.refund_amount, data.refund_amount, invoice.cash_session_id
          );
        } else if (invoice.payment_method === 'آجل') {
          console.log('[DEBUG] Processing deferred return - updating cash session tracking only');
          
          // For deferred, only track the return, don't affect cash balance
          db.prepare(`UPDATE cash_sessions SET 
            total_returns = total_returns + ?
            WHERE id = ?`).run(
            data.refund_amount, invoice.cash_session_id
          );
        }
      } else {
        console.log('[DEBUG] Skipping cash session update - no cash_session_id');
      }

      // Mark original invoice as returned
      // Note: Using 'مرتجع' only since existing DB may not have 'مرتجع_جزئي'/'مرتجع_بالكامل' in CHECK constraint
      db.prepare("UPDATE invoices SET status = 'مرتجع' WHERE id = ?").run(data.original_invoice_id);

      // Deduct refund amount from invoice total (revenue)
      console.log('[DEBUG] Deducting refund from invoice total:', data.refund_amount);
      db.prepare('UPDATE invoices SET total = MAX(0, total - ?) WHERE id = ?').run(
        data.refund_amount, data.original_invoice_id
      );

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

  ipcMain.handle('returns:delete', async (event, id) => {
    const db = getDb();
    
    return db.transaction(() => {
      // Get return details first
      const ret = db.prepare('SELECT * FROM returns WHERE id = ?').get(id);
      if (!ret) throw new Error('المسترجعة غير موجودة');
      
      // Get original invoice to check payment method
      const invoice = db.prepare('SELECT payment_method, customer_id, cash_session_id FROM invoices WHERE id = ?').get(ret.original_invoice_id);
      
      // Get return items to reverse stock if needed
      const items = db.prepare('SELECT * FROM return_items WHERE return_id = ?').all(id);
      
      // Prepare statements outside loop for better performance
      const getProduct = db.prepare('SELECT stock, is_service FROM products WHERE id = ?');
      const updateStock = db.prepare('UPDATE products SET stock = ? WHERE id = ?');
      
      // Reverse stock for restocked items
      for (const item of items) {
        if (item.restock) {
          const product = getProduct.get(item.product_id);
          if (product && !product.is_service) {
            const newStock = Math.max(0, product.stock - item.qty_returned);
            updateStock.run(newStock, item.product_id);
          }
        }
      }
      
      // Reverse customer balance if original was deferred
      if (invoice && invoice.payment_method === 'آجل' && invoice.customer_id && ret.refund_amount > 0) {
        db.prepare(`UPDATE customers SET 
          current_balance = current_balance + ?,
          credit_used = credit_used + ?,
          total_debts = total_debts + ?
          WHERE id = ?`).run(
          ret.refund_amount, ret.refund_amount, ret.refund_amount, invoice.customer_id
        );
      }
      
      // Reverse cash session updates
      if (invoice && invoice.cash_session_id) {
        if (invoice.payment_method === 'نقدي') {
          db.prepare(`UPDATE cash_sessions SET 
            total_returns = MAX(0, total_returns - ?),
            total_sales_cash = total_sales_cash + ?,
            expected_balance = expected_balance + ?
            WHERE id = ?`).run(
            ret.refund_amount, ret.refund_amount, ret.refund_amount, invoice.cash_session_id
          );
        } else if (invoice.payment_method === 'آجل') {
          db.prepare(`UPDATE cash_sessions SET 
            total_returns = MAX(0, total_returns - ?)
            WHERE id = ?`).run(
            ret.refund_amount, invoice.cash_session_id
          );
        }
      }
      
      // Reset invoice status to 'مكتمل' if it was 'مرتجع'
      if (invoice) {
        db.prepare("UPDATE invoices SET status = 'مكتمل' WHERE id = ? AND status = 'مرتجع'").run(ret.original_invoice_id);
      }
      
      // Restore refund amount to invoice total (revenue) when deleting return
      db.prepare('UPDATE invoices SET total = total + ? WHERE id = ?').run(
        ret.refund_amount, ret.original_invoice_id
      );
      
      // Delete loyalty transactions referencing this return
      db.prepare("DELETE FROM loyalty_transactions WHERE source_type = 'مرتجع' AND source_id = ?").run(id);
      
      // Delete related audit logs
      db.prepare("DELETE FROM audit_log WHERE entity_type = 'return' AND entity_id = ?").run(id);
      
      // Delete return items
      db.prepare('DELETE FROM return_items WHERE return_id = ?').run(id);
      
      // Delete the return
      db.prepare('DELETE FROM returns WHERE id = ?').run(id);
      
      // Audit log for the deletion itself
      let auditUserId = ret.user_id;
      
      // Verify user exists in database
      if (auditUserId) {
        const auditUserExists = db.prepare("SELECT 1 FROM users WHERE id = ?").get(auditUserId);
        if (!auditUserExists) {
          auditUserId = null;
        }
      }
      
      if (!auditUserId) {
        const auditUserRow = db.prepare("SELECT id FROM users LIMIT 1").get();
        if (auditUserRow && auditUserRow.id) {
          auditUserId = auditUserRow.id;
        }
      }
      if (auditUserId) {
        try {
          db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
            VALUES (?, 'النظام', 'حذف_سجل', 'return', ?, ?)`).run(
            auditUserId, id, `حذف مرتجع ${ret.return_number}`
          );
        } catch (err) {
          // Silent fail - audit log not critical
        }
      }
      
      return { success: true };
    })();
  });
}

module.exports = { registerReturnHandlers };
