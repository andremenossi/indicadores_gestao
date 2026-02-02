
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const os = require('os');

let controlWindow;
const PORT = 3000;

// Organização profissional: pasta 'db' dentro dos dados do app
const APP_DATA_DIR = app.getPath('userData');
const DATABASE_DIR = path.join(APP_DATA_DIR, 'db');
const DATABASE_FILE = path.join(DATABASE_DIR, 'gsc_master.json');
const BACKUP_FILE = path.join(DATABASE_DIR, 'gsc_master_backup.json');

// Dados iniciais para garantir que o login ADMIN funcione na primeira execução
const INITIAL_DB_STATE = {
    records: [],
    cleaningRecords: [],
    users: [
        { id: '1', username: 'ADMIN', password: '@_admin123', role: 'ADMIN' },
        { id: '2', username: 'ESTATISTICA', password: 'estatistica123', role: 'ESTATISTICA' },
        { id: '3', username: 'CIRURGICO', password: 'cirurgico123', role: 'CIRURGICO' },
        { id: '4', username: 'LIMPEZA', password: 'limpeza123', role: 'LIMPEZA' }
    ],
    roleConfigs: [
        { 
            id: 'ADMIN', 
            roleName: 'ADMIN', 
            permissions: [
                'VIEW_DASHBOARD', 'MANAGE_USERS', 'VIEW_TURNOVER', 'ADD_TURNOVER', 
                'EDIT_TURNOVER', 'DELETE_TURNOVER', 'DELETE_PERIOD_TURNOVER',
                'VIEW_CLEANING', 'ADD_CLEANING', 'EDIT_CLEANING', 'DELETE_CLEANING', 'DELETE_PERIOD_CLEANING'
            ] 
        },
        { id: 'ESTATISTICA', roleName: 'ESTATISTICA', permissions: ['VIEW_DASHBOARD', 'VIEW_TURNOVER', 'EDIT_TURNOVER', 'VIEW_CLEANING', 'EDIT_CLEANING'] },
        { id: 'CIRURGICO', roleName: 'CIRURGICO', permissions: ['VIEW_TURNOVER', 'ADD_TURNOVER'] },
        { id: 'LIMPEZA', roleName: 'LIMPEZA', permissions: ['VIEW_CLEANING', 'ADD_CLEANING'] }
    ]
};

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

function initDatabase() {
    console.log('Iniciando Banco de Dados em:', DATABASE_DIR);
    if (!fs.existsSync(DATABASE_DIR)) {
        fs.mkdirSync(DATABASE_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATABASE_FILE)) {
        console.log('Banco de dados não encontrado. Criando novo com usuário ADMIN padrão...');
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(INITIAL_DB_STATE, null, 2));
    }
}

function startInternalServer() {
    initDatabase();
    const server = express();
    server.use(cors());
    server.use(express.json({ limit: '50mb' }));

    // API para buscar dados
    server.get('/api/data', (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
            res.json(data);
        } catch (e) {
            console.error('Erro ao ler banco de dados:', e);
            res.status(500).json({ error: "Erro interno no servidor de dados" });
        }
    });

    // API para salvar dados (Atomic Write)
    server.post('/api/save', (req, res) => {
        try {
            const dataString = JSON.stringify(req.body, null, 2);
            const tempPath = DATABASE_FILE + '.tmp';
            
            // Backup antes de salvar
            if (fs.existsSync(DATABASE_FILE)) {
                fs.copyFileSync(DATABASE_FILE, BACKUP_FILE);
            }
            
            fs.writeFileSync(tempPath, dataString);
            fs.renameSync(tempPath, DATABASE_FILE);
            
            res.json({ success: true });
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            res.status(500).json({ error: "Erro ao persistir informações no disco" });
        }
    });

    // Servir arquivos estáticos do dashboard
    server.use(express.static(path.join(__dirname, '../dist')));
    
    server.get('*', (req, res) => {
        const indexPath = path.join(__dirname, '../dist/index.html');
        if (fs.existsSync(indexPath)) res.sendFile(indexPath);
        else res.status(404).send("Front-end não encontrado. Execute o build primeiro.");
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

async function createControlPanel() {
    controlWindow = new BrowserWindow({
        width: 500,
        height: 500,
        resizable: false,
        title: "GSC Server - Ativo",
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/logo.png'),
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });

    const localIP = getLocalIP();
    const accessURL = `http://${localIP}:${PORT}`;
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: white; text-align: center; padding: 40px; margin: 0; }
                .container { border: 1px solid #1e293b; border-radius: 12px; padding: 30px; background: #111827; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .logo { width: 80px; margin-bottom: 20px; }
                h2 { margin: 0; color: #3583C7; text-transform: uppercase; letter-spacing: 2px; font-size: 18px; }
                .status { color: #10b981; font-size: 10px; font-weight: bold; margin-bottom: 20px; display: block; }
                .ip-box { background: #020617; border: 1px solid #3583C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .ip-label { font-size: 9px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; display: block; }
                .ip-value { color: #3583C7; font-size: 24px; font-weight: 900; }
                .btn { background: #3583C7; color: white; border: none; padding: 14px; border-radius: 6px; cursor: pointer; font-weight: 800; width: 100%; transition: 0.2s; font-size: 12px; text-transform: uppercase; }
                .btn:hover { background: #2d70ab; }
                .path { font-size: 9px; color: #475569; margin-top: 20px; word-break: break-all; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>HEPP Gestão</h2>
                <span class="status">● SERVIDOR ATIVO</span>
                <div class="ip-box">
                    <span class="ip-label">Endereço de Acesso na Rede:</span>
                    <div class="ip-value">${accessURL}</div>
                </div>
                <button class="btn" onclick="require('electron').shell.openExternal('http://localhost:${PORT}')">Abrir Dashboard</button>
                <div class="path">Base de Dados: ${DATABASE_FILE}</div>
            </div>
        </body>
        </html>
    `;
    controlWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (controlWindow) {
            if (controlWindow.isMinimized()) controlWindow.restore();
            controlWindow.focus();
        }
    });
    app.whenReady().then(() => {
        startInternalServer();
        createControlPanel();
    });
}
