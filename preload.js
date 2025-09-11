const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openOnRight: (url) => ipcRenderer.send('open-on-right', url),
  notifyFinalized: () => ipcRenderer.send('finalized-button-clicked')
});