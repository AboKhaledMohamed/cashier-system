const { ipcMain } = require('electron');
const { getDb, generateId } = require('../database');

// Map English trust levels to Arabic
const trustLevelMap = {
  'excellent': 'ممتاز',
  'good': 'جيد',
  'average': 'متوسط',
  'poor': 'ضعيف',
  'bad': 'ضعيف',
  // Arabic values pass through
  'ممتاز': 'ممتاز',
  'جيد': 'جيد',
  'متوسط': 'متوسط',
  'ضعيف': 'ضعيف'
};

function getArabicTrustLevel(level) {
  return trustLevelMap[level] || 'جيد';
}

function registerCustomerHandlers() {
  ipcMain.handle('customers:getAll', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM customers WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('customers:getById', async (event, id) => {
    const db = getDb();
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  });

  ipcMain.handle('customers:search', async (event, query) => {
    const db = getDb();
    const s = `%${query}%`;
    return db.prepare('SELECT * FROM customers WHERE (name LIKE ? OR phone LIKE ?) AND is_active = 1 ORDER BY name LIMIT 30').all(s, s);
  });

  ipcMain.handle('customers:create', async (event, data) => {
    const db = getDb();
    
    // Check for duplicate customer by name or phone
    const existingByName = db.prepare('SELECT * FROM customers WHERE LOWER(name) = LOWER(?) AND is_active = 1').get(data.name);
    if (existingByName) {
      throw new Error(`العميل "${data.name}" موجود مسبقاً`);
    }
    
    const existingByPhone = db.prepare('SELECT * FROM customers WHERE phone = ? AND is_active = 1').get(data.phone);
    if (existingByPhone) {
      throw new Error(`رقم التليفون "${data.phone}" مسجل مسبقاً للعميل "${existingByPhone.name}"`);
    }
    
    const id = generateId('cust');
    db.prepare(`INSERT INTO customers (id, name, phone, phone_alt, address, national_id,
      credit_limit, neighborhood, building, floor, landmark,
      trust_score, trust_level, allowed_discount_pct,
      debt_reminder_enabled, reminder_frequency, birthdate, notes)
      VALUES (@id, @name, @phone, @phone_alt, @address, @national_id,
      @credit_limit, @neighborhood, @building, @floor, @landmark,
      @trust_score, @trust_level, @allowed_discount_pct,
      @debt_reminder_enabled, @reminder_frequency, @birthdate, @notes)`).run({
      id,
      name: data.name,
      phone: data.phone,
      phone_alt: data.phone_alt || null,
      address: data.address || null,
      national_id: data.national_id || null,
      credit_limit: data.credit_limit || 0,
      neighborhood: data.neighborhood || null,
      building: data.building || null,
      floor: data.floor || null,
      landmark: data.landmark || null,
      trust_score: data.trust_score || 100,
      trust_level: getArabicTrustLevel(data.trust_level) || 'جيد',
      allowed_discount_pct: data.allowed_discount_pct || 0,
      debt_reminder_enabled: data.debt_reminder_enabled ? 1 : 0,
      reminder_frequency: data.reminder_frequency || 'اسبوعي',
      birthdate: data.birthdate || null,
      notes: data.notes || null,
    });
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  });

  ipcMain.handle('customers:update', async (event, id, data) => {
    const db = getDb();
    const old = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!old) throw new Error('العميل غير موجود');

    db.prepare(`UPDATE customers SET
      name = @name, phone = @phone, phone_alt = @phone_alt, address = @address,
      national_id = @national_id, credit_limit = @credit_limit,
      neighborhood = @neighborhood, building = @building, floor = @floor, landmark = @landmark,
      trust_score = @trust_score, trust_level = @trust_level,
      allowed_discount_pct = @allowed_discount_pct,
      debt_reminder_enabled = @debt_reminder_enabled, reminder_frequency = @reminder_frequency,
      is_blacklisted = @is_blacklisted, birthdate = @birthdate, notes = @notes
      WHERE id = @id`).run({
      id,
      name: data.name ?? old.name,
      phone: data.phone ?? old.phone,
      phone_alt: data.phone_alt ?? old.phone_alt,
      address: data.address ?? old.address,
      national_id: data.national_id ?? old.national_id,
      credit_limit: data.credit_limit ?? old.credit_limit,
      neighborhood: data.neighborhood ?? old.neighborhood,
      building: data.building ?? old.building,
      floor: data.floor ?? old.floor,
      landmark: data.landmark ?? old.landmark,
      trust_score: data.trust_score ?? old.trust_score,
      trust_level: data.trust_level ? getArabicTrustLevel(data.trust_level) : old.trust_level,
      allowed_discount_pct: data.allowed_discount_pct ?? old.allowed_discount_pct,
      debt_reminder_enabled: data.debt_reminder_enabled !== undefined ? (data.debt_reminder_enabled ? 1 : 0) : old.debt_reminder_enabled,
      reminder_frequency: data.reminder_frequency ?? old.reminder_frequency,
      is_blacklisted: data.is_blacklisted !== undefined ? (data.is_blacklisted ? 1 : 0) : old.is_blacklisted,
      birthdate: data.birthdate ?? old.birthdate,
      notes: data.notes ?? old.notes,
    });
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  });

  ipcMain.handle('customers:delete', async (event, id) => {
    const db = getDb();
    db.prepare('UPDATE customers SET is_active = 0 WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('customers:getDebtors', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM customers WHERE current_balance > 0 AND is_active = 1 ORDER BY current_balance DESC').all();
  });

  ipcMain.handle('customers:getDebtHistory', async (event, id) => {
    const db = getDb();
    const invoices = db.prepare(`SELECT id, invoice_number, date, total, paid, credit_amount, status
      FROM invoices WHERE customer_id = ? AND payment_method = 'آجل' ORDER BY date DESC`).all(id);
    const payments = db.prepare(`SELECT id, amount, method, date, notes
      FROM payments WHERE party_type = 'customer' AND party_id = ? ORDER BY date DESC`).all(id);
    return { invoices, payments };
  });
}

module.exports = { registerCustomerHandlers };
