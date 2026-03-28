const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerPurchaseHandlers() {
  ipcMain.handle('purchases:getNextNumber', async () => {
    const db = getDb();
    const last = db.prepare("SELECT purchase_number FROM purchases ORDER BY created_at DESC LIMIT 1").get();
    if (!last) return 'P-001';
    const num = parseInt(last.purchase_number.replace('P-', '')) + 1;
    return `P-${String(num).padStart(3, '0')}`;
  });

  ipcMain.handle('purchases:getAll', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM purchases ORDER BY created_at DESC LIMIT 500').all();
  });

  ipcMain.handle('purchases:getById', async (event, id) => {
    const db = getDb();
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(id);
    if (!purchase) return null;
    purchase.items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(id);
    return purchase;
  });

  ipcMain.handle('purchases:create', async (event, data) => {
    const db = getDb();
    const purchaseId = generateId('pur');

    const last = db.prepare("SELECT purchase_number FROM purchases ORDER BY created_at DESC LIMIT 1").get();
    let purchaseNumber = 'P-001';
    if (last) {
      const num = parseInt(last.purchase_number.replace('P-', '')) + 1;
      purchaseNumber = `P-${String(num).padStart(3, '0')}`;
    }

    const now = new Date();
    const dateStr = data.date || now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 8);

    // Get supplier name from database if not provided
    let supplierName = data.supplier_name;
    if (!supplierName && data.supplier_id) {
      const supplier = db.prepare('SELECT name FROM suppliers WHERE id = ?').get(data.supplier_id);
      supplierName = supplier?.name || 'مورد غير معروف';
    }

    // Get user_id - if not provided, use a default admin user
    let userId = data.user_id;
    if (!userId || userId === '' || userId === 'null' || userId === 'undefined') {
      const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
      userId = admin?.id || 'user-admin-001';
    }

    // Calculate values with defaults
    const total = data.total || 0;
    const paid = data.paid || 0;
    const remaining = total - paid;

    return db.transaction(() => {
      let paymentStatus = 'غير_مدفوع';
      if (paid >= total) paymentStatus = 'مدفوع';
      else if (paid > 0) paymentStatus = 'جزئي';

      db.prepare(`INSERT INTO purchases (
        id, purchase_number, purchase_type, supplier_id, supplier_name,
        date, time, subtotal, tax_amount, discount_amount, shipping_cost,
        total, paid, remaining, payment_method, payment_status,
        supplier_invoice_ref, user_id, status, notes
      ) VALUES (
        @id, @purchase_number, @purchase_type, @supplier_id, @supplier_name,
        @date, @time, @subtotal, @tax_amount, @discount_amount, @shipping_cost,
        @total, @paid, @remaining, @payment_method, @payment_status,
        @supplier_invoice_ref, @user_id, @status, @notes
      )`).run({
        id: purchaseId,
        purchase_number: purchaseNumber,
        purchase_type: data.purchase_type || 'فاتورة_شراء',
        supplier_id: data.supplier_id,
        supplier_name: supplierName,
        date: dateStr,
        time: timeStr,
        subtotal: data.subtotal || 0,
        tax_amount: data.tax_amount || 0,
        discount_amount: data.discount_amount || 0,
        shipping_cost: data.shipping_cost || 0,
        total: total,
        paid: paid,
        remaining: remaining,
        payment_method: data.payment_method || null,
        payment_status: paymentStatus,
        supplier_invoice_ref: data.supplier_invoice_ref || null,
        user_id: userId,
        status: data.status || 'مستلم',
        notes: data.notes || null,
      });

      // Insert items and update stock
      const insertItem = db.prepare(`INSERT INTO purchase_items (
        id, purchase_id, product_id, product_name, qty, unit,
        unit_price, tax_amount, discount_amount, total, expiry_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      for (const item of (data.items || [])) {
        const qty = item.qty ?? 1;
        const unitPrice = item.unit_price ?? 0;
        const total = item.total ?? (qty * unitPrice);
        
        insertItem.run(
          generateId('pi'), purchaseId, item.product_id, item.product_name,
          qty, item.unit || 'قطعة', unitPrice, item.tax_amount || 0,
          item.discount_amount || 0, total, item.expiry_date || null, item.notes || null
        );

        // Update product stock
        if (data.status !== 'مسودة') {
          const product = db.prepare('SELECT stock, is_service FROM products WHERE id = ?').get(item.product_id);
          if (product && !product.is_service) {
            const oldStock = product.stock;
            const newStock = oldStock + qty;
            db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(qty, item.product_id);

            db.prepare(`INSERT INTO stock_movements (id, product_id, product_name, movement_type,
              qty_before, qty_change, qty_after, unit_cost, ref_type, ref_id, user_id, notes)
              VALUES (?, ?, ?, 'شراء', ?, ?, ?, ?, 'purchase', ?, ?, ?)`).run(
              generateId('mov'), item.product_id, item.product_name,
              oldStock, qty, newStock, unitPrice,
              purchaseId, userId, `فاتورة شراء ${purchaseNumber}`
            );
          }

          // Update product cost price if changed
          if (unitPrice > 0) {
            db.prepare('UPDATE products SET cost = ? WHERE id = ?').run(unitPrice, item.product_id);
          }

          // Update expiry date if provided
          if (item.expiry_date) {
            db.prepare('UPDATE products SET expiry_date = ? WHERE id = ?').run(item.expiry_date, item.product_id);
          }
        }
      }

      // Update supplier balance (only if supplier_id is provided)
      if (data.supplier_id && data.status !== 'مسودة') {
        const total = data.total || 0;
        const remaining = (data.total || 0) - (data.paid || 0);
        
        if (remaining > 0) {
          db.prepare(`UPDATE suppliers SET 
            current_balance = COALESCE(current_balance, 0) + ?,
            total_purchases = COALESCE(total_purchases, 0) + ?,
            last_purchase_date = ?
            WHERE id = ?`).run(remaining, total, dateStr, data.supplier_id);
        } else {
          db.prepare(`UPDATE suppliers SET 
            total_purchases = COALESCE(total_purchases, 0) + ?,
            last_purchase_date = ?
            WHERE id = ?`).run(total, dateStr, data.supplier_id);
        }
      }

      // Audit log
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
        VALUES (?, 'النظام', 'شراء_جديد', 'purchase', ?, ?)`).run(
        userId, purchaseId, `فاتورة شراء ${purchaseNumber} من ${supplierName} - المبلغ: ${data.total} جنيه`
      );

      const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(purchaseId);
      purchase.items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(purchaseId);
      return purchase;
    })();
  });

  ipcMain.handle('purchases:update', async (event, id, data) => {
    const db = getDb();
    db.prepare(`UPDATE purchases SET notes = ?, paid = ?, remaining = total - ?,
      payment_status = CASE WHEN ? >= total THEN 'مدفوع' WHEN ? > 0 THEN 'جزئي' ELSE 'غير_مدفوع' END
      WHERE id = ?`).run(
      data.notes || null, data.paid || 0, data.paid || 0, data.paid || 0, data.paid || 0, id
    );
    return db.prepare('SELECT * FROM purchases WHERE id = ?').get(id);
  });

  ipcMain.handle('purchases:delete', async (event, id) => {
    const db = getDb();
    db.prepare("UPDATE purchases SET status = 'ملغي' WHERE id = ?").run(id);
    return { success: true };
  });
}

module.exports = { registerPurchaseHandlers };
