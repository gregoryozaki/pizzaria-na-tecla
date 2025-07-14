// backend/src/routes/userRoutes.js

const userController = require('../controllers/userController');
const { authorizeAdmin } = require('../middleware/authMiddleware'); // Apenas admins podem gerenciar outros usuários

// Função que define e retorna as rotas de usuários (gerenciamento)
async function handleUserRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse) {
    const requestPath = parsedUrl.pathname;
    // Extrai o ID do usuário da URL se a rota for específica (ex: /api/usuarios/123)
    const userIdMatch = requestPath.match(/^\/api\/usuarios\/(\d+)$/);
    const userId = userIdMatch ? parseInt(userIdMatch[1]) : null;

    req.params = req.params || {};
    if (userId) {
        req.params.id = userId; // Anexa o ID à requisição para o controlador
    }

    // Rotas para /api/usuarios (GET)
    // A rota POST /api/usuarios (registro) é tratada por authRoutes.js
    if (requestPath === '/api/usuarios') {
        if (method === 'GET') {
            // RF01: Obter todos os Usuários - Apenas Admin
            return await authorizeAdmin(req, res, async () => {
                return userController.getAll(req, res);
            });
        }
    }

    // Rotas para /api/usuarios/:id (PUT, DELETE)
    if (userId) { // Se um ID de usuário foi encontrado na URL
        if (method === 'PUT') {
            // RF01: Atualizar Usuário - Apenas Admin
            return await authorizeAdmin(req, res, async () => {
                const body = await getRequestBody(req);
                req.body = body;
                return userController.update(req, res);
            });
        }
        if (method === 'DELETE') {
            // RF01: Deletar Usuário - Apenas Admin
            return await authorizeAdmin(req, res, async () => {
                return userController.remove(req, res);
            });
        }
    }

    // Se a rota não for gerenciada por este módulo, retorna false
    return false;
}

module.exports = handleUserRoutes;