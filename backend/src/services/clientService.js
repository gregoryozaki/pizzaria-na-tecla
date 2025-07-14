// backend/src/services/clientService.js

const { executeQuery } = require('./dbService');

/**
 * Cadastra um novo cliente.
 * @param {object} clientData - Dados do cliente (Nome, Telefone, Endereco, Email).
 * @returns {Promise<number>} O ID do cliente recém-cadastrado.
 * @throws {Error} Se o Telefone já estiver cadastrado.
 */
async function createClient(clientData) {
    const { nome, telefone, endereco, email } = clientData;

    // Verificar se o telefone já existe
    const [existingClient] = await executeQuery('SELECT ID_Cliente FROM Cliente WHERE Telefone = ?', [telefone]);
    if (existingClient) {
        throw new Error('Telefone já cadastrado para outro cliente.');
    }

    const sql = 'INSERT INTO Cliente (Nome, Telefone, Endereco, Email) VALUES (?, ?, ?, ?)';
    // email pode ser NULL, então passamos 'null' se o campo estiver vazio.
    const result = await executeQuery(sql, [nome, telefone, endereco, email || null]);
    return result.insertId;
}

/**
 * Obtém todos os clientes.
 * @returns {Promise<Array<object>>} Um array de objetos de cliente.
 */
async function getAllClients() {
    const sql = 'SELECT ID_Cliente, Nome, Telefone, Endereco, Email FROM Cliente';
    return await executeQuery(sql);
}

/**
 * Atualiza os dados de um cliente existente.
 * @param {number} clientId - O ID do cliente a ser atualizado.
 * @param {object} clientData - Os dados do cliente (Nome, Telefone, Endereco, Email).
 * @returns {Promise<boolean>} True se o cliente foi atualizado, false se não foi encontrado.
 * @throws {Error} Se o novo Telefone já estiver cadastrado para outro cliente.
 */
async function updateClient(clientId, clientData) {
    const { nome, telefone, endereco, email } = clientData;

    // Verificar se o novo telefone já existe para outro cliente (exceto o próprio)
    const [existingClientWithPhone] = await executeQuery('SELECT ID_Cliente FROM Cliente WHERE Telefone = ? AND ID_Cliente != ?', [telefone, clientId]);
    if (existingClientWithPhone) {
        throw new Error('Telefone já cadastrado para outro cliente.');
    }

    const sql = 'UPDATE Cliente SET Nome = ?, Telefone = ?, Endereco = ?, Email = ? WHERE ID_Cliente = ?';
    const result = await executeQuery(sql, [nome, telefone, endereco, email || null, clientId]);
    return result.affectedRows > 0;
}

/**
 * Deleta um cliente do sistema.
 * @param {number} clientId - O ID do cliente a ser deletado.
 * @returns {Promise<boolean>} True se o cliente foi deletado, false se não foi encontrado.
 * @throws {Error} Se o cliente tiver pedidos associados (integridade referencial).
 */
async function deleteClient(clientId) {
    // Primeiro, verifica se há pedidos associados a este cliente para evitar deleção em cascata indesejada
    const [orderCount] = await executeQuery('SELECT COUNT(*) AS count FROM Pedido WHERE ID_Cliente = ?', [clientId]);

    if (orderCount.count > 0) {
        throw new Error('Não é possível deletar o cliente: existem pedidos associados a ele.');
    }

    const sql = 'DELETE FROM Cliente WHERE ID_Cliente = ?';
    const result = await executeQuery(sql, [clientId]);
    return result.affectedRows > 0;
}

module.exports = {
    createClient,
    getAllClients,
    updateClient,
    deleteClient
};