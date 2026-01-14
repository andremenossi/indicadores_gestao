import { contextBridge, ipcRenderer } from 'electron';

// Expondo APIs seguras para o frontend se necessário no futuro
contextBridge.exposeInMainWorld('electronAPI', {
  // Você pode adicionar funções aqui para comunicar com o sistema operacional
  // Exemplo: getVersion: () => ipcRenderer.invoke('get-app-version')
});
