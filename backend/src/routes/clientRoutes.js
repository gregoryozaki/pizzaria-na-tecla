// backend/src/routes/clientRoutes.js

const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/authMiddleware'); // Apenas autenticação é necessária para clientes (admin/atendente)

// Função que define e retorna as rotas de clientes
async function handleClientRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse) {
    const requestPath = parsedUrl.pathname;
    // Extrai o ID do cliente da URL se a rota for específica (ex: /api/clientes/123)
    const clientIdMatch = requestPath.match(/^\/api\/clientes\/(\d+)$/);
    const clientId = clientIdMatch ? parseInt(clientIdMatch[1]) : null;

    req.params = req.params || {};
    if (clientId) {
        req.params.id = clientId; // Anexa o ID à requisição para o controlador
    }

    // Rotas para /api/clientes (GET, POST)
    if (requestPath === '/api/clientes') {
        if (method === 'POST') {
            // Permite Atendente e Admin
            return await authenticate(req, res, async () => {
                const body = await getRequestBody(req);
                req.body = body;
                return clientController.create(req, res);
            });
        }
        if (method === 'GET') {
            // Permite Atendente e Admin
            return await authenticate(req, res, async () => {
                return clientController.getAll(req, res);
            });
        }
    }

    // Rotas para /api/clientes/:id (PUT, DELETE)
    if (clientId) { // Se um ID de cliente foi encontrado na URL
        if (method === 'PUT') {
            // Permite Atendente e Admin
            return await authenticate(req, res, async () => {
                const body = await getRequestBody(req);
                req.body = body;
                return clientController.update(req, res);
            });
        }
        if (method === 'DELETE') {
            // Permite Atendente e Admin
            return await authenticate(req, res, async () => {
                return clientController.remove(req, res);
            });
        }
    }

    // Se a rota não for gerenciada por este módulo, retorna false
    return false;
}

module.exports = handleClientRoutes;