const { ipcMain } = require('electron');
const { getDb, verifyPassword, hashPassword, generateId } = require('../database');

function registerAuthHandlers() {
  // Login
  ipcMain.handle('auth:login', async (event, username, password) => {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
    
    if (!user) {
      throw new Error('اسم المستخدم غير موجود');
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    // Update last login
    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    // Write audit log
    db.prepare(`INSERT INTO audit_log (user_id, user_name, action, description)
      VALUES (?, ?, 'تسجيل_دخول', ?)`).run(user.id, user.full_name, `تسجيل دخول: ${user.full_name}`);

    // Return user without password hash
    const { password_hash, ...safeUser } = user;
    return safeUser;
  });

  // Logout
  ipcMain.handle('auth:logout', async (event, userId) => {
    const db = getDb();
    const user = db.prepare('SELECT full_name FROM users WHERE id = ?').get(userId);
    if (user) {
      db.prepare(`INSERT INTO audit_log (user_id, user_name, action, description)
        VALUES (?, ?, 'تسجيل_خروج', ?)`).run(userId, user.full_name, `تسجيل خروج: ${user.full_name}`);
    }
    return { success: true };
  });

  // Change password
  ipcMain.handle('auth:changePassword', async (event, userId, oldPassword, newPassword) => {
    const db = getDb();
    const user = db.prepare('SELECT password_hash, full_name FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('المستخدم غير موجود');

    const valid = verifyPassword(oldPassword, user.password_hash);
    if (!valid) throw new Error('كلمة المرور الحالية غير صحيحة');

    const newHash = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(newHash, userId);

    db.prepare(`INSERT INTO audit_log (user_id, user_name, action, description)
      VALUES (?, ?, 'تغيير_إعدادات', ?)`).run(userId, user.full_name, 'تم تغيير كلمة المرور');

    return { success: true };
  });

  // Force password change (for must_change_password flow - no old password required)
  ipcMain.handle('auth:forcePasswordChange', async (event, userId, newPassword) => {
    const db = getDb();
    const user = db.prepare('SELECT full_name FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('المستخدم غير موجود');

    const newHash = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(newHash, userId);

    db.prepare(`INSERT INTO audit_log (user_id, user_name, action, description)
      VALUES (?, ?, 'تغيير_إعدادات', ?)`).run(userId, user.full_name, 'تم تغيير كلمة المرور الإجباري');

    return { success: true };
  });
}

module.exports = { registerAuthHandlers };
