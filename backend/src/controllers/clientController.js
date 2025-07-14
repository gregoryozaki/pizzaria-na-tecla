// backend/src/controllers/clientController.js

const clientService = require('../services/clientService');
const { sendJsonResponse } = require('../utils/responseUtils');

/**
 * Lida com o cadastro de novos clientes. (POST /api/clientes)
 * Requer autenticação (admin ou atendente).
 */
async function create(req, res) {
    try {
        const { nome, telefone, endereco, email } = req.body;

        // Validações de entrada
        if (!nome || !telefone || !endereco) {
            return sendJsonResponse(res, 400, { message: 'Nome, telefone e endereço são obrigatórios para o cliente.' });
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return sendJsonResponse(res, 400, { message: 'Formato de e-mail inválido.' });
        }

        const clientId = await clientService.createClient({ nome, telefone, endereco, email });
        return sendJsonResponse(res, 201, { message: 'Cliente cadastrado com sucesso!', id: clientId });

    } catch (error) {
        console.error('Erro no controlador createClient:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para createClient.');
            return;
        }
        if (error.message && error.message.includes('Telefone já cadastrado')) {
            return sendJsonResponse(res, 409, { message: error.message });
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao cadastrar cliente.' });
    }
}

/**
 * Lida com a listagem de todos os clientes. (GET /api/clientes)
 * Requer autenticação (admin ou atendente).
 */
async function getAll(req, res) {
    try {
        const clients = await clientService.getAllClients();
        return sendJsonResponse(res, 200, clients);
    } catch (error) {
        console.error('Erro no controlador getAllClients:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para getAllClients.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao buscar clientes.' });
    }
}

/**
 * Lida com a atualização de um cliente existente. (PUT /api/clientes/:id)
 * Requer autenticação (admin ou atendente).
 */
async function update(req, res) {
    try {
        const clientId = req.params.id;
        const { nome, telefone, endereco, email } = req.body;

        if (!nome || !telefone || !endereco) {
            return sendJsonResponse(res, 400, { message: 'Nome, telefone e endereço são obrigatórios para a atualização.' });
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return sendJsonResponse(res, 400, { message: 'Formato de e-mail inválido.' });
        }

        const updated = await clientService.updateClient(clientId, { nome, telefone, endereco, email });

        if (updated) {
            return sendJsonResponse(res, 200, { message: 'Cliente atualizado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Cliente não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador updateClient:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para updateClient.');
            return;
        }
        if (error.message && error.message.includes('Telefone já cadastrado')) {
            return sendJsonResponse(res, 409, { message: error.message });
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao atualizar cliente.' });
    }
}

/**
 * Lida com a exclusão de um cliente. (DELETE /api/clientes/:id)
 * Requer autenticação (admin ou atendente).
 */
async function remove(req, res) {
    try {
        const clientId = req.params.id;
        const deleted = await clientService.deleteClient(clientId);

        if (deleted) {
            return sendJsonResponse(res, 200, { message: 'Cliente deletado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Cliente não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador deleteClient:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para deleteClient.');
            return;
        }
        if (error.message && error.message.includes('pedidos associados')) {
            return sendJsonResponse(res, 409, { message: error.message });
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao deletar cliente.' });
    }
}

module.exports = {
    create,
    getAll,
    update,
    remove
};