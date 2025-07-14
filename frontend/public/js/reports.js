// frontend/public/js/reports.js

import { getElement, showMessage, hideMessage, makeApiRequest, currentUser } from './utils.js';

/**
 * Inicializa a lógica da página de Relatórios (relatorios.html).
 */
export function setupReportsPage() {
    // Verifica permissão (apenas admin pode acessar)
    if (!currentUser || currentUser.tipo !== 'admin') {
        alert('Acesso negado. Apenas administradores podem visualizar relatórios.');
        window.location.href = 'painel.html';
        return;
    }

    const appContent = getElement('app-content');
    if (!appContent) {
        console.error('Elemento #app-content não encontrado na página de relatórios.');
        return;
    }

    // Injeta o HTML para a seção de relatórios de vendas.
    appContent.innerHTML = `
        <section class="card">
            <h2>Relatórios Gerenciais</h2>
            <p>Acompanhe os resultados de vendas, entregas e controle de estoque para tomar decisões estratégicas.</p>
        </section>
        <section class="card">
            <h3>Relatório de Vendas por Data</h3>
            <button id="gerarRelatorioVendasBtn">Gerar Relatório</button>
            <div id="relatorioVendasOutput" style="margin-top: 1em;"></div>
            <p id="relatorioVendasMessage" style="display:none;"></p>
        </section>
    `;

    // Referências aos elementos do DOM
    const gerarRelatorioVendasBtn = getElement('gerarRelatorioVendasBtn');
    const relatorioVendasOutput = getElement('relatorioVendasOutput');
    const relatorioVendasMessage = getElement('relatorioVendasMessage');

    hideMessage('relatorioVendasMessage');

    // Event Listener para o botão de Gerar Relatório de Vendas
    if (gerarRelatorioVendasBtn) {
        gerarRelatorioVendasBtn.addEventListener('click', async () => {
            relatorioVendasOutput.innerHTML = 'Gerando relatório...';
            hideMessage('relatorioVendasMessage');

            const response = await makeApiRequest('/relatorios/vendas', 'GET'); // Requisição GET para relatório de vendas
            if (response.ok) {
                relatorioVendasOutput.innerHTML = '';
                if (response.data.length === 0) {
                    relatorioVendasOutput.textContent = 'Nenhum dado de vendas para o relatório.';
                    return;
                }

                // Renderiza os dados do relatório em uma lista
                const ul = document.createElement('ul');
                response.data.forEach(item => {
                    const li = document.createElement('li');
                    // Formata a data e o valor
                    const formattedDate = new Date(item.data).toLocaleDateString('pt-BR');
                    const formattedTotal = parseFloat(item.total_vendas).toFixed(2);
                    li.innerHTML = `<strong>Data:</strong> ${formattedDate} - <strong>Total Vendas:</strong> R$ ${formattedTotal}`;
                    ul.appendChild(li);
                });
                relatorioVendasOutput.appendChild(ul);
            } else {
                showMessage('relatorioVendasMessage', response.data.message || 'Erro ao gerar relatório de vendas.', true);
            }
        });
    }
}