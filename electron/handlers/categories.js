const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerCategoryHandlers() {
  ipcMain.handle('categories:getAll', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY pos_order, name').all();
  });

  ipcMain.handle('categories:create', async (event, data) => {
    const db = getDb();
    const id = generateId('cat');
    db.prepare('INSERT INTO categories (id, name, color, icon, parent_id, pos_order) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, data.name, data.color || null, data.icon || null, data.parent_id || null, data.pos_order || 0
    );
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  });

  ipcMain.handle('categories:update', async (event, id, data) => {
    const db = getDb();
    db.prepare('UPDATE categories SET name = ?, color = ?, icon = ?, pos_order = ? WHERE id = ?').run(
      data.name, data.color || null, data.icon || null, data.pos_order || 0, id
    );
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  });

  ipcMain.handle('categories:delete', async (event, id) => {
    const db = getDb();
    // Check if any products use this category
    const count = db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ? AND is_active = 1').get(id);
    if (count.c > 0) throw new Error(`لا يمكن حذف التصنيف - يوجد ${count.c} منتج مرتبط`);
    db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { registerCategoryHandlers };
