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
  openFile: () => ipcRenderer.invoke('open-file')
});
