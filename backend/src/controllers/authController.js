// backend/src/controllers/authController.js

const userService = require('../services/userService');
// const { sendJsonResponse } = require('../../server'); // <-- REMOVA OU COMENTE ESTA LINHA
const { sendJsonResponse } = require('../utils/responseUtils'); // <-- ADICIONE ESTA LINHA
// O 'sessions' é um objeto em memória. Em produção, isso seria gerenciado por um banco de dados de sessão ou JWT.
const sessions = require('../utils/sessions');
/**
 * Lida com o registro de novos usuários. (POST /api/usuarios/register)
 * @param {object} req - Objeto de requisição HTTP.
 * @param {object} res - Objeto de resposta HTTP.
 */
async function register(req, res) {
    try {
        const { nome, email, senha, tipo } = req.body; // Dados vêm do corpo da requisição parseado pelo getRequestBody

        // Validação básica (duplicação da validação do frontend para segurança do backend)
        if (!nome || !email || !senha || !tipo) {
            return sendJsonResponse(res, 400, { message: 'Todos os campos são obrigatórios.' });
        }
        if (senha.length < 6) {
            return sendJsonResponse(res, 400, { message: 'A senha deve ter pelo menos 6 caracteres.' });
        }
        if (!['admin', 'atendente'].includes(tipo)) {
            return sendJsonResponse(res, 400, { message: 'Tipo de usuário inválido. Deve ser "admin" ou "atendente".' });
        }

        const userId = await userService.registerUser({ nome, email, senha, tipo });
        sendJsonResponse(res, 201, { message: 'Usuário cadastrado com sucesso!', id: userId });
    } catch (error) {
        console.error('Erro no controlador register:', error);
        if (error.message === 'E-mail já cadastrado.') {
            return sendJsonResponse(res, 409, { message: error.message }); // 409 Conflict
        }
        sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao cadastrar usuário.' });
    }
}

/**
 * Lida com o login de usuários. (POST /api/usuarios/login)
 * @param {object} req - Objeto de requisição HTTP.
 * @param {object} res - Objeto de resposta HTTP.
 */
async function login(req, res) {
    try {
        const { email, senha } = req.body; // Dados vêm do corpo da requisição

        const user = await userService.loginUser(email, senha);

        if (user) {
            // Se o login for bem-sucedido, cria uma sessão simulada
            const sessionId = sessions.createSession(user.ID_Usuario, user.Nome, user.Tipo);
            sendJsonResponse(res, 200, {
                message: 'Login bem-sucedido!',
                user: { id: user.ID_Usuario, nome: user.Nome, tipo: user.Tipo },
                sessionId: sessionId // Envia o sessionId para o frontend
            });
        } else {
            sendJsonResponse(res, 401, { message: 'Credenciais inválidas.' }); // 401 Unauthorized
        }
    } catch (error) {
        console.error('Erro no controlador login:', error);
        sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao fazer login.' });
    }
}

/**
 * Lida com o logout de usuários. (POST /api/usuarios/logout)
 * @param {object} req - Objeto de requisição HTTP.
 * @param {object} res - Objeto de resposta HTTP.
 */
async function logout(req, res) {
    const sessionId = req.headers['authorization']; // Pega o sessionId do cabeçalho
    if (sessionId && sessions.deleteSession(sessionId)) { // Tenta deletar a sessão
        sendJsonResponse(res, 200, { message: 'Desconectado com sucesso.' });
    } else {
        sendJsonResponse(res, 400, { message: 'Nenhuma sessão ativa para desconectar.' });
    }
}

/**
 * Lida com a atualização de senha de usuários. (POST /api/usuarios/atualizar-senha)
 * @param {object} req - Objeto de requisição HTTP.
 * @param {object} res - Objeto de resposta HTTP.
 */
async function updatePassword(req, res) {
    try {
        const { email, senha } = req.body; // Nova senha vem do corpo da requisição

        if (!email || !senha || senha.length < 6) {
            return sendJsonResponse(res, 400, { message: 'E-mail e senha (mínimo 6 caracteres) são obrigatórios.' });
        }

        const updated = await userService.updatePassword(email, senha);

        if (updated) {
            sendJsonResponse(res, 200, { message: 'Senha atualizada com sucesso!' });
        } else {
            sendJsonResponse(res, 404, { message: 'E-mail não encontrado.' }); // 404 Not Found
        }
    } catch (error) {
        console.error('Erro no controlador updatePassword:', error);
        sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao atualizar senha.' });
    }
}

module.exports = {
    register,
    login,
    logout,
    updatePassword
};