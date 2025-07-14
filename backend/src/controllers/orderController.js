// backend/src/controllers/orderController.js

const orderService = require('../services/orderService');
const { sendJsonResponse } = require('../utils/responseUtils');

/**
 * Lida com a criação de um novo pedido. (POST /api/pedidos)
 * Requer autenticação (admin ou atendente).
 */
async function create(req, res) {
    try {
        const { cliente_id, itens } = req.body;

        // Validações básicas
        if (!cliente_id || isNaN(cliente_id) || cliente_id <= 0) {
            return sendJsonResponse(res, 400, { message: 'ID do cliente inválido.' });
        }
        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return sendJsonResponse(res, 400, { message: 'O pedido deve conter pelo menos um item.' });
        }
        for (const item of itens) {
            if (!item.produto_id || isNaN(item.produto_id) || item.produto_id <= 0 ||
                !item.quantidade || isNaN(item.quantidade) || item.quantidade <= 0 ||
                !item.preco_unitario || isNaN(item.preco_unitario) || item.preco_unitario <= 0) {
                return sendJsonResponse(res, 400, { message: 'Cada item deve ter um ID de produto, quantidade e preço unitário válidos.' });
            }
        }

        const pedidoId = await orderService.createOrder(cliente_id, itens);
        return sendJsonResponse(res, 201, { message: 'Pedido criado com sucesso!', id: pedidoId });

    } catch (error) {
        console.error('Erro no controlador createOrder:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para createOrder.');
            return;
        }
        if (error.message.includes('Cliente não encontrado') || error.message.includes('Produto com ID')) {
             return sendJsonResponse(res, 400, { message: error.message }); // Cliente ou produto não encontrado
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao criar pedido.' });
    }
}

/**
 * Lida com a listagem de todos os pedidos. (GET /api/pedidos)
 * Requer autenticação (admin ou atendente).
 */
async function getAll(req, res) {
    try {
        const orders = await orderService.getAllOrders();
        return sendJsonResponse(res, 200, orders);
    } catch (error) {
        console.error('Erro no controlador getAllOrders:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para getAllOrders.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao buscar pedidos.' });
    }
}

/**
 * Lida com a atualização do status de um pedido. (PUT /api/pedidos/:id)
 * Requer autenticação (admin ou atendente).
 */
async function updateStatus(req, res) {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        if (!status || !['preparando', 'a caminho', 'entregue', 'cancelado'].includes(status)) {
            return sendJsonResponse(res, 400, { message: 'Status inválido. Deve ser "preparando", "a caminho", "entregue" ou "cancelado".' });
        }

        const updated = await orderService.updateOrderStatus(orderId, status);

        if (updated) {
            return sendJsonResponse(res, 200, { message: 'Status do pedido atualizado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador updateStatus:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para updateStatus.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao atualizar status do pedido.' });
    }
}

/**
 * Lida com a exclusão de um pedido. (DELETE /api/pedidos/:id)
 * Requer autenticação (admin ou atendente).
 */
async function remove(req, res) {
    try {
        const orderId = req.params.id;
        const deleted = await orderService.deleteOrder(orderId);

        if (deleted) {
            return sendJsonResponse(res, 200, { message: 'Pedido deletado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador deleteOrder:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para deleteOrder.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao deletar pedido.' });
    }
}

module.exports = {
    create,
    getAll,
    updateStatus,
    remove
};