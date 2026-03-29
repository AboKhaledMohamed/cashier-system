const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { initDatabase, getDb } = require('./database');
const { registerAllHandlers } = require('./handlers/index');

// Keep a global reference of the window object
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'الكاشير الذكي — Smart Cashier',
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Load the app
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    // Initialize database
    const dbPath = path.join(process.env.LOCALAPPDATA || app.getPath('userData'), 'smartpos', 'smartpos.db');
    console.log('Database path:', dbPath);
    initDatabase(dbPath);

    // Register all IPC handlers
    registerAllHandlers();

    // Set up auto-backup
    setupAutoBackup();

    // Create window
    createWindow();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    dialog.showErrorBox('خطأ في التشغيل', `فشل تشغيل التطبيق: ${error.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  const db = getDb();
  if (db) db.close();
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Auto-backup system
function setupAutoBackup() {
  const db = getDb();
  if (!db) return;

  // Run backup check every hour
  setInterval(() => {
    try {
      const settings = db.prepare('SELECT backup_auto, backup_path, backup_keep_days FROM shop_settings WHERE id = 1').get();
      if (!settings || !settings.backup_auto) return;

      const backupDir = settings.backup_path || path.join(app.getPath('userData'), 'backups');
      const fs = require('fs');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Check last backup
      const lastBackup = db.prepare("SELECT MAX(started_at) as last FROM backup_log WHERE status = 'نجح'").get();
      const lastBackupDate = lastBackup?.last ? new Date(lastBackup.last) : null;
      const now = new Date();

      // Backup daily
      if (!lastBackupDate || (now - lastBackupDate) > 24 * 60 * 60 * 1000) {
        performBackup(backupDir, db);
      }

      // Clean old backups
      if (settings.backup_keep_days > 0) {
        cleanOldBackups(backupDir, settings.backup_keep_days);
      }
    } catch (error) {
      console.error('Auto-backup check failed:', error);
    }
  }, 60 * 60 * 1000); // Every hour

  // Also run once on startup (after 30 seconds)
  setTimeout(() => {
    try {
      const settings = db.prepare('SELECT backup_auto, backup_path, backup_keep_days FROM shop_settings WHERE id = 1').get();
      if (settings?.backup_auto) {
        const backupDir = settings.backup_path || path.join(app.getPath('userData'), 'backups');
        const fs = require('fs');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        performBackup(backupDir, db);
      }
    } catch (e) { console.error('Startup backup failed:', e); }
  }, 30000);
}

function performBackup(backupDir, db) {
  const fs = require('fs');
  const backupId = `backup-${Date.now()}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `smartpos-backup-${timestamp}.db`;
  const filePath = path.join(backupDir, fileName);
  const startedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

  try {
    // Use SQLite backup API
    db.backup(filePath).then(() => {
      const stats = fs.statSync(filePath);
      const sizeKb = Math.round(stats.size / 1024);
      db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, started_at, completed_at)
        VALUES (?, 'تلقائي', ?, ?, ?, 'نجح', ?, datetime('now'))`).run(backupId, filePath, fileName, sizeKb, startedAt);
      console.log('Auto-backup completed:', filePath);
    }).catch(err => {
      db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, error_message, started_at)
        VALUES (?, 'تلقائي', ?, ?, 0, 'فشل', ?, ?)`).run(backupId, filePath, fileName, err.message, startedAt);
      console.error('Backup failed:', err);
    });
  } catch (error) {
    // Fallback: copy file directly
    try {
      const dbPath = path.join(app.getPath('userData'), 'smartpos.db');
      fs.copyFileSync(dbPath, filePath);
      const stats = fs.statSync(filePath);
      const sizeKb = Math.round(stats.size / 1024);
      db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, started_at, completed_at)
        VALUES (?, 'تلقائي', ?, ?, ?, 'نجح', ?, datetime('now'))`).run(backupId, filePath, fileName, sizeKb, startedAt);
      console.log('Auto-backup (copy) completed:', filePath);
    } catch (copyErr) {
      db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, error_message, started_at)
        VALUES (?, 'تلقائي', ?, ?, 0, 'فشل', ?, ?)`).run(backupId, filePath, fileName, copyErr.message, startedAt);
    }
  }
}

function cleanOldBackups(backupDir, keepDays) {
  const fs = require('fs');
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  try {
    const files = fs.readdirSync(backupDir);
    for (const file of files) {
      if (file.startsWith('smartpos-backup-') && file.endsWith('.db')) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          console.log('Cleaned old backup:', file);
        }
      }
    }
  } catch (e) { console.error('Clean old backups error:', e); }
}
