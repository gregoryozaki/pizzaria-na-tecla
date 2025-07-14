// frontend/public/js/utils.js

// URL base do seu backend. Mantenha consistente com o server.js
const backendUrl = 'http://localhost:3001/api';

// Tenta recuperar a sessão do armazenamento local
// Estas variáveis serão exportadas e usadas por outros módulos JS
let currentSessionId = localStorage.getItem('sessionId');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

/**
 * Retorna um elemento HTML pelo seu ID.
 * @param {string} id - O ID do elemento.
 * @returns {HTMLElement|null} O elemento HTML ou null se não encontrado.
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Exibe uma mensagem de feedback na tela (sucesso ou erro).
 * @param {string} elementId - O ID do elemento onde a mensagem será exibida.
 * @param {string} message - O texto da mensagem.
 * @param {boolean} [isError=false] - Se a mensagem é um erro (true) ou sucesso (false).
 */
function showMessage(elementId, message, isError = false) {
    const element = getElement(elementId);
    if (element) {
        element.textContent = message;
        // Aplica estilos baseados se é erro ou sucesso
        element.style.color = isError ? '#721c24' : '#155724'; // Vermelho para erro, verde para sucesso
        element.style.backgroundColor = isError ? '#f8d7da' : '#d4edda'; // Fundo claro correspondente
        element.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb'; // Borda correspondente
        element.style.display = 'block';
        element.style.padding = '0.8em';
        element.style.marginTop = '1em';
        element.style.borderRadius = '5px';
        element.style.border = '1px solid';
    }
}

/**
 * Oculta uma mensagem de feedback.
 * @param {string} elementId - O ID do elemento da mensagem.
 */
function hideMessage(elementId) {
    const element = getElement(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Realiza uma requisição HTTP para a API de backend.
 * Adiciona automaticamente os cabeçalhos 'Content-Type' e 'Authorization' (se houver sessionId).
 * @param {string} endpoint - O caminho da API (ex: '/usuarios/login').
 * @param {string} method - O método HTTP (GET, POST, PUT, DELETE).
 * @param {object} [data=null] - Os dados a serem enviados no corpo da requisição (para POST/PUT).
 * @returns {Promise<object>} Um objeto contendo { ok: boolean, status: number, data: object }.
 */
async function makeApiRequest(endpoint, method, data = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (currentSessionId) { // Se houver uma sessão, adiciona o cabeçalho de autorização
        headers['Authorization'] = currentSessionId;
    }

    const options = {
        method: method,
        headers: headers,
    };
    if (data) {
        options.body = JSON.stringify(data); // Converte o objeto de dados para JSON
    }

    try {
        const response = await fetch(`${backendUrl}${endpoint}`, options);
        // Resposta 204 (No Content) é comum para requisições OPTIONS ou DELETE bem-sucedidas sem corpo de resposta
        if (response.status === 204) {
             return { ok: response.ok, status: response.status, data: {} };
        }
        const result = await response.json(); // Tenta parsear a resposta como JSON
        return { ok: response.ok, status: response.status, data: result };
    } catch (error) {
        console.error('Erro na requisição API:', error);
        return { ok: false, status: 500, data: { message: 'Erro de conexão com o servidor.' } };
    }
}

/**
 * Atualiza as variáveis de sessão no frontend e no localStorage.
 * @param {string|null} sessionId - O ID da sessão atual.
 * @param {object|null} user - Objeto do usuário logado.
 */
function updateSession(sessionId, user) {
    currentSessionId = sessionId;
    currentUser = user;
    if (sessionId) {
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUser');
    }
}


// Exporta as funções e variáveis para que outros módulos possam importá-las
export {
    backendUrl,
    currentSessionId,
    currentUser,
    getElement,
    showMessage,
    hideMessage,
    makeApiRequest,
    updateSession
};