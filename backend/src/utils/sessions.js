// backend/src/utils/sessions.js

// Simulação de armazenamento de sessão simples (Armazenado em memória - NÃO PERSISTENTE!)
// Em produção, você usaria sessões com um armazenamento real (Redis, DB, etc.)
// ou tokens JWT (JSON Web Tokens).
const sessions = {}; // key: sessionId, value: { userId, userName, userType, createdAt }

/**
 * Cria uma nova sessão simulada e a armazena em memória.
 * @param {number} userId - O ID do usuário.
 * @param {string} userName - O nome do usuário.
 * @param {string} userType - O tipo do usuário ('admin' ou 'atendente').
 * @returns {string} O ID da sessão gerado.
 */
function createSession(userId, userName, userType) {
    // Gera um sessionId simples (NÃO SEGURO PARA PRODUÇÃO - use libs para tokens seguros!)
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessions[sessionId] = {
        userId: userId,
        userName: userName,
        userType: userType,
        createdAt: Date.now() // Marca o tempo de criação/última atividade
    };
    // console.log('Sessão criada:', sessionId, sessions[sessionId]); // Opcional para debug
    return sessionId;
}

/**
 * Obtém uma sessão pelo seu ID.
 * Também realiza uma validação básica de expiração.
 * @param {string} sessionId - O ID da sessão a ser buscada.
 * @returns {object|null} O objeto da sessão se encontrada e válida, caso contrário, null.
 */
function getSession(sessionId) {
    const session = sessions[sessionId];
    if (!session) {
        return null; // Sessão não encontrada
    }

    // Validação básica de expiração da sessão (1 hora de inatividade)
    // Se a sessão está muito antiga, a considera expirada
    if (Date.now() - session.createdAt > 3600 * 1000) { // 3600 * 1000 ms = 1 hora
        delete sessions[sessionId]; // Remove a sessão expirada da memória
        // console.log('Sessão expirada e removida:', sessionId); // Opcional para debug
        return null;
    }

    // Renova o timestamp da sessão na atividade (sliding session)
    session.createdAt = Date.now();
    return session;
}

/**
 * Deleta uma sessão da memória.
 * @param {string} sessionId - O ID da sessão a ser deletada.
 * @returns {boolean} True se a sessão foi deletada com sucesso, false caso contrário.
 */
function deleteSession(sessionId) {
    if (sessions[sessionId]) {
        // console.log('Sessão deletada:', sessionId); // Opcional para debug
        delete sessions[sessionId];
        return true;
    }
    return false;
}

module.exports = {
    createSession,
    getSession,
    deleteSession
};