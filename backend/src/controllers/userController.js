// backend/src/controllers/userController.js

const userService = require('../services/userService');
const { sendJsonResponse } = require('../utils/responseUtils');
// REMOVA OU COMENTE A LINHA ABAIXO se ela estiver no seu userController.js
// const { getElement, showMessage, hideMessage, makeApiRequest, currentUser } = require('../utils/utils.js'); // <-- REMOVER ESTA LINHA


/**
 * Lida com a listagem de todos os usuários. (GET /api/usuarios)
 * Requer autenticação de administrador.
 */
async function getAll(req, res) {
    try {
        const users = await userService.getAllUsers();
        const usersWithoutPasswords = users.map(user => {
            const { Senha, ...rest } = user;
            return rest;
        });
        return sendJsonResponse(res, 200, usersWithoutPasswords);
    } catch (error) {
        console.error('Erro no controlador getAllUsers:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para getAllUsers.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao buscar usuários.' });
    }
}

/**
 * Lida com a atualização de um usuário existente. (PUT /api/usuarios/:id)
 * Requer autenticação de administrador.
 */
async function update(req, res) {
    try {
        const userId = req.params.id;
        const { nome, email, tipo } = req.body;

        if (!nome || !email || !tipo) {
            return sendJsonResponse(res, 400, { message: 'Nome, e-mail e tipo são obrigatórios para a atualização.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return sendJsonResponse(res, 400, { message: 'Formato de e-mail inválido.' });
        }
        if (!['admin', 'atendente'].includes(tipo)) {
            return sendJsonResponse(res, 400, { message: 'Tipo de usuário inválido. Deve ser "admin" ou "atendente".' });
        }

        const updated = await userService.updateUser(userId, { nome, email, tipo });

        if (updated) {
            return sendJsonResponse(res, 200, { message: 'Usuário atualizado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador updateUser:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para updateUser.');
            return;
        }
        if (error.message && error.message.includes('E-mail já cadastrado para outro usuário.')) {
            return sendJsonResponse(res, 409, { message: error.message });
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao atualizar usuário.' });
    }
}

/**
 * Lida com a exclusão de um usuário. (DELETE /api/usuarios/:id)
 * Requer autenticação de administrador.
 */
async function remove(req, res) {
    try {
        const userId = req.params.id;

        const deleted = await userService.deleteUser(userId);

        if (deleted) {
            return sendJsonResponse(res, 200, { message: 'Usuário deletado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador deleteUser:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para deleteUser.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao deletar usuário.' });
    }
}

module.exports = {
    getAll,
    update,
    remove
};