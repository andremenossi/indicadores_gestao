
const { app, BrowserWindow, session } = require('electron');
const path = require('path');

let mainWindow;

// Implementação de Instância Única (Single Instance)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Se já existe uma instância rodando, fecha esta nova tentativa
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Se alguém tentar abrir uma segunda instância, foca na janela original
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1000,
      minHeight: 700,
      title: "GTC - Gestão de Turnover Cirúrgico",
      // Usar PNG aqui é mais seguro e cross-platform
      icon: path.join(__dirname, '../public/logo.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Se fechar o app sem clicar em "Sair", o estado do React (User) é perdido
    // Adicionalmente, limpamos o storage de sessão para garantir o deslogue completo
    mainWindow.on('close', () => {
      session.defaultSession.clearStorageData({
        storages: ['serviceworkers', 'cachestorage']
      });
    });

    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:3000');
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
