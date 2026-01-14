const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funções de comunicação aqui
});