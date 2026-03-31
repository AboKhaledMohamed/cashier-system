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
      checkAndRunBackup(db);
    } catch (error) {
      console.error('Auto-backup check failed:', error);
    }
  }, 60 * 60 * 1000); // Every hour

  // Also run once on startup (after 30 seconds)
  setTimeout(() => {
    try {
      checkAndRunBackup(db);
    } catch (e) { console.error('Startup backup failed:', e); }
  }, 30000);
}

function checkAndRunBackup(db) {
  const settings = db.prepare('SELECT backup_schedule, backup_time, backup_path, backup_keep_days FROM shop_settings WHERE id = 1').get();
  if (!settings || settings.backup_schedule === 'manual') return;

  const backupDir = settings.backup_path || path.join(app.getPath('userData'), 'backups');
  const fs = require('fs');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Check if it's time to run backup (based on backup_time setting)
  const now = new Date();
  const [targetHour, targetMinute] = (settings.backup_time || '02:00').split(':').map(Number);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Only run if within the target hour (to avoid multiple runs in same period)
  const isTargetTime = currentHour === targetHour && currentMinute < 60;
  if (!isTargetTime) return;

  // Check last backup
  const lastBackup = db.prepare("SELECT MAX(started_at) as last FROM backup_log WHERE status = 'نجح' AND backup_type = 'تلقائي'").get();
  const lastBackupDate = lastBackup?.last ? new Date(lastBackup.last) : null;

  let shouldBackup = false;
  
  if (!lastBackupDate) {
    shouldBackup = true;
  } else {
    const daysSinceLastBackup = (now - lastBackupDate) / (24 * 60 * 60 * 1000);
    
    switch (settings.backup_schedule) {
      case 'daily':
        shouldBackup = daysSinceLastBackup >= 1;
        break;
      case 'weekly':
        shouldBackup = daysSinceLastBackup >= 7;
        break;
      case 'monthly':
        shouldBackup = daysSinceLastBackup >= 30;
        break;
    }
  }

  if (shouldBackup) {
    console.log(`Running ${settings.backup_schedule} backup at ${settings.backup_time}`);
    performBackup(backupDir, db);
  }

  // Clean old backups
  if (settings.backup_keep_days > 0) {
    cleanOldBackups(backupDir, settings.backup_keep_days);
  }
}

function performBackup(backupDir, db) {
  const fs = require('fs');
  const path = require('path');
  const backupId = `backup-${Date.now()}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `smartpos-backup-${timestamp}.db`;
  const filePath = path.join(backupDir, fileName);
  const startedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

  try {
    const dbPath = path.join(process.env.LOCALAPPDATA || app.getPath('userData'), 'smartpos', 'smartpos.db');
    fs.copyFileSync(dbPath, filePath);
    const stats = fs.statSync(filePath);
    const sizeKb = Math.round(stats.size / 1024);
    db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, started_at, completed_at)
      VALUES (?, 'تلقائي', ?, ?, ?, 'نجح', ?, datetime('now'))`).run(backupId, filePath, fileName, sizeKb, startedAt);
    console.log('Auto-backup completed:', filePath);
  } catch (error) {
    db.prepare(`INSERT INTO backup_log (id, backup_type, file_path, file_name, file_size_kb, status, error_message, started_at)
      VALUES (?, 'تلقائي', ?, ?, 0, 'فشل', ?, ?)`).run(backupId, filePath, fileName, error.message, startedAt);
    console.error('Backup failed:', error);
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
