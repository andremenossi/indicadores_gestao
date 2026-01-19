const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const os = require('os');
const http = require('http');

let mainWindow;
const PORT = 3000;

// Definimos o caminho dos dados para a pasta onde o executável está (tornando-o portátil/compartilhável)
const APP_DIR = path.dirname(app.getPath('exe'));
const DATA_PATH = path.join(APP_DIR, 'gtc_database.json');
const CONFIG_PATH = path.join(APP_DIR, 'server_address.json');

// --- FUNÇÕES DE APOIO ---
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return '127.0.0.1';
}

// Verifica se uma URL está ativa
function checkServerActive(url) {
    return new Promise((resolve) => {
        const request = http.get(url + '/api/data', (res) => {
            resolve(res.statusCode === 200);
        });
        request.on('error', () => resolve(false));
        request.setTimeout(2000, () => {
            request.destroy();
            resolve(false);
        });
    });
}

// --- SERVIDOR WEB INTERNO ---
function startInternalServer() {
    const server = express();
    server.use(cors());
    server.use(express.json());

    // Inicializa banco de dados na pasta do APP se não existir
    if (!fs.existsSync(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, JSON.stringify({ 
            records: [], 
            users: [], 
            roleConfigs: [] 
        }, null, 2));
    }

    server.get('/api/data', (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: "Erro ao ler banco de dados" });
        }
    });

    server.post('/api/save', (req, res) => {
        try {
            fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2));
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: "Erro ao salvar" });
        }
    });

    server.get('/api/network-info', (req, res) => {
        res.json({ ip: getLocalIP(), port: PORT });
    });

    server.use(express.static(path.join(__dirname, '../dist')));
    server.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    server.listen(PORT, '0.0.0.0', () => {
        const myIP = getLocalIP();
        // Salva o endereço atual para que outros PCs saibam onde conectar
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ url: `http://${myIP}:${PORT}` }));
        console.log(`Servidor Mestre rodando em http://${myIP}:${PORT}`);
    });
}

// --- INICIALIZAÇÃO APP ---
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 1024,
        minHeight: 720,
        title: "GTC - Gestão de Turnover Cirúrgico",
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    Menu.setApplicationMenu(null);

    let targetUrl = `http://localhost:${PORT}`;
    
    // Lógica de Conexão em Rede
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            const isMasterActive = await checkServerActive(config.url);
            
            if (isMasterActive) {
                // Se o mestre já estiver rodando, este app vira apenas um "visualizador" do mestre
                targetUrl = config.url;
                console.log("Conectando ao Servidor Mestre existente em: " + targetUrl);
            } else {
                // Se o mestre não estiver ativo, este PC assume a liderança
                startInternalServer();
            }
        } catch (e) {
            startInternalServer();
        }
    } else {
        startInternalServer();
    }

    mainWindow.loadURL(targetUrl);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

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

    app.whenReady().then(createWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}