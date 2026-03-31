const { ipcMain } = require('electron');
const { getDb } = require('../database');

function registerAuditHandlers() {
  ipcMain.handle('audit:getAll', async (event, filters = {}) => {
    const db = getDb();
    let sql = 'SELECT * FROM audit_log WHERE 1=1';
    const params = [];
    if (filters.userId) { sql += ' AND user_id = ?'; params.push(filters.userId); }
    if (filters.action) { sql += ' AND action = ?'; params.push(filters.action); }
    if (filters.dateFrom) { sql += ' AND created_at >= ?'; params.push(filters.dateFrom); }
    if (filters.dateTo) { sql += " AND created_at <= ? || ' 23:59:59'"; params.push(filters.dateTo); }
    sql += ' ORDER BY created_at DESC LIMIT 500';
    return db.prepare(sql).all(...params);
  });
}

function registerNotificationHandlers() {
  ipcMain.handle('notifications:getAll', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100').all();
  });

  ipcMain.handle('notifications:getUnread', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC').all();
  });

  ipcMain.handle('notifications:markRead', async (event, id) => {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('notifications:markAllRead', async () => {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
    return { success: true };
  });

  ipcMain.handle('notifications:delete', async (event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('folder:open', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'اختيار مكان حفظ النسخ الاحتياطية',
      buttonLabel: 'اختيار',
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });
}

function registerBackupHandlers() {
  ipcMain.handle('backup:create', async () => {
    const db = getDb();
    const { app } = require('electron');
    const path = require('path');
    const fs = require('fs');
    const { generateId } = require('../database');

    const settings = db.prepare('SELECT backup_path FROM shop_settings WHERE id = 1').get();
    const backupDir = settings?.backup_path || path.join(app.getPath('userData'), 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const backupId = generateId('backup');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `smartpos-backup-${timestamp}.db`;
    const filePath = path.join(backupDir, fileName);
    const startedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

    try {
      const dbPath = path.join(process.env.LOCALAPPDATA, 'smartpos', 'smartpos.db');
      fs.copyFileSync(dbPath, filePath);
      const stats = fs.statSync(filePath);
      const sizeKb = Math.round(stats.size / 1024);
      db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, started_at, completed_at)
        VALUES (?, 'يدوي', ?, ?, ?, 'نجح', ?, datetime('now'))`).run(backupId, filePath, fileName, sizeKb, startedAt);
      return { success: true, filePath, fileName, sizeKb };
    } catch (error) {
      db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, error_message, started_at)
        VALUES (?, 'يدوي', ?, ?, 0, 'فشل', ?, ?)`).run(backupId, filePath, fileName, error.message, startedAt);
      throw new Error(`فشل النسخ الاحتياطي: ${error.message}`);
    }
  });

  ipcMain.handle('backup:getLog', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM backup_log ORDER BY started_at DESC LIMIT 50').all();
  });

  ipcMain.handle('backup:restore', async (event, filePath) => {
    // This is intentionally a no-op for safety
    // Real restore should replace the DB file and restart the app
    throw new Error('استعادة النسخة الاحتياطية تتطلب إعادة تشغيل التطبيق. يرجى استبدال ملف قاعدة البيانات يدوياً.');
  });

  ipcMain.handle('backup:selectFolder', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'اختيار مكان حفظ النسخ الاحتياطية',
      buttonLabel: 'اختيار',
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });
}

module.exports = { registerAuditHandlers, registerNotificationHandlers, registerBackupHandlers };
