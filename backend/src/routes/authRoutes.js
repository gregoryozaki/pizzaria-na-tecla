// backend/src/routes/authRoutes.js

const authController = require('../controllers/authController'); // Importa o controlador de autenticação

// Função que define e retorna as rotas de autenticação
// Ela será chamada pelo server.js
function handleAuthRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse) {
    const requestPath = parsedUrl.pathname;

    // Rota de Registro de Usuários
    if (requestPath === '/api/usuarios/register' && method === 'POST') {
        return getRequestBody(req) // Pega o corpo da requisição
            .then(body => {
                req.body = body; // Adiciona o corpo parseado à requisição
                return authController.register(req, res); // Chama o método do controlador
            })
            .catch(error => {
                console.error('Erro ao processar corpo da requisição de registro:', error);
                sendJsonResponse(res, 400, { message: error.message || 'Dados inválidos para registro.' });
            });
    }

    // Rota de Login de Usuários
    if (requestPath === '/api/usuarios/login' && method === 'POST') {
        return getRequestBody(req)
            .then(body => {
                req.body = body;
                return authController.login(req, res);
            })
            .catch(error => {
                console.error('Erro ao processar corpo da requisição de login:', error);
                sendJsonResponse(res, 400, { message: error.message || 'Dados inválidos para login.' });
            });
    }

    // Rota de Logout de Usuários
    if (requestPath === '/api/usuarios/logout' && method === 'POST') {
        // Para logout, geralmente não há corpo de requisição, mas o sessionId vem nos headers.
        // O controlador já espera o sessionId nos headers.
        return authController.logout(req, res);
    }

    // Rota de Atualização de Senha
    if (requestPath === '/api/usuarios/atualizar-senha' && method === 'POST') {
        return getRequestBody(req)
            .then(body => {
                req.body = body;
                return authController.updatePassword(req, res);
            })
            .catch(error => {
                console.error('Erro ao processar corpo da requisição de atualização de senha:', error);
                sendJsonResponse(res, 400, { message: error.message || 'Dados inválidos para atualização de senha.' });
            });
    }

    // Se a rota não for gerenciada por este módulo, retorna false
    return false;
}

module.exports = handleAuthRoutes;