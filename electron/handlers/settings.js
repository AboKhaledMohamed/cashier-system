const { ipcMain } = require('electron');
const { getDb } = require('../database');

function registerSettingsHandlers() {
  ipcMain.handle('settings:get', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM shop_settings WHERE id = 1').get();
  });

  ipcMain.handle('settings:update', async (event, data) => {
    const db = getDb();
    const fields = [];
    const values = [];

    const allowed = [
      'shop_name', 'shop_name_en', 'owner_name', 'phone', 'phone_alt',
      'address', 'city', 'logo_url', 'currency', 'currency_symbol',
      'receipt_header', 'receipt_footer', 'receipt_show_logo', 'receipt_printer_width',
      'low_stock_alert', 'expiry_alert_days',
      'tax_enabled', 'tax_name', 'tax_rate', 'tax_inclusive',
      'loyalty_enabled', 'points_per_pound', 'pound_per_point', 'min_redeem_points',
      'backup_auto', 'backup_path', 'backup_keep_days'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      db.prepare(`UPDATE shop_settings SET ${fields.join(', ')} WHERE id = 1`).run(...values);
    }

    // Audit log
    if (data.user_id) {
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, description)
        VALUES (?, 'النظام', 'تغيير_إعدادات', 'settings', '1', 'تم تحديث إعدادات المحل')`).run(data.user_id);
    }

    return db.prepare('SELECT * FROM shop_settings WHERE id = 1').get();
  });
}

module.exports = { registerSettingsHandlers };
