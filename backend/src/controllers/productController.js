// backend/src/controllers/productController.js

const productService = require('../services/productService');
const { sendJsonResponse } = require('../utils/responseUtils');

async function create(req, res) {
    try {
        const { nome, descricao, preco, tipo } = req.body;

        if (!nome || isNaN(preco) || preco <= 0 || !tipo) {
            return sendJsonResponse(res, 400, { message: 'Nome, preço (positivo) e tipo são obrigatórios para o produto.' });
        }
        if (!['pizza', 'bebida', 'adicional'].includes(tipo)) {
            return sendJsonResponse(res, 400, { message: 'Tipo de produto inválido. Deve ser "pizza", "bebida" ou "adicional".' });
        }

        const productId = await productService.createProduct({ nome, descricao, preco, tipo });
        return sendJsonResponse(res, 201, { message: 'Produto cadastrado com sucesso!', id: productId });

    } catch (error) {
        console.error('Erro no controlador createProduct:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para createProduct.');
            return;
        }
        if (error.message && error.message.includes('Produto com este nome já cadastrado')) {
            return sendJsonResponse(res, 409, { message: error.message });
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao cadastrar produto.' });
    }
}

async function getAll(req, res) {
    try {
        const products = await productService.getAllProducts();
        return sendJsonResponse(res, 200, products); // <-- GARANTIR QUE SEMPRE RETORNA AQUI E NÃO CONTINUA
    } catch (error) {
        console.error('Erro no controlador getAllProducts:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para getAllProducts.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao buscar produtos.' });
    }
}

async function update(req, res) {
    try {
        const productId = req.params.id;
        const { nome, descricao, preco, tipo, ativo } = req.body;

        if (!nome || isNaN(preco) || preco <= 0 || !tipo) {
            return sendJsonResponse(res, 400, { message: 'Nome, preço (positivo) e tipo são obrigatórios.' });
        }
        if (!['pizza', 'bebida', 'adicional'].includes(tipo)) {
            return sendJsonResponse(res, 400, { message: 'Tipo de produto inválido. Deve ser "pizza", "bebida" ou "adicional".' });
        }
        if (typeof ativo !== 'boolean' && ativo !== 0 && ativo !== 1) {
            return sendJsonResponse(res, 400, { message: 'O status "ativo" deve ser um valor booleano (true/false) ou 0/1.' });
        }

        const updated = await productService.updateProduct(productId, { nome, descricao, preco, tipo, ativo });

        if (updated) {
            return sendJsonResponse(res, 200, { message: 'Produto atualizado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Produto não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador updateProduct:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para updateProduct.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao atualizar produto.' });
    }
}

async function remove(req, res) {
    try {
        const productId = req.params.id;
        const deleted = await productService.deleteProduct(productId);

        if (deleted) {
            return sendJsonResponse(res, 200, { message: 'Produto deletado com sucesso!' });
        } else {
            return sendJsonResponse(res, 404, { message: 'Produto não encontrado.' });
        }
    } catch (error) {
        console.error('Erro no controlador deleteProduct:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para deleteProduct.');
            return;
        }
        if (error.message.includes('pedidos associados')) {
            return sendJsonResponse(res, 409, { message: error.message });
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao deletar produto.' });
    }
}

module.exports = {
    create,
    getAll,
    update,
    remove
};