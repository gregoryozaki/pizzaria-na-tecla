// backend/src/services/reportService.js

const { executeQuery } = require('./dbService');

/**
 * Gera um relatório de vendas agrupado por data para pedidos com status 'entregue'.
 * @returns {Promise<Array<object>>} Um array de objetos com data e total de vendas para aquela data.
 */
async function getSalesReportByDate() {
    const sql = `
        SELECT
            DATE(Data_Hora) AS data,
            SUM(IP.Quantidade * IP.Valor_Unitario) AS total_vendas
        FROM
            Pedido P
        JOIN
            Item_Pedido IP ON P.ID_Pedido = IP.ID_Pedido
        WHERE
            P.Status = 'entregue'
        GROUP BY
            DATE(Data_Hora)
        ORDER BY
            data DESC;
    `;
    return await executeQuery(sql);
}

// Outros relatórios podem ser adicionados aqui (ex: produtos mais vendidos, vendas por cliente)

module.exports = {
    getSalesReportByDate
};