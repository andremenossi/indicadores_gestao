const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const os = require('os');

let controlWindow;
const PORT = 3000;

// Pasta de dados persistente: tenta usar a pasta do EXE, mas se não tiver permissão, usa a pasta de dados do usuário
const EXE_DIR = path.dirname(app.getPath('exe'));
const DATA_PATH = path.join(EXE_DIR, 'gtc_database.json');

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

    // Inicializa o banco de dados se não existir
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

    // Serve os arquivos estáticos do React (da pasta dist)
    server.use(express.static(path.join(__dirname, '../dist')));
    
    // Rota coringa para o React Router (SPA)
    server.get('*', (req, res) => {
        const indexPath = path.join(__dirname, '../dist/index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send("Front-end não encontrado. Execute o build primeiro.");
        }
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor GTC rodando em http://0.0.0.0:${PORT}`);
    });
}

async function createControlPanel() {
    controlWindow = new BrowserWindow({
        width: 480,
        height: 420,
        resizable: false,
        title: "GTC - Servidor Ativo",
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const localIP = getLocalIP();
    const accessURL = `http://${localIP}:${PORT}`;

    // Em vez de salvar um arquivo, carregamos o HTML via Data URL para ser mais seguro
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: white; text-align: center; padding: 40px 20px; margin: 0; }
                .logo { width: 80px; margin-bottom: 20px; }
                h2 { margin: 0; font-size: 20px; letter-spacing: 1px; color: #f8fafc; }
                .status-tag { display: inline-block; background: #064e3b; color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; margin-top: 10px; border: 1px solid #065f46; }
                .card { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; margin-top: 30px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
                .label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px; }
                .ip { color: #3583C7; font-size: 28px; font-weight: 900; margin: 10px 0; font-family: monospace; }
                .btn { background: #3583C7; color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 12px; transition: all 0.2s; margin-top: 15px; width: 100%; box-shadow: 0 4px 6px -1px rgba(53, 131, 199, 0.3); }
                .btn:hover { background: #2d70ab; transform: translateY(-1px); }
                .btn:active { transform: translateY(0); }
                .footer { font-size: 10px; color: #475569; margin-top: 30px; line-height: 1.5; }
            </style>
        </head>
        <body>
            <img src="logo.png" class="logo" onerror="this.style.display='none'">
            <h2>GTC - Servidor Ativo</h2>
            <div class="status-tag">ON-LINE</div>
            
            <div class="card">
                <div class="label">Endereço de Acesso Local</div>
                <div class="ip">${accessURL}</div>
                <button class="btn" onclick="openBrowser()">Abrir no Navegador</button>
            </div>
            
            <div class="footer">
                Mantenha esta janela aberta para garantir o acesso.<br>
                Dados salvos em: ${DATA_PATH}
            </div>

            <script>
                const { shell } = require('electron');
                function openBrowser() { shell.openExternal('http://localhost:${PORT}'); }
            </script>
        </body>
        </html>
    `;

    controlWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Abre o navegador padrão automaticamente na inicialização
    shell.openExternal(`http://localhost:${PORT}`);

    controlWindow.on('closed', () => {
        controlWindow = null;
    });
}

// Impede múltiplas instâncias do servidor
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (controlWindow) {
            if (controlWindow.isMinimized()) controlWindow.restore();
            controlWindow.focus();
            shell.openExternal(`http://localhost:${PORT}`);
        }
    });

    app.whenReady().then(() => {
        startInternalServer();
        createControlPanel();
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}