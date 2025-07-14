// backend/src/utils/responseUtils.js

/**
 * Envia uma resposta JSON padronizada para o cliente.
 * @param {object} res - O objeto de resposta HTTP.
 * @param {number} statusCode - O código de status HTTP (ex: 200, 201, 400, 404, 500).
 * @param {object} data - O objeto de dados a ser enviado como JSON.
 */
function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' }); // Define o cabeçalho Content-Type
    res.end(JSON.stringify(data)); // Converte o objeto para JSON e envia
}

// Exporta a função para que outros módulos possam importá-la
module.exports = {
    sendJsonResponse
};