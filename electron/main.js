const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const os = require('os');

let controlWindow;
const PORT = 3000;

// Pasta de dados persistente na pasta do executável
const APP_DIR = path.dirname(app.getPath('exe'));
const DATA_PATH = path.join(APP_DIR, 'gtc_database.json');

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

function startInternalServer() {
    const server = express();
    server.use(cors());
    server.use(express.json());

    if (!fs.existsSync(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, JSON.stringify({ records: [], users: [], roleConfigs: [] }, null, 2));
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

    server.use(express.static(path.join(__dirname, '../dist')));
    server.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor GTC rodando em http://0.0.0.0:${PORT}`);
    });
}

async function createControlPanel() {
    // Janela pequena apenas para controle e visualização do IP
    controlWindow = new BrowserWindow({
        width: 450,
        height: 350,
        resizable: false,
        title: "GTC - Painel do Servidor",
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const localIP = getLocalIP();
    const accessURL = `http://${localIP}:${PORT}`;

    // HTML simples incorporado para o Painel de Controle
    const controlHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; background: #0f172a; color: white; text-align: center; padding: 20px; }
                .card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-top: 20px; }
                .ip { color: #3583C7; font-size: 24px; font-weight: bold; margin: 15px 0; }
                .btn { background: #3583C7; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; text-transform: uppercase; font-size: 12px; }
                .btn:hover { background: #2d70ab; }
                .status { color: #10b981; font-size: 11px; text-transform: uppercase; font-weight: bold; }
            </style>
        </head>
        <body>
            <img src="logo.png" style="width: 60px; margin-bottom: 10px;">
            <h3>Servidor GTC Ativo</h3>
            <p style="font-size: 13px; color: #94a3b8;">O sistema está rodando em sua rede local.</p>
            <div class="card">
                <div class="status">● Endereço de Acesso</div>
                <div class="ip">${accessURL}</div>
                <button class="btn" onclick="openBrowser()">Abrir no Navegador</button>
            </div>
            <p style="font-size: 10px; color: #64748b; margin-top: 20px;">Mantenha esta janela aberta para que outros possam acessar.</p>
            <script>
                const { shell } = require('electron');
                function openBrowser() { shell.openExternal('${accessURL}'); }
            </script>
        </body>
        </html>
    `;

    fs.writeFileSync(path.join(__dirname, 'control.html'), controlHTML);
    controlWindow.loadFile(path.join(__dirname, 'control.html'));

    // Abre o navegador automaticamente na primeira execução
    shell.openExternal(`http://localhost:${PORT}`);
}

app.whenReady().then(() => {
    startInternalServer();
    createControlPanel();
});

app.on('window-all-closed', () => {
    app.quit();
});