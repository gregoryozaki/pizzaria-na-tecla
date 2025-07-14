// backend/src/services/productService.js

const { executeQuery } = require('./dbService');

async function createProduct(productData) {
    const { nome, descricao, preco, tipo } = productData;
    const sql = 'INSERT INTO Produto (Nome, Descricao, Preco, Tipo) VALUES (?, ?, ?, ?)';
    const result = await executeQuery(sql, [nome, descricao, preco, tipo]);
    return result.insertId;
}

async function getAllProducts() {
    const sql = 'SELECT ID_Produto, Nome, Descricao, Preco, Tipo, Status FROM Produto';
    const products = await executeQuery(sql);
    return products.map(product => ({
        ...product,
        Status: Boolean(product.Status)
    }));
}

async function getProductById(productId) {
    const [product] = await executeQuery('SELECT ID_Produto, Nome, Descricao, Preco, Tipo, Status FROM Produto WHERE ID_Produto = ?', [productId]);
    if (product) {
        product.Status = Boolean(product.Status);
    }
    return product;
}

async function updateProduct(productId, productData) {
    const { nome, descricao, preco, tipo, ativo } = productData;
    const mysqlStatus = ativo ? 1 : 0;

    const sql = 'UPDATE Produto SET Nome = ?, Descricao = ?, Preco = ?, Tipo = ?, Status = ? WHERE ID_Produto = ?';
    const result = await executeQuery(sql, [nome, descricao, preco, tipo, mysqlStatus, productId]);
    return result.affectedRows > 0;
}

async function deleteProduct(productId) {
    const [itemCount] = await executeQuery('SELECT COUNT(*) AS count FROM Item_Pedido WHERE ID_Produto = ?', [productId]);

    if (itemCount.count > 0) {
        throw new Error('Não é possível deletar o produto: existem pedidos associados a ele.');
    }

    const sql = 'DELETE FROM Produto WHERE ID_Produto = ?';
    const result = await executeQuery(sql, [productId]);
    return result.affectedRows > 0;
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};