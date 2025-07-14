// backend/src/routes/orderRoutes.js

const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware'); // Apenas autenticação é necessária para pedidos (admin/atendente)

// Função que define e retorna as rotas de pedidos
async function handleOrderRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse) {
    const requestPath = parsedUrl.pathname;
    // Extrai o ID do pedido da URL se a rota for específica (ex: /api/pedidos/123)
    const orderIdMatch = requestPath.match(/^\/api\/pedidos\/(\d+)$/);
    const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : null;

    req.params = req.params || {};
    if (orderId) {
        req.params.id = orderId; // Anexa o ID à requisição para o controlador
    }

    // Rotas para /api/pedidos (GET, POST)
    if (requestPath === '/api/pedidos') {
        if (method === 'POST') {
            // Permite Atendente e Admin
            return await authenticate(req, res, async () => {
                const body = await getRequestBody(req);
                req.body = body;
                return orderController.create(req, res);
            });
        }
        if (method === 'GET') {
            // Permite Atendente e Admin
            return await authenticate(req, res, async () => {
                return orderController.getAll(req, res);
            });
        }
    }

    // Rotas para /api/pedidos/:id (PUT para status, DELETE)
    if (orderId) { // Se um ID de pedido foi encontrado na URL
        if (method === 'PUT') {
            // Permite Atendente e Admin para atualizar status
            return await authenticate(req, res, async () => {
                const body = await getRequestBody(req);
                req.body = body; // Espera { status: 'novo_status' } no corpo
                return orderController.updateStatus(req, res); // Chama updateStatus
            });
        }
        if (method === 'DELETE') {
            // Permite Atendente e Admin
            return await authenticate(req, res, async () => {
                return orderController.remove(req, res);
            });
        }
    }

    // Se a rota não for gerenciada por este módulo, retorna false
    return false;
}

module.exports = handleOrderRoutes;