// backend/server.js

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const db = require('./src/config/db');

// Importa os módulos de rotas.
const handleAuthRoutes = require('./src/routes/authRoutes');
const handleProductRoutes = require('./src/routes/productRoutes');
const handleClientRoutes = require('./src/routes/clientRoutes');
const handleOrderRoutes = require('./src/routes/orderRoutes');
const handleUserRoutes = require('./src/routes/userRoutes');     // <-- Importação das rotas de usuários
const handleReportRoutes = require('./src/routes/reportRoutes'); // <-- Importação das rotas de relatórios

const { sendJsonResponse } = require('./src/utils/responseUtils');


const port = 3001;

db.connect(err => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
        return;
    }
    console.log('✅ Conectado ao banco de dados MySQL.');
});

const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Corpo da requisição inválido (não é JSON).'));
            }
        });
        req.on('error', err => {
            reject(err);
        });
    });
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const requestPath = parsedUrl.pathname;
    const method = req.method;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let filePath = path.join(__dirname, '../frontend/public', requestPath);

    if (requestPath === '/') {
        filePath = path.join(__dirname, '../frontend/public/index.html');
    } else if (requestPath.endsWith('/') && requestPath !== '/') {
        filePath = path.join(filePath, 'index.html');
    }

    try {
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'text/plain';
            switch (ext) {
                case '.html': contentType = 'text/html'; break;
                case '.css': contentType = 'text/css'; break;
                case '.js': contentType = 'application/javascript'; break;
                case '.json': contentType = 'application/json'; break;
                case '.png': contentType = 'image/png'; break;
                case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
                case '.gif': contentType = 'image/gif'; break;
                case '.svg': contentType = 'image/svg+xml'; break;
                case '.ico': contentType = 'image/x-icon'; break;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    } catch (err) {
        // Ignorar erros de arquivo estático não encontrado e continuar para as rotas da API
    }

    // --- Rotas da API ---
    // A ordem é importante. As mais específicas ou mais frequentemente acessadas primeiro.

    if (await handleAuthRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse)) {
        return;
    }

    if (await handleProductRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse)) {
        return;
    }

    if (await handleClientRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse)) {
        return;
    }

    if (await handleOrderRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse)) {
        return;
    }

    // Rotas de usuários (gerenciamento)
    if (await handleUserRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse)) {
        return;
    }

    // NOVO: Rotas de relatórios
    if (await handleReportRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse)) { // <-- NOVO BLOCO
        return;
    }

    // Rota de exemplo '/api/status' (mantida por enquanto para testar o servidor)
    if (requestPath === '/api/status' && method === 'GET') {
        return sendJsonResponse(res, 200, { message: 'API Status: Online', timestamp: new Date().toISOString() });
    }

    if (!res.headersSent) {
        sendJsonResponse(res, 404, { message: 'Rota não encontrada.' });
    }
});

server.listen(port, () => {
    console.log(`🚀 Backend rodando em http://localhost:${port}`);
    console.log(`🌐 Servindo frontend de ../frontend/public/`);
});