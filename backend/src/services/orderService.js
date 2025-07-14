// backend/src/services/orderService.js

const { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } = require('./dbService');

/**
 * Cria um novo pedido com seus itens associados.
 * Utiliza transações para garantir que o pedido e seus itens sejam inseridos atomicamente.
 * @param {number} clienteId - O ID do cliente que está fazendo o pedido.
 * @param {Array<object>} itens - Um array de objetos de itens ({ produto_id, quantidade, preco_unitario }).
 * @returns {Promise<number>} O ID do pedido recém-criado.
 * @throws {Error} Se o cliente não existir, algum produto não existir, ou ocorrer um erro na transação.
 */
async function createOrder(clienteId, itens) {
    await beginTransaction(); // Inicia a transação

    try {
        // 1. Verificar se o cliente existe
        const [cliente] = await executeQuery('SELECT ID_Cliente FROM Cliente WHERE ID_Cliente = ?', [clienteId]);
        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }

        // 2. Criar o pedido principal
        // O status inicial será 'preparando'
        const orderSql = 'INSERT INTO Pedido (ID_Cliente, Data_Hora, Status) VALUES (?, NOW(), ?)';
        const orderResult = await executeQuery(orderSql, [clienteId, 'preparando']);
        const pedidoId = orderResult.insertId;

        // 3. Adicionar os itens do pedido e calcular o valor total
        let valorTotal = 0;
        for (const item of itens) {
            const { produto_id, quantidade, preco_unitario, personalizacoes } = item;

            // Opcional: Verificar se o produto existe e está ativo.
            // Para este projeto, vamos assumir que o produto existe.
            const [produto] = await executeQuery('SELECT ID_Produto FROM Produto WHERE ID_Produto = ?', [produto_id]);
            if (!produto) {
                 throw new Error(`Produto com ID ${produto_id} não encontrado.`);
            }

            const itemSql = 'INSERT INTO Item_Pedido (ID_Pedido, ID_Produto, Quantidade, Valor_Unitario, Personalizacoes) VALUES (?, ?, ?, ?, ?)';
            await executeQuery(itemSql, [pedidoId, produto_id, quantidade, preco_unitario, personalizacoes || null]);
            valorTotal += quantidade * preco_unitario;
        }

        // 4. Atualizar o valor total no pedido (opcional, pode ser calculado na query GET se preferir)
        // No seu MER, o Valor_Total não está explícito no Pedido, mas é útil.
        // Se o valor total será calculado no frontend ou via JOIN, esta atualização não é necessária.
        // Para simplificar, não vamos adicionar um campo 'valor_total' na tabela Pedido agora,
        // mas vamos calculá-lo ao listar.

        await commitTransaction(); // Confirma todas as operações da transação
        return pedidoId;

    } catch (error) {
        await rollbackTransaction(); // Em caso de erro, desfaz todas as operações
        throw error; // Repropaga o erro
    }
}

/**
 * Obtém todos os pedidos com detalhes do cliente e itens.
 * @returns {Promise<Array<object>>} Um array de objetos de pedido.
 */
async function getAllOrders() {
    const sql = `
        SELECT
            P.ID_Pedido,
            P.ID_Cliente,
            C.Nome AS Cliente_Nome,
            C.Telefone AS Cliente_Telefone,
            P.Data_Hora,
            P.Status,
            GROUP_CONCAT(CONCAT(IP.Quantidade, 'x ', Prod.Nome, ' (R$', IP.Valor_Unitario, ')') SEPARATOR '; ') AS Itens,
            SUM(IP.Quantidade * IP.Valor_Unitario) AS Valor_Total
        FROM
            Pedido P
        JOIN
            Cliente C ON P.ID_Cliente = C.ID_Cliente
        LEFT JOIN
            Item_Pedido IP ON P.ID_Pedido = IP.ID_Pedido
        LEFT JOIN
            Produto Prod ON IP.ID_Produto = Prod.ID_Produto
        GROUP BY
            P.ID_Pedido, P.ID_Cliente, C.Nome, C.Telefone, P.Data_Hora, P.Status
        ORDER BY
            P.Data_Hora DESC;
    `;
    return await executeQuery(sql);
}

/**
 * Atualiza o status de um pedido.
 * @param {number} orderId - O ID do pedido a ser atualizado.
 * @param {string} newStatus - O novo status do pedido ('preparando', 'a caminho', 'entregue', 'cancelado').
 * @returns {Promise<boolean>} True se o status foi atualizado, false se não foi encontrado.
 */
async function updateOrderStatus(orderId, newStatus) {
    const sql = 'UPDATE Pedido SET Status = ? WHERE ID_Pedido = ?';
    const result = await executeQuery(sql, [newStatus, orderId]);
    return result.affectedRows > 0;
}

/**
 * Deleta um pedido e seus itens associados.
 * Utiliza transações para garantir a deleção atômica.
 * @param {number} orderId - O ID do pedido a ser deletado.
 * @returns {Promise<boolean>} True se o pedido foi deletado, false se não foi encontrado.
 */
async function deleteOrder(orderId) {
    await beginTransaction(); // Inicia a transação

    try {
        // 1. Deletar itens do pedido primeiro
        const deleteItemsSql = 'DELETE FROM Item_Pedido WHERE ID_Pedido = ?';
        await executeQuery(deleteItemsSql, [orderId]);

        // 2. Deletar o pedido principal
        const deleteOrderSql = 'DELETE FROM Pedido WHERE ID_Pedido = ?';
        const result = await executeQuery(deleteOrderSql, [orderId]);

        await commitTransaction(); // Confirma ambas as deleções
        return result.affectedRows > 0; // Retorna true se o pedido foi deletado (ignora itens, já que são em cascata)

    } catch (error) {
        await rollbackTransaction(); // Em caso de erro, desfaz a transação
        throw error; // Repropaga o erro
    }
}

module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
};