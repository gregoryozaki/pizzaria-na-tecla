// backend/src/middleware/authMiddleware.js

const { sendJsonResponse } = require('../utils/responseUtils');
const { getSession } = require('../utils/sessions');

/**
 * Middleware de autenticação.
 * Verifica se a requisição possui um sessionId válido no cabeçalho Authorization.
 * Se sim, anexa as informações do usuário à requisição (req.user) e prossegue.
 * Caso contrário, retorna um erro 401 Não Autorizado.
 * @param {object} req - Objeto de requisição HTTP.
 * @param {object} res - Objeto de resposta HTTP.
 * @param {function} next - Função de callback para prosseguir para a próxima função (controlador/middleware).
 */
async function authenticate(req, res, next) { // <-- TORNADO ASYNC
    const sessionId = req.headers['authorization'];
    const session = getSession(sessionId);

    if (!sessionId || !session) {
        return sendJsonResponse(res, 401, { message: 'Não autorizado. Faça login.' });
    }

    req.user = {
        userId: session.userId,
        userName: session.userName,
        userType: session.userType
    };
    // Chama o 'next' e AWAITA seu resultado.
    // Isso garante que o middleware 'authenticate' espera a execução do próximo passo (controlador)
    // antes de considerar sua própria execução como concluída ou de permitir que a execução continue no nível superior.
    await next(); // <-- ADICIONADO AWAIT AQUI
}

/**
 * Middleware de autorização para administradores.
 * Primeiro, autentica o usuário, depois verifica se o tipo de usuário é 'admin'.
 * Se não for 'admin', retorna um erro 403 Acesso Negado.
 * @param {object} req - Objeto de requisição HTTP.
 * @param {object} res - Objeto de resposta HTTP.
 * @param {function} next - Função de callback para prosseguir para a próxima função (controlador).
 */
async function authorizeAdmin(req, res, next) { // <-- TORNADO ASYNC
    // A função authenticate agora é assíncrona, então devemos usar await nela.
    // Para que authorizeAdmin se comporte como um middleware, ele não deve chamar sendJsonResponse diretamente
    // se authenticate já o fez. O padrão comum é passar next() para authenticate.
    // No entanto, o `next` aqui é a função interna que chama o controlador.
    // Vamos reestruturar authorizeAdmin para primeiro autenticar e só então chamar o next() com a lógica principal.
    
    // Autentica o usuário primeiro
    const authResult = await new Promise(resolve => {
        authenticate(req, res, () => {
            resolve(true); // Autenticação bem-sucedida
        });
    }).catch(() => false); // Autenticação falhou

    if (!authResult || !req.user) { // Se a autenticação falhou (já deve ter enviado 401)
        // Isso é uma medida defensiva. authenticate já enviou a resposta.
        if (!res.headersSent) {
            return sendJsonResponse(res, 401, { message: 'Não autorizado. Faça login.' });
        }
        return;
    }

    // Se a autenticação foi bem-sucedida, verifica o tipo de usuário
    if (req.user.userType === 'admin') {
        await next(); // <-- CHAMA A LÓGICA DO CONTROLADOR E AWAITA
    } else {
        if (!res.headersSent) { // Previne dupla resposta
            sendJsonResponse(res, 403, { message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
        }
    }
}


module.exports = {
    authenticate,
    authorizeAdmin
};