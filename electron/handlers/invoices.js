const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerInvoiceHandlers() {
  // Get next invoice number
  ipcMain.handle('invoices:getNextNumber', async () => {
    const db = getDb();
    const last = db.prepare("SELECT invoice_number FROM invoices ORDER BY created_at DESC LIMIT 1").get();
    if (!last) return 'F-001';
    const num = parseInt(last.invoice_number.replace('F-', '')) + 1;
    return `F-${String(num).padStart(3, '0')}`;
  });

  // Get all invoices with filters
  ipcMain.handle('invoices:getAll', async (event, filters = {}) => {
    const db = getDb();
    let sql = `SELECT * FROM invoices WHERE 1=1`;
    const params = [];

    if (filters.dateFrom) { sql += ` AND date >= ?`; params.push(filters.dateFrom); }
    if (filters.dateTo) { sql += ` AND date <= ?`; params.push(filters.dateTo); }
    if (filters.customerId) { sql += ` AND customer_id = ?`; params.push(filters.customerId); }
    if (filters.status) { sql += ` AND status = ?`; params.push(filters.status); }
    if (filters.paymentMethod) { sql += ` AND payment_method = ?`; params.push(filters.paymentMethod); }
    if (filters.invoiceType) { sql += ` AND invoice_type = ?`; params.push(filters.invoiceType); }

    sql += ` ORDER BY created_at DESC LIMIT 500`;
    const invoices = db.prepare(sql).all(...params);
    
    // Fetch items for each invoice
    for (const invoice of invoices) {
      invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoice.id);
    }
    
    return invoices;
  });

  // Get invoice by ID with items
  ipcMain.handle('invoices:getById', async (event, id) => {
    const db = getDb();
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) return null;
    invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id);
    return invoice;
  });

  // Get by customer
  ipcMain.handle('invoices:getByCustomer', async (event, customerId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100').all(customerId);
  });

  // ============================================================================
  // CREATE INVOICE — Full POS business logic
  // ============================================================================
  ipcMain.handle('invoices:create', async (event, data) => {
    const db = getDb();
    const invoiceId = generateId('inv');
    
    // Get the next invoice number
    const last = db.prepare("SELECT invoice_number FROM invoices WHERE invoice_type = 'بيع' ORDER BY created_at DESC LIMIT 1").get();
    let invoiceNumber;
    if (!last) {
      invoiceNumber = 'F-001';
    } else {
      const num = parseInt(last.invoice_number.replace('F-', '')) + 1;
      invoiceNumber = `F-${String(num).padStart(3, '0')}`;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 8);

    return db.transaction(() => {
      // 1. Insert invoice
      db.prepare(`INSERT INTO invoices (
        id, invoice_number, invoice_type, date, time,
        customer_id, customer_name, user_id, user_name, cash_session_id,
        subtotal, tax_amount, discount_amount, discount_type, discount_pct, total,
        payment_method, paid, change_amount, credit_amount, due_date,
        points_earned, points_redeemed, points_discount,
        status, notes
      ) VALUES (
        @id, @invoice_number, 'بيع', @date, @time,
        @customer_id, @customer_name, @user_id, @user_name, @cash_session_id,
        @subtotal, @tax_amount, @discount_amount, @discount_type, @discount_pct, @total,
        @payment_method, @paid, @change_amount, @credit_amount, @due_date,
        @points_earned, @points_redeemed, @points_discount,
        'مكتمل', @notes
      )`).run({
        id: invoiceId,
        invoice_number: invoiceNumber,
        date: dateStr,
        time: timeStr,
        customer_id: data.customer_id || null,
        customer_name: data.customer_name || null,
        user_id: data.user_id,
        user_name: data.user_name,
        cash_session_id: data.cash_session_id || null,
        subtotal: data.subtotal || 0,
        tax_amount: data.tax_amount || 0,
        discount_amount: data.discount_amount || 0,
        discount_type: data.discount_type || 'مبلغ',
        discount_pct: data.discount_pct || 0,
        total: data.total,
        payment_method: data.payment_method || 'نقدي',
        paid: data.paid || 0,
        change_amount: data.change_amount || 0,
        credit_amount: data.credit_amount || 0,
        due_date: data.due_date || null,
        points_earned: data.points_earned || 0,
        points_redeemed: data.points_redeemed || 0,
        points_discount: data.points_discount || 0,
        notes: data.notes || null,
      });

      // 2. Insert invoice items and deduct stock
      const insertItem = db.prepare(`INSERT INTO invoice_items (
        id, invoice_id, product_id, product_name, product_barcode,
        qty, unit, unit_price, cost_price, discount_amount, tax_amount, total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND is_service = 0');
      
      const insertMovement = db.prepare(`INSERT INTO stock_movements (
        id, product_id, product_name, movement_type, qty_before, qty_change, qty_after,
        unit_cost, ref_type, ref_id, user_id, notes
      ) VALUES (?, ?, ?, 'بيع', ?, ?, ?, ?, 'invoice', ?, ?, ?)`);

      for (const item of (data.items || [])) {
        const itemId = generateId('ii');
        insertItem.run(
          itemId, invoiceId, item.product_id, item.product_name, item.product_barcode || null,
          item.qty, item.unit || 'قطعة', item.unit_price, item.cost_price || 0,
          item.discount_amount || 0, item.tax_amount || 0, item.total, item.notes || null
        );

        // Deduct stock (for non-service products)
        const product = db.prepare('SELECT stock, is_service FROM products WHERE id = ?').get(item.product_id);
        if (product && !product.is_service) {
          const oldStock = product.stock;
          const newStock = oldStock - item.qty;
          updateStock.run(item.qty, item.product_id);
          insertMovement.run(
            generateId('mov'), item.product_id, item.product_name,
            oldStock, -item.qty, newStock, item.cost_price || 0,
            invoiceId, data.user_id, `فاتورة بيع ${invoiceNumber}`
          );

          // Low stock notification
          const prd = db.prepare('SELECT stock, stock_alert, name, unit FROM products WHERE id = ?').get(item.product_id);
          if (prd && prd.stock <= prd.stock_alert && prd.stock >= 0) {
            db.prepare(`INSERT INTO notifications (id, type, title, message, ref_type, ref_id)
              VALUES (?, 'نقص_مخزون', 'تنبيه مخزون منخفض', ?, 'product', ?)`).run(
              generateId('notif'), `المنتج "${prd.name}" وصل إلى ${prd.stock} ${prd.unit}`, item.product_id
            );
          }
        }
      }

      // 3. Handle deferred payment (آجل) — update customer balance
      if (data.payment_method === 'آجل' && data.customer_id && data.credit_amount > 0) {
        // Log before update for verification
        const beforeCustomer = db.prepare('SELECT current_balance, credit_used, name FROM customers WHERE id = ?').get(data.customer_id);
        console.log(`[DEBT-TEST] Before credit sale - Customer: ${beforeCustomer?.name}, Balance: ${beforeCustomer?.current_balance}, Credit: ${data.credit_amount}`);
        
        db.prepare(`UPDATE customers SET 
          current_balance = current_balance + ?,
          credit_used = credit_used + ?,
          total_debts = total_debts + ?,
          total_purchases = total_purchases + ?,
          last_purchase_date = ?,
          last_debt_date = ?
          WHERE id = ?`).run(
          data.credit_amount, data.credit_amount, data.credit_amount,
          data.total, dateStr, dateStr, data.customer_id
        );
        
        // Log after update
        const afterCustomer = db.prepare('SELECT current_balance, credit_used FROM customers WHERE id = ?').get(data.customer_id);
        console.log(`[DEBT-TEST] After credit sale - New Balance: ${afterCustomer?.current_balance}, Expected: ${(beforeCustomer?.current_balance || 0) + data.credit_amount}`);
        console.log(`[DEBT-TEST] ✓ Credit sale processed successfully`);
      } else if (data.customer_id) {
        // Cash sale but with customer — update their purchase history
        db.prepare(`UPDATE customers SET 
          total_purchases = total_purchases + ?,
          last_purchase_date = ?
          WHERE id = ?`).run(data.total, dateStr, data.customer_id);
      }

      // 4. Handle loyalty points
      if (data.points_earned > 0 && data.customer_id) {
        const customer = db.prepare('SELECT loyalty_points FROM customers WHERE id = ?').get(data.customer_id);
        const balanceBefore = customer?.loyalty_points || 0;
        const balanceAfter = balanceBefore + data.points_earned;
        
        db.prepare('UPDATE customers SET loyalty_points = ? WHERE id = ?').run(balanceAfter, data.customer_id);
        db.prepare(`INSERT INTO loyalty_transactions (id, customer_id, transaction_type, points,
          balance_before, balance_after, source_type, source_id, user_id, notes)
          VALUES (?, ?, 'اكتساب', ?, ?, ?, 'فاتورة', ?, ?, ?)`).run(
          generateId('loy'), data.customer_id, data.points_earned,
          balanceBefore, balanceAfter, invoiceId, data.user_id, `فاتورة ${invoiceNumber}`
        );
      }

      if (data.points_redeemed > 0 && data.customer_id) {
        const customer = db.prepare('SELECT loyalty_points FROM customers WHERE id = ?').get(data.customer_id);
        const balanceBefore = customer?.loyalty_points || 0;
        const balanceAfter = balanceBefore - data.points_redeemed;

        db.prepare('UPDATE customers SET loyalty_points = ? WHERE id = ?').run(balanceAfter, data.customer_id);
        db.prepare(`INSERT INTO loyalty_transactions (id, customer_id, transaction_type, points,
          balance_before, balance_after, source_type, source_id, user_id, notes)
          VALUES (?, ?, 'استخدام', ?, ?, ?, 'فاتورة', ?, ?, ?)`).run(
          generateId('loy'), data.customer_id, data.points_redeemed,
          balanceBefore, balanceAfter, invoiceId, data.user_id, `فاتورة ${invoiceNumber}`
        );
      }

      // 5. Update cash session totals
      if (data.cash_session_id) {
        if (data.payment_method === 'نقدي') {
          db.prepare(`UPDATE cash_sessions SET 
            total_sales_cash = total_sales_cash + ?,
            invoices_count = invoices_count + 1,
            expected_balance = expected_balance + ?
            WHERE id = ?`).run(data.total, data.paid - (data.change_amount || 0), data.cash_session_id);
        } else if (data.payment_method === 'آجل') {
          db.prepare(`UPDATE cash_sessions SET 
            total_sales_deferred = total_sales_deferred + ?,
            invoices_count = invoices_count + 1
            WHERE id = ?`).run(data.credit_amount || data.total, data.cash_session_id);
          // If partial cash payment
          if (data.paid > 0) {
            db.prepare(`UPDATE cash_sessions SET 
              total_sales_cash = total_sales_cash + ?,
              expected_balance = expected_balance + ?
              WHERE id = ?`).run(data.paid, data.paid, data.cash_session_id);
          }
        }
      }

      // 6. Audit log
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
        VALUES (?, ?, 'بيع_جديد', 'invoice', ?, ?)`).run(
        data.user_id, data.user_name, invoiceId,
        `فاتورة بيع ${invoiceNumber} - المبلغ: ${data.total} جنيه`
      );

      // Return the created invoice
      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
      invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
      return invoice;
    })();
  });

  // Void invoice
  ipcMain.handle('invoices:void', async (event, id, reason, userId) => {
    const db = getDb();
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) throw new Error('الفاتورة غير موجودة');
    if (invoice.status !== 'مكتمل') throw new Error('لا يمكن إلغاء هذه الفاتورة');

    return db.transaction(() => {
      // Mark as cancelled
      db.prepare("UPDATE invoices SET status = 'ملغي', void_reason = ? WHERE id = ?").run(reason, id);

      // Restore stock
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id);
      for (const item of items) {
        const product = db.prepare('SELECT stock, is_service FROM products WHERE id = ?').get(item.product_id);
        if (product && !product.is_service) {
          const oldStock = product.stock;
          const newStock = oldStock + item.qty;
          db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, item.product_id);
          db.prepare(`INSERT INTO stock_movements (id, product_id, product_name, movement_type,
            qty_before, qty_change, qty_after, unit_cost, ref_type, ref_id, user_id, notes)
            VALUES (?, ?, ?, 'مرتجع_بيع', ?, ?, ?, ?, 'invoice', ?, ?, ?)`).run(
            generateId('mov'), item.product_id, item.product_name,
            oldStock, item.qty, newStock, item.cost_price,
            id, userId, `إلغاء فاتورة ${invoice.invoice_number}`
          );
        }
      }

      // Reverse customer balance if deferred
      if (invoice.payment_method === 'آجل' && invoice.customer_id && invoice.credit_amount > 0) {
        db.prepare(`UPDATE customers SET 
          current_balance = MAX(0, current_balance - ?),
          credit_used = MAX(0, credit_used - ?),
          total_debts = MAX(0, total_debts - ?)
          WHERE id = ?`).run(invoice.credit_amount, invoice.credit_amount, invoice.credit_amount, invoice.customer_id);
      }

      // Update cash session
      if (invoice.cash_session_id) {
        if (invoice.payment_method === 'نقدي') {
          db.prepare(`UPDATE cash_sessions SET 
            total_sales_cash = MAX(0, total_sales_cash - ?),
            invoices_count = MAX(0, invoices_count - 1),
            expected_balance = expected_balance - ?
            WHERE id = ?`).run(invoice.total, invoice.paid - (invoice.change_amount || 0), invoice.cash_session_id);
        }
      }

      // Audit log
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
        VALUES (?, 'النظام', 'إلغاء_فاتورة', 'invoice', ?, ?)`).run(
        userId, id, `إلغاء فاتورة ${invoice.invoice_number}: ${reason}`
      );

      return { success: true };
    })();
  });

  // Suspended invoices
  ipcMain.handle('invoices:getSuspended', async () => {
    const db = getDb();
    const invoices = db.prepare("SELECT * FROM invoices WHERE status = 'معلق' ORDER BY created_at DESC").all();
    for (const inv of invoices) {
      inv.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(inv.id);
    }
    return invoices;
  });

  ipcMain.handle('invoices:suspend', async (event, data) => {
    const db = getDb();
    const invoiceId = generateId('inv');
    const last = db.prepare("SELECT invoice_number FROM invoices ORDER BY created_at DESC LIMIT 1").get();
    let invoiceNumber = 'F-001';
    if (last) {
      const num = parseInt(last.invoice_number.replace('F-', '')) + 1;
      invoiceNumber = `F-${String(num).padStart(3, '0')}`;
    }

    const now = new Date();

    db.transaction(() => {
      db.prepare(`INSERT INTO invoices (id, invoice_number, invoice_type, date, time,
        customer_id, customer_name, user_id, user_name, cash_session_id,
        subtotal, total, payment_method, status, notes)
        VALUES (?, ?, 'بيع', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'نقدي', 'معلق', ?)`).run(
        invoiceId, invoiceNumber, now.toISOString().split('T')[0], now.toTimeString().slice(0, 8),
        data.customer_id || null, data.customer_name || null,
        data.user_id, data.user_name, data.cash_session_id || null,
        data.subtotal || 0, data.total || 0, data.notes || 'فاتورة معلقة'
      );

      const insertItem = db.prepare(`INSERT INTO invoice_items (id, invoice_id, product_id, product_name,
        qty, unit, unit_price, cost_price, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      for (const item of (data.items || [])) {
        insertItem.run(generateId('ii'), invoiceId, item.product_id, item.product_name,
          item.qty, item.unit || 'قطعة', item.unit_price, item.cost_price || 0, item.total);
      }
    })();

    return { id: invoiceId, invoice_number: invoiceNumber };
  });

  ipcMain.handle('invoices:resumeSuspended', async (event, id) => {
    const db = getDb();
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND status = ?').get(id, 'معلق');
    if (!invoice) throw new Error('الفاتورة غير موجودة');
    invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id);
    // Delete the suspended invoice (it will be re-created when completed)
    db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
    db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    return invoice;
  });

  ipcMain.handle('invoices:deleteSuspended', async (event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
    db.prepare("DELETE FROM invoices WHERE id = ? AND status = 'معلق'").run(id);
    return { success: true };
  });

  // Delete invoice completely (hard delete)
  ipcMain.handle('invoices:delete', async (event, id) => {
    const db = getDb();
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) throw new Error('الفاتورة غير موجودة');
    
    return db.transaction(() => {
      // Delete invoice items first
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
      // Delete the invoice
      db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
      
      // Audit log
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
        VALUES (?, 'النظام', 'حذف_فاتورة', 'invoice', ?, ?)`).run(
        'user-admin-001', id, `حذف فاتورة ${invoice.invoice_number}`
      );
      
      return { success: true };
    })();
  });
}

module.exports = { registerInvoiceHandlers };
