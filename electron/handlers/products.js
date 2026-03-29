const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerProductHandlers() {
  // Get all products
  ipcMain.handle('products:getAll', async () => {
    const db = getDb();
    return db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = 1
      ORDER BY p.pos_order, p.name
    `).all();
  });

  // Get by ID
  ipcMain.handle('products:getById', async (event, id) => {
    const db = getDb();
    return db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(id);
  });

  // Get by barcode
  ipcMain.handle('products:getByBarcode', async (event, barcode) => {
    const db = getDb();
    return db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.barcode = ? OR p.barcode_alt = ?
    `).get(barcode, barcode);
  });

  // Search products
  ipcMain.handle('products:search', async (event, query) => {
    const db = getDb();
    const search = `%${query}%`;
    return db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE (p.name LIKE ? OR p.barcode LIKE ? OR p.barcode_alt LIKE ?) AND p.is_active = 1
      ORDER BY p.name
      LIMIT 50
    `).all(search, search, search);
  });

  // Create product
  ipcMain.handle('products:create', async (event, data) => {
    const db = getDb();
    
    // Check for duplicate product by name or barcode
    if (data.barcode) {
      const existingByBarcode = db.prepare('SELECT * FROM products WHERE (barcode = ? OR barcode_alt = ?) AND is_active = 1').get(data.barcode, data.barcode);
      if (existingByBarcode) {
        throw new Error(`الباركود "${data.barcode}" مسجل مسبقاً للمنتج "${existingByBarcode.name}"`);
      }
    }
    
    const existingByName = db.prepare('SELECT * FROM products WHERE LOWER(name) = LOWER(?) AND is_active = 1').get(data.name);
    if (existingByName) {
      throw new Error(`المنتج "${data.name}" موجود مسبقاً`);
    }
    
    const id = generateId('prod');
    
    try {
      db.prepare(`INSERT INTO products (
        id, name, barcode, barcode_alt, price, price_wholesale, price_min, cost,
        unit, unit_secondary, unit_conversion, category_id, supplier_id,
        product_type, storage_type, storage_location,
        stock, stock_alert, stock_max, reorder_qty,
        expiry_date, production_date, shelf_life_days, expiry_alert_days,
        is_daily_production, weight_options, pieces_per_bundle,
        tax_override, tax_inclusive_override,
        image_url, description, pos_order, pos_color,
        is_active, is_service, notes
      ) VALUES (
        @id, @name, @barcode, @barcode_alt, @price, @price_wholesale, @price_min, @cost,
        @unit, @unit_secondary, @unit_conversion, @category_id, @supplier_id,
        @product_type, @storage_type, @storage_location,
        @stock, @stock_alert, @stock_max, @reorder_qty,
        @expiry_date, @production_date, @shelf_life_days, @expiry_alert_days,
        @is_daily_production, @weight_options, @pieces_per_bundle,
        @tax_override, @tax_inclusive_override,
        @image_url, @description, @pos_order, @pos_color,
        @is_active, @is_service, @notes
      )`).run({
        id,
        name: data.name,
        barcode: data.barcode || null,
        barcode_alt: data.barcode_alt || null,
        price: data.price || 0,
        price_wholesale: data.price_wholesale || null,
        price_min: data.price_min || null,
        cost: data.cost || 0,
        unit: data.unit || 'قطعة',
        unit_secondary: data.unit_secondary || null,
        unit_conversion: data.unit_conversion || null,
        category_id: data.category_id || null,
        supplier_id: data.supplier_id || null,
        product_type: data.product_type || 'قطعة',
        storage_type: data.storage_type || 'عادي',
        storage_location: data.storage_location || null,
        stock: data.stock || 0,
        stock_alert: data.stock_alert || 5,
        stock_max: data.stock_max || null,
        reorder_qty: data.reorder_qty || null,
        expiry_date: data.expiry_date || null,
        production_date: data.production_date || null,
        shelf_life_days: data.shelf_life_days || null,
        expiry_alert_days: data.expiry_alert_days || 30,
        is_daily_production: data.is_daily_production ? 1 : 0,
        weight_options: data.weight_options ? JSON.stringify(data.weight_options) : null,
        pieces_per_bundle: data.pieces_per_bundle || null,
        tax_override: data.tax_override ?? null,
        tax_inclusive_override: data.tax_inclusive_override ?? null,
        image_url: data.image_url || null,
        description: data.description || null,
        pos_order: data.pos_order || 0,
        pos_color: data.pos_color || null,
        is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
        is_service: data.is_service ? 1 : 0,
        notes: data.notes || null,
      });

      // Record initial stock movement if stock > 0
      if (data.stock > 0) {
        db.prepare(`INSERT INTO stock_movements (id, product_id, product_name, movement_type, 
          qty_before, qty_change, qty_after, unit_cost, ref_type, user_id, notes)
          VALUES (?, ?, ?, 'رصيد_افتتاحي', 0, ?, ?, ?, 'manual', ?, 'رصيد افتتاحي')`).run(
          generateId('mov'), id, data.name, data.stock, data.stock, data.cost || 0, 
          data.user_id || 'user-admin-001'
        );
      }

      return db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(id);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`فشل إضافة المنتج: ${error.message}`);
    }
  });

  // Update product
  ipcMain.handle('products:update', async (event, id, data) => {
    const db = getDb();
    const old = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!old) throw new Error('المنتج غير موجود');

    db.prepare(`UPDATE products SET
      name = @name, barcode = @barcode, barcode_alt = @barcode_alt,
      price = @price, price_wholesale = @price_wholesale, price_min = @price_min, cost = @cost,
      unit = @unit, unit_secondary = @unit_secondary, unit_conversion = @unit_conversion,
      category_id = @category_id, supplier_id = @supplier_id,
      product_type = @product_type, storage_type = @storage_type, storage_location = @storage_location,
      stock_alert = @stock_alert, stock_max = @stock_max, reorder_qty = @reorder_qty,
      expiry_date = @expiry_date, production_date = @production_date,
      shelf_life_days = @shelf_life_days, expiry_alert_days = @expiry_alert_days,
      is_daily_production = @is_daily_production,
      weight_options = @weight_options, pieces_per_bundle = @pieces_per_bundle,
      tax_override = @tax_override, tax_inclusive_override = @tax_inclusive_override,
      image_url = @image_url, description = @description,
      pos_order = @pos_order, pos_color = @pos_color,
      is_active = @is_active, is_service = @is_service, notes = @notes
      WHERE id = @id`).run({
      id,
      name: data.name ?? old.name,
      barcode: data.barcode ?? old.barcode,
      barcode_alt: data.barcode_alt ?? old.barcode_alt,
      price: data.price ?? old.price,
      price_wholesale: data.price_wholesale ?? old.price_wholesale,
      price_min: data.price_min ?? old.price_min,
      cost: data.cost ?? old.cost,
      unit: data.unit ?? old.unit,
      unit_secondary: data.unit_secondary ?? old.unit_secondary,
      unit_conversion: data.unit_conversion ?? old.unit_conversion,
      category_id: data.category_id ?? old.category_id,
      supplier_id: data.supplier_id ?? old.supplier_id,
      product_type: data.product_type ?? old.product_type,
      storage_type: data.storage_type ?? old.storage_type,
      storage_location: data.storage_location ?? old.storage_location,
      stock_alert: data.stock_alert ?? old.stock_alert,
      stock_max: data.stock_max ?? old.stock_max,
      reorder_qty: data.reorder_qty ?? old.reorder_qty,
      expiry_date: data.expiry_date ?? old.expiry_date,
      production_date: data.production_date ?? old.production_date,
      shelf_life_days: data.shelf_life_days ?? old.shelf_life_days,
      expiry_alert_days: data.expiry_alert_days ?? old.expiry_alert_days,
      is_daily_production: data.is_daily_production !== undefined ? (data.is_daily_production ? 1 : 0) : old.is_daily_production,
      weight_options: data.weight_options ? JSON.stringify(data.weight_options) : old.weight_options,
      pieces_per_bundle: data.pieces_per_bundle ?? old.pieces_per_bundle,
      tax_override: data.tax_override ?? old.tax_override,
      tax_inclusive_override: data.tax_inclusive_override ?? old.tax_inclusive_override,
      image_url: data.image_url ?? old.image_url,
      description: data.description ?? old.description,
      pos_order: data.pos_order ?? old.pos_order,
      pos_color: data.pos_color ?? old.pos_color,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : old.is_active,
      is_service: data.is_service !== undefined ? (data.is_service ? 1 : 0) : old.is_service,
      notes: data.notes ?? old.notes,
    });

    // Audit price changes
    if (data.price !== undefined && data.price !== old.price) {
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description, old_value, new_value)
        VALUES (?, 'النظام', 'تعديل_سعر', 'product', ?, ?, ?, ?)`).run(
        data.user_id || 'user-admin-001', id,
        `تعديل سعر ${data.name || old.name}`,
        JSON.stringify({ price: old.price }), JSON.stringify({ price: data.price })
      );
    }

    return db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(id);
  });

  // Delete product (soft delete) with transaction
  ipcMain.handle('products:delete', async (event, id) => {
    const db = getDb();
    try {
      // Check if product has invoice items
      const hasInvoices = db.prepare('SELECT COUNT(*) as count FROM invoice_items WHERE product_id = ?').get(id);
      if (hasInvoices.count > 0) {
        console.log(`Product ${id} has ${hasInvoices.count} invoice items, performing soft delete`);
      }
      
      // Perform soft delete within transaction
      db.transaction(() => {
        const product = db.prepare('SELECT name, barcode FROM products WHERE id = ?').get(id);
        const result = db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
        console.log(`Soft delete product ${id}: changed ${result.changes} rows`);
        
        if (result.changes === 0) {
          throw new Error('المنتج غير موجود أو تم حذفه مسبقاً');
        }
        
        // Audit log
        db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
          VALUES (?, 'النظام', 'حذف_منتج', 'product', ?, ?)`).run(
          userId || 'user-admin-001', id, `حذف منتج: ${product?.name || id} (${product?.barcode || 'N/A'})`
        );
      })();
      
      return { success: true, message: 'تم حذف المنتج بنجاح' };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error(`فشل حذف المنتج: ${error.message}`);
    }
  });

  // Update stock directly
  ipcMain.handle('products:updateStock', async (event, id, newQty, reason, userId) => {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) throw new Error('المنتج غير موجود');

    const oldQty = product.stock;
    const change = newQty - oldQty;

    db.transaction(() => {
      db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newQty, id);

      db.prepare(`INSERT INTO stock_movements (id, product_id, product_name, movement_type,
        qty_before, qty_change, qty_after, unit_cost, ref_type, user_id, notes)
        VALUES (?, ?, ?, 'جرد', ?, ?, ?, ?, 'manual', ?, ?)`).run(
        generateId('mov'), id, product.name, oldQty, change, newQty, product.cost,
        userId || 'user-admin-001', reason || 'تعديل يدوي'
      );

      // Check for low stock notifications
      if (newQty <= product.stock_alert && newQty > 0) {
        db.prepare(`INSERT INTO notifications (id, type, title, message, ref_type, ref_id)
          VALUES (?, 'نقص_مخزون', ?, ?, 'product', ?)`).run(
          generateId('notif'), 'تنبيه مخزون منخفض',
          `المنتج "${product.name}" وصل إلى ${newQty} ${product.unit}`, id
        );
      }
    })();

    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  });

  // Get low stock products
  ipcMain.handle('products:getLowStock', async () => {
    const db = getDb();
    return db.prepare(`SELECT * FROM v_low_stock`).all();
  });

  // Get expiring soon products
  ipcMain.handle('products:getExpiringSoon', async () => {
    const db = getDb();
    return db.prepare(`SELECT * FROM v_expiring_soon`).all();
  });
}

module.exports = { registerProductHandlers };
