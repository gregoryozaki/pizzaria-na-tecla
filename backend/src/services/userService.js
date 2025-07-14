// backend/src/services/userService.js

const { executeQuery } = require('./dbService'); // Importa a função para executar queries
const { hashPassword, verifyPassword } = require('../utils/helpers'); // Importa as funções de hash de senha

/**
 * Cadastra um novo usuário no sistema.
 * @param {object} userData - Dados do usuário (nome, email, senha, tipo).
 * @returns {Promise<number>} O ID do usuário recém-cadastrado.
 * @throws {Error} Se o e-mail já estiver cadastrado ou ocorrer um erro no DB.
 */
async function registerUser(userData) {
    const { nome, email, senha, tipo } = userData;

    // Verificar se o email já existe
    const [existingUser] = await executeQuery('SELECT ID_Usuario FROM Usuario WHERE Email = ?', [email]);
    if (existingUser) {
        throw new Error('E-mail já cadastrado.');
    }

    // "Hash" da senha antes de armazenar
    const hashedPassword = hashPassword(senha); // Usa a função de simulação de hash

    const sql = 'INSERT INTO Usuario (Nome, Email, Senha, Tipo) VALUES (?, ?, ?, ?)';
    const result = await executeQuery(sql, [nome, email, hashedPassword, tipo]);
    return result.insertId; // Retorna o ID do usuário inserido
}

/**
 * Autentica um usuário no sistema.
 * @param {string} email - E-mail do usuário.
 * @param {string} password - Senha do usuário.
 * @returns {Promise<object|null>} Objeto do usuário (ID, Nome, Tipo) se as credenciais forem válidas, ou null.
 */
async function loginUser(email, password) {
    const [user] = await executeQuery('SELECT ID_Usuario, Nome, Senha, Tipo FROM Usuario WHERE Email = ?', [email]);

    if (!user) {
        return null; // Usuário não encontrado
    }

    // Verificar a senha
    if (verifyPassword(password, user.Senha)) { // Usa a função de simulação de verificação
        return {
            ID_Usuario: user.ID_Usuario,
            Nome: user.Nome,
            Tipo: user.Tipo
        };
    } else {
        return null; // Senha incorreta
    }
}

/**
 * Atualiza a senha de um usuário.
 * @param {string} email - E-mail do usuário cuja senha será atualizada.
 * @param {string} newPassword - A nova senha em texto claro.
 * @returns {Promise<boolean>} True se a senha foi atualizada, false se o e-mail não foi encontrado.
 */
async function updatePassword(email, newPassword) {
    const hashedPassword = hashPassword(newPassword); // Hash da nova senha

    const sql = 'UPDATE Usuario SET Senha = ? WHERE Email = ?';
    const result = await executeQuery(sql, [hashedPassword, email]);
    return result.affectedRows > 0; // Retorna true se alguma linha foi afetada (senha atualizada)
}

/**
 * Obtém todos os usuários do sistema. (Apenas para administradores)
 * @returns {Promise<Array<object>>} Um array de objetos de usuário.
 */
async function getAllUsers() {
    const sql = 'SELECT ID_Usuario, Nome, Email, Tipo, Data_Criacao FROM Usuario';
    return await executeQuery(sql);
}

/**
 * Atualiza os dados de um usuário existente. (Apenas para administradores)
 * @param {number} userId - O ID do usuário a ser atualizado.
 * @param {object} userData - Os dados do usuário a serem atualizados (nome, email, tipo).
 * @returns {Promise<boolean>} True se o usuário foi atualizado, false se não foi encontrado.
 */
async function updateUser(userId, userData) {
    const { nome, email, tipo } = userData;

    // Verificar se o novo email já existe para outro usuário (exceto o próprio)
    const [existingUserWithEmail] = await executeQuery('SELECT ID_Usuario FROM Usuario WHERE Email = ? AND ID_Usuario != ?', [email, userId]);
    if (existingUserWithEmail) {
        throw new Error('E-mail já cadastrado para outro usuário.');
    }

    const sql = 'UPDATE Usuario SET Nome = ?, Email = ?, Tipo = ? WHERE ID_Usuario = ?';
    const result = await executeQuery(sql, [nome, email, tipo, userId]);
    return result.affectedRows > 0;
}

/**
 * Deleta um usuário do sistema. (Apenas para administradores)
 * @param {number} userId - O ID do usuário a ser deletado.
 * @returns {Promise<boolean>} True se o usuário foi deletado, false se não foi encontrado.
 */
async function deleteUser(userId) {
    // Em um sistema real, você deve verificar dependências (ex: pedidos feitos por este usuário)
    // antes de deletar, ou usar ON DELETE CASCADE se o relacionamento permitir.
    // No seu MER, Usuario registra Pedido, mas não há FK direta de Pedido para Usuario.
    // Vamos considerar que, para este projeto, a exclusão de usuário é simples.
    const sql = 'DELETE FROM Usuario WHERE ID_Usuario = ?';
    const result = await executeQuery(sql, [userId]);
    return result.affectedRows > 0;
}

module.exports = {
    registerUser,
    loginUser,
    updatePassword,
    getAllUsers,
    updateUser,
    deleteUser
};