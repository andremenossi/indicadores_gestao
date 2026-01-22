const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const os = require('os');

let controlWindow;
const PORT = 3000;

// Pasta de dados persistente
const EXE_DIR = path.dirname(app.getPath('exe'));
const DATA_PATH = path.join(EXE_DIR, 'gtc_database.json');

/**
 * Detecta o IP real da máquina, priorizando interfaces físicas.
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const name in interfaces) {
        // Ignora interfaces virtuais comuns que podem confundir a rota de rede
        if (name.toLowerCase().includes('virtual') || 
            name.toLowerCase().includes('vbox') || 
            name.toLowerCase().includes('vswitch') ||
            name.toLowerCase().includes('docker')) continue;

        for (const iface of interfaces[name]) {
            if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
                candidates.push(iface.address);
            }
        }
    }
    
    // Retorna o primeiro candidato válido ou localhost como fallback
    return candidates.length > 0 ? candidates[0] : '127.0.0.1';
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
        const indexPath = path.join(__dirname, '../dist/index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send("Front-end não encontrado.");
        }
    });

    // Binding explícito em 0.0.0.0 para aceitar conexões externas
    const httpInstance = server.listen(PORT, '0.0.0.0', () => {
        console.log(`[SERVER] Rodando em http://0.0.0.0:${PORT}`);
    });

    httpInstance.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`[SERVER] Erro: A porta ${PORT} já está em uso.`);
            // Notifica o usuário se a janela estiver aberta
            if (controlWindow) {
                controlWindow.webContents.executeJavaScript(`document.getElementById('status').innerHTML = 'ERRO: Porta ${PORT} ocupada'; document.getElementById('status').className = 'status-tag error';`);
            }
        }
    });
}

async function createControlPanel() {
    controlWindow = new BrowserWindow({
        width: 480,
        height: 440,
        resizable: false,
        title: "HEPP Gestão - Servidor de Rede",
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const localIP = getLocalIP();
    const accessURL = `http://${localIP}:${PORT}`;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: white; text-align: center; padding: 40px 20px; margin: 0; }
                .logo { width: 80px; margin-bottom: 20px; }
                h2 { margin: 0; font-size: 20px; letter-spacing: 1px; color: #f8fafc; }
                .status-tag { display: inline-block; background: #064e3b; color: #10b981; padding: 4px 14px; border-radius: 20px; font-size: 10px; font-weight: 800; margin-top: 10px; border: 1px solid #065f46; text-transform: uppercase; }
                .status-tag.error { background: #450a0a; color: #ef4444; border-color: #7f1d1d; }
                .card { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; margin-top: 30px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
                .label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px; }
                .ip { color: #3583C7; font-size: 32px; font-weight: 900; margin: 10px 0; font-family: 'Courier New', monospace; letter-spacing: -1px; }
                .btn { background: #3583C7; color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 12px; transition: all 0.2s; margin-top: 15px; width: 100%; box-shadow: 0 4px 6px -1px rgba(53, 131, 199, 0.3); }
                .btn:hover { background: #2d70ab; transform: translateY(-1px); }
                .footer { font-size: 10px; color: #475569; margin-top: 30px; line-height: 1.5; }
                .warning-box { margin-top: 15px; padding: 10px; border-radius: 6px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: #f59e0b; font-size: 9px; font-weight: bold; text-transform: uppercase; line-height: 1.3; }
            </style>
        </head>
        <body>
            <img src="logo.png" class="logo" onerror="this.style.display='none'">
            <h2>HEPP Gestão</h2>
            <div id="status" class="status-tag">Servidor Online (0.0.0.0)</div>
            
            <div class="card">
                <div class="label">Endereço de Acesso Externo:</div>
                <div class="ip">${accessURL}</div>
                <button class="btn" onclick="openBrowser()">Abrir neste computador</button>
                <div class="warning-box">
                    Atenção: Se outros PCs não acessarem, altere o perfil da rede do Windows de "Pública" para "Privada".
                </div>
            </div>
            
            <div class="footer">
                Não feche esta janela enquanto estiver trabalhando.<br>
                Banco de dados: ${DATA_PATH}
            </div>

            <script>
                const { shell } = require('electron');
                function openBrowser() { shell.openExternal('http://localhost:${PORT}'); }
            </script>
        </body>
        </html>
    `;

    controlWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Abre o navegador padrão localmente
    shell.openExternal(`http://localhost:${PORT}`);

    controlWindow.on('closed', () => {
        controlWindow = null;
    });
}

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