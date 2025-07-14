// backend/src/routes/reportRoutes.js

const reportController = require('../controllers/reportController');
const { authorizeAdmin } = require('../middleware/authMiddleware'); // Apenas admins podem gerar relatórios

// Função que define e retorna as rotas de relatórios
async function handleReportRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse) {
    const requestPath = parsedUrl.pathname;

    // Rota para /api/relatorios/vendas (GET)
    if (requestPath === '/api/relatorios/vendas') {
        if (method === 'GET') {
            // RF04: Relatórios de Vendas - Apenas Admin
            return await authorizeAdmin(req, res, async () => {
                return reportController.getSalesReport(req, res);
            });
        }
    }

    // Outros tipos de relatórios (ex: /api/relatorios/produtos-mais-vendidos) viriam aqui

    // Se a rota não for gerenciada por este módulo, retorna false
    return false;
}

module.exports = handleReportRoutes;