// backend/src/controllers/reportController.js

const reportService = require('../services/reportService');
const { sendJsonResponse } = require('../utils/responseUtils');

/**
 * Lida com a geração do relatório de vendas por data. (GET /api/relatorios/vendas)
 * Requer autenticação de administrador.
 */
async function getSalesReport(req, res) {
    try {
        const salesReport = await reportService.getSalesReportByDate();
        return sendJsonResponse(res, 200, salesReport);
    } catch (error) {
        console.error('Erro no controlador getSalesReport:', error);
        if (res.headersSent) {
            console.warn('Cabeçalhos já enviados, não é possível enviar nova resposta de erro para getSalesReport.');
            return;
        }
        return sendJsonResponse(res, 500, { message: 'Erro interno do servidor ao gerar relatório de vendas.' });
    }
}

module.exports = {
    getSalesReport
};