
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const os = require('os');

let controlWindow;
const PORT = 3000;

const DATA_DIR = path.join(app.getPath('userData'), 'database');
const DATA_PATH = path.join(DATA_DIR, 'gsc_database.json');
const BACKUP_PATH = path.join(DATA_DIR, 'gsc_database_backup.json');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const candidates = [];
    for (const name in interfaces) {
        if (name.toLowerCase().includes('virtual') || name.toLowerCase().includes('vbox') || name.toLowerCase().includes('vswitch') || name.toLowerCase().includes('docker')) continue;
        for (const iface of interfaces[name]) {
            if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
                candidates.push(iface.address);
            }
        }
    }
    return candidates.length > 0 ? candidates[0] : '127.0.0.1';
}

function initDatabase() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_PATH)) {
        if (fs.existsSync(BACKUP_PATH)) fs.copyFileSync(BACKUP_PATH, DATA_PATH);
        else fs.writeFileSync(DATA_PATH, JSON.stringify({ records: [], users: [], roleConfigs: [] }, null, 2));
    }
}

function startInternalServer() {
    initDatabase();
    const server = express();
    server.use(cors());
    server.use(express.json({ limit: '50mb' }));
    server.get('/api/data', (req, res) => {
        try { const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); res.json(data); } catch (e) {
            try { if (fs.existsSync(BACKUP_PATH)) res.json(JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'))); else res.status(500).json({ error: "DB Error" }); } catch (err) { res.status(500).json({ error: "Critical Error" }); }
        }
    });
    server.post('/api/save', (req, res) => {
        try { const dataString = JSON.stringify(req.body, null, 2); const tempPath = DATA_PATH + '.tmp'; fs.writeFileSync(tempPath, dataString); if (fs.existsSync(DATA_PATH)) fs.copyFileSync(DATA_PATH, BACKUP_PATH); fs.renameSync(tempPath, DATA_PATH); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Save Error" }); }
    });
    server.use(express.static(path.join(__dirname, '../dist')));
    server.get('*', (req, res) => { const indexPath = path.join(__dirname, '../dist/index.html'); if (fs.existsSync(indexPath)) res.sendFile(indexPath); else res.status(404).send("Not Found"); });
    server.listen(PORT, '0.0.0.0');
}

async function createControlPanel() {
    controlWindow = new BrowserWindow({
        width: 480, height: 460, resizable: false, title: "GSC - Servidor de Rede", autoHideMenuBar: true,
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
                body { font-family: sans-serif; background: #0f172a; color: white; text-align: center; padding: 40px 20px; }
                .ip { color: #3583C7; font-size: 32px; font-weight: 900; margin: 20px 0; }
                .btn { background: #3583C7; color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-weight: 800; width: 100%; }
            </style>
        </head>
        <body>
            <h2>GSC - Gestão de Sala Cirúrgica</h2>
            <div class="ip">${accessURL}</div>
            <button class="btn" onclick="require('electron').shell.openExternal('http://localhost:${PORT}')">Abrir Sistema</button>
        </body>
        </html>
    `;
    controlWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
    app.on('second-instance', () => { if (controlWindow) { if (controlWindow.isMinimized()) controlWindow.restore(); controlWindow.focus(); shell.openExternal(`http://localhost:${PORT}`); } });
    app.whenReady().then(() => { startInternalServer(); createControlPanel(); });
}
