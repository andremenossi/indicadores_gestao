const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const os = require('os');

let mainWindow;
const PORT = 3000;
const DATA_PATH = path.join(app.getPath('userData'), 'gtc_database.json');

// --- SERVIDOR WEB INTERNO ---
const server = express();
server.use(cors());
server.use(express.json());

// Inicializa banco de dados se não existir
if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ 
        records: [], 
        users: [], 
        roleConfigs: [] 
    }));
}

// Endpoints da API para sincronização em rede
server.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    res.json(data);
});

server.post('/api/save', (req, res) => {
    fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

server.get('/api/network-info', (req, res) => {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    res.json({ ip: addresses[0] || '127.0.0.1', port: PORT });
});

// Serve os arquivos do React para outros computadores da rede
server.use(express.static(path.join(__dirname, '../dist')));

// Redireciona qualquer rota não encontrada para o index.html (SPA)
server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});

// --- CONFIGURAÇÃO ELECTRON ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    function createWindow() {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 850,
            minWidth: 1024,
            minHeight: 720,
            title: "GTC - Gestão de Turnover Cirúrgico",
            autoHideMenuBar: true,
            icon: path.join(__dirname, '../public/logo.png'),
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            },
        });

        Menu.setApplicationMenu(null);

        // O app desktop carrega a URL do próprio servidor local
        mainWindow.loadURL(`http://localhost:${PORT}`);

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    }

    app.whenReady().then(createWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}