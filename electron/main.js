const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const zipUtils = require('./zipUtils');
const isDev = process.env.ELECTRON_DEV === 'true';

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../out/icon.png'), // Icon from built output
    title: 'Prayer Slides Generator',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'About Prayer Slides',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Prayer Slides',
              message: 'Prayer Slides Generator',
              detail: 'Generate prayer slides for The Potter\'s House automatically from a JSON database.\n\nVersion: 0.1.0'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Initialize data zip file
function initializeDataZip() {
  const { dataZipPath } = getDataPaths();

  // If data zip doesn't exist, copy the initial one
  if (!fs.existsSync(dataZipPath)) {
    const initialZipPath = path.join(__dirname, '../prayer-slides-data.zip');

    if (fs.existsSync(initialZipPath)) {
      try {
        // Ensure user data directory exists
        const userDataPath = app.getPath('userData');
        if (!fs.existsSync(userDataPath)) {
          fs.mkdirSync(userDataPath, { recursive: true });
        }

        // Copy initial zip to user data directory
        fs.copyFileSync(initialZipPath, dataZipPath);
        console.log('Initialized data zip from initial file');
      } catch (error) {
        console.error('Error initializing data zip:', error);
      }
    }
  }
}

// Get paths for data storage
function getDataPaths() {
  const userDataPath = app.getPath('userData');
  const dataZipPath = path.join(userDataPath, 'prayer-slides-data.zip');
  const backupDir = path.join(userDataPath, 'backups');
  const tempDir = path.join(userDataPath, 'temp');

  return { dataZipPath, backupDir, tempDir, userDataPath };
}

// IPC handlers
function setupIpcHandlers() {

  // Handler to load couples data from JSON file (now from zip)
  ipcMain.handle('load-couples-data', async () => {
    try {
      const { dataZipPath } = getDataPaths();

      // Check if zip file exists
      if (fs.existsSync(dataZipPath)) {
        // Load from zip file
        const couplesData = await zipUtils.readFileFromZip(dataZipPath, 'files/couples.json');
        if (couplesData) {
          return JSON.parse(couplesData);
        }
      }

      // Fallback: load from original location if zip doesn't exist yet
      let couplesFilePath;
      if (isDev) {
        couplesFilePath = path.join(__dirname, '../public/files/couples.json');
      } else {
        couplesFilePath = path.join(__dirname, '../out/files/couples.json');
      }

      if (fs.existsSync(couplesFilePath)) {
        const data = fs.readFileSync(couplesFilePath, 'utf8');
        return JSON.parse(data);
      }

      return [];
    } catch (error) {
      console.error('Error loading couples data:', error);
      return [];
    }
  });

  // Handler to import data from zip file
  ipcMain.handle('import-data-zip', async (event, filePath) => {
    try {
      const { dataZipPath, backupDir } = getDataPaths();

      // Validate the zip file
      const validation = await zipUtils.validatePrayerSlidesZip(filePath);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid zip file. Missing files: ${validation.missing.join(', ')}`
        };
      }

      // Create backup of current data if it exists
      if (fs.existsSync(dataZipPath)) {
        await zipUtils.createBackup(dataZipPath, backupDir);
        await zipUtils.cleanupOldBackups(backupDir, 3);
      }

      // Copy new zip file to data location
      fs.copyFileSync(filePath, dataZipPath);

      console.log('Successfully imported new data zip');
      return { success: true };
    } catch (error) {
      console.error('Error importing data zip:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler to export current data as zip file
  ipcMain.handle('export-data-zip', async () => {
    try {
      const { dataZipPath } = getDataPaths();

      if (!fs.existsSync(dataZipPath)) {
        return { success: false, error: 'No data to export' };
      }

      // Show save dialog
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Prayer Slides Data',
        defaultPath: `prayer-slides-export-${new Date().toISOString().split('T')[0]}.zip`,
        filters: [
          { name: 'Zip Files', extensions: ['zip'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        // Copy current data zip to selected location
        fs.copyFileSync(dataZipPath, result.filePath);
        return { success: true, filePath: result.filePath };
      }

      return { success: false, error: 'Export cancelled' };
    } catch (error) {
      console.error('Error exporting data zip:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler to get available backups
  ipcMain.handle('get-available-backups', async () => {
    try {
      const { backupDir } = getDataPaths();
      const backups = await zipUtils.getAvailableBackups(backupDir);
      return { success: true, backups };
    } catch (error) {
      console.error('Error getting available backups:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler to restore from backup
  ipcMain.handle('restore-from-backup', async (event, backupPath) => {
    try {
      const { dataZipPath, backupDir } = getDataPaths();

      if (!fs.existsSync(backupPath)) {
        return { success: false, error: 'Backup file not found' };
      }

      // Create backup of current data before restoring
      if (fs.existsSync(dataZipPath)) {
        await zipUtils.createBackup(dataZipPath, backupDir);
      }

      // Copy backup to current data location
      fs.copyFileSync(backupPath, dataZipPath);

      console.log('Successfully restored from backup');
      return { success: true };
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler to show open dialog
  ipcMain.handle('show-open-dialog', async (event, options) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, options);
      return result;
    } catch (error) {
      console.error('Error showing open dialog:', error);
      return { canceled: true };
    }
  });

  // Handler to show save dialog
  ipcMain.handle('show-save-dialog', async (event, options) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, options);
      return result;
    } catch (error) {
      console.error('Error showing save dialog:', error);
      return { canceled: true };
    }
  });
}

// App event handlers
app.whenReady().then(() => {
  initializeDataZip();
  createWindow();
  createMenu();
  setupIpcHandlers();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
