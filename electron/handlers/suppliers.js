const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

function registerSupplierHandlers() {
  ipcMain.handle('suppliers:getAll', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('suppliers:getById', async (event, id) => {
    const db = getDb();
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  });

  ipcMain.handle('suppliers:create', async (event, data) => {
    const db = getDb();
    const id = generateId('sup');
    db.prepare(`INSERT INTO suppliers (id, name, phone, phone_alt, email, address, contact_person, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, data.name, data.phone, data.phone_alt || null, data.email || null,
      data.address || null, data.contact_person || null, data.notes || null
    );
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  });

  ipcMain.handle('suppliers:update', async (event, id, data) => {
    const db = getDb();
    const old = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!old) throw new Error('المورد غير موجود');

    db.prepare(`UPDATE suppliers SET name = ?, phone = ?, phone_alt = ?, email = ?,
      address = ?, contact_person = ?, notes = ? WHERE id = ?`).run(
      data.name ?? old.name, data.phone ?? old.phone, data.phone_alt ?? old.phone_alt,
      data.email ?? old.email, data.address ?? old.address,
      data.contact_person ?? old.contact_person, data.notes ?? old.notes, id
    );
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  });

  ipcMain.handle('suppliers:delete', async (event, id) => {
    const db = getDb();
    db.prepare('UPDATE suppliers SET is_active = 0 WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { registerSupplierHandlers };
