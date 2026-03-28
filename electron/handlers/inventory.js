const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerInventoryHandlers() {
  ipcMain.handle('inventory:getStockMovements', async (event, productId, limit = 100) => {
    const db = getDb();
    if (productId) {
      return db.prepare('SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT ?').all(productId, limit);
    }
    return db.prepare('SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT ?').all(limit);
  });

  ipcMain.handle('inventory:getAdjustments', async () => {
    const db = getDb();
    const adjs = db.prepare('SELECT * FROM inventory_adjustments ORDER BY date DESC').all();
    for (const adj of adjs) {
      adj.items = db.prepare('SELECT * FROM adjustment_items WHERE adjustment_id = ?').all(adj.id);
    }
    return adjs;
  });

  ipcMain.handle('inventory:createAdjustment', async (event, data) => {
    const db = getDb();
    const adjId = generateId('adj');

    const last = db.prepare("SELECT adj_number FROM inventory_adjustments ORDER BY date DESC LIMIT 1").get();
    let adjNumber = 'ADJ-001';
    if (last) {
      const num = parseInt(last.adj_number.replace('ADJ-', '')) + 1;
      adjNumber = `ADJ-${String(num).padStart(3, '0')}`;
    }

    return db.transaction(() => {
      db.prepare(`INSERT INTO inventory_adjustments (id, adj_number, adj_type, status, user_id, notes)
        VALUES (?, ?, ?, 'مكتمل', ?, ?)`).run(
        adjId, adjNumber, data.adj_type || 'تعديل_يدوي', data.user_id, data.notes || null
      );

      for (const item of (data.items || [])) {
        db.prepare(`INSERT INTO adjustment_items (id, adjustment_id, product_id, product_name,
          qty_system, qty_actual, unit_cost, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
          generateId('ai'), adjId, item.product_id, item.product_name,
          item.qty_system, item.qty_actual, item.unit_cost || 0, item.reason || null
        );

        // Update product stock
        const diff = item.qty_actual - item.qty_system;
        if (diff !== 0) {
          db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(item.qty_actual, item.product_id);
          db.prepare(`INSERT INTO stock_movements (id, product_id, product_name, movement_type,
            qty_before, qty_change, qty_after, unit_cost, ref_type, ref_id, user_id, notes)
            VALUES (?, ?, ?, 'جرد', ?, ?, ?, ?, 'adjustment', ?, ?, ?)`).run(
            generateId('mov'), item.product_id, item.product_name,
            item.qty_system, diff, item.qty_actual, item.unit_cost || 0,
            adjId, data.user_id, item.reason || 'جرد'
          );
        }
      }

      // Audit log
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
        VALUES (?, 'النظام', 'تعديل_مخزون', 'adjustment', ?, ?)`).run(
        data.user_id, adjId, `جرد ${adjNumber} - ${data.items?.length || 0} منتج`
      );

      const adj = db.prepare('SELECT * FROM inventory_adjustments WHERE id = ?').get(adjId);
      adj.items = db.prepare('SELECT * FROM adjustment_items WHERE adjustment_id = ?').all(adjId);
      return adj;
    })();
  });
}

module.exports = { registerInventoryHandlers };
