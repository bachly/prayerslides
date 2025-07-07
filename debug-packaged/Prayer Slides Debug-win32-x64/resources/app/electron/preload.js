const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Add any specific APIs you need here
  platform: process.platform,
  versions: process.versions,

  // Example method for future use
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // File operations (if needed in the future)
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  openFile: () => ipcRenderer.invoke('open-file'),

  // Load couples data directly from JSON file
  loadCouplesData: () => ipcRenderer.invoke('load-couples-data'),

  // Zip file operations
  importDataZip: (filePath) => ipcRenderer.invoke('import-data-zip', filePath),
  exportDataZip: () => ipcRenderer.invoke('export-data-zip'),

  // Version management
  getAvailableBackups: () => ipcRenderer.invoke('get-available-backups'),
  restoreFromBackup: (backupPath) => ipcRenderer.invoke('restore-from-backup', backupPath),

  // File dialog operations
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options)
});
