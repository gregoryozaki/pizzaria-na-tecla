// frontend/public/js/orders.js

import { getElement, showMessage, hideMessage, makeApiRequest, currentUser } from './utils.js';

/**
 * Inicializa a lógica da página de Gerenciamento de Pedidos (pedidos.html).
 */
export function setupOrderManagePage() {
    // Verifica permissão (qualquer usuário logado pode acessar)
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const appContent = getElement('app-content');
    if (!appContent) {
        console.error('Elemento #app-content não encontrado na página de pedidos.');
        return;
    }

    // O HTML para a página de pedidos é injetado aqui para garantir que os elementos existam no DOM.
    appContent.innerHTML = `
        <section class="card">
            <h2>Pedidos em andamento</h2>
            <p>Acompanhe aqui todos os pedidos realizados, com detalhes, status e controle de entregas.</p>
            <div style="margin-top: 1em;">
                <input type="text" id="searchInputPedidos" placeholder="Pesquisar pedidos por cliente ou status..." style="width: calc(100% - 110px); display: inline-block;">
                <button id="searchBtnPedidos" style="width: 100px; margin-left: 5px;">Pesquisar</button>
            </div>
            <p id="pedidosSearchMessage" style="display:none;"></p>
        </section>
        <section class="card">
            <h3>Criar Novo Pedido</h3>
            <form id="pedidoForm">
                <label for="pedidoClienteId">ID do Cliente:</label>
                <input type="number" id="pedidoClienteId" required min="1">
                <p>Itens do Pedido:</p>
                <div id="itensPedidoContainer">
                    <div>
                        <input type="number" class="item-produto-id" placeholder="ID Produto" style="width: 25%;" required min="1">
                        <input type="number" class="item-quantidade" placeholder="Qtd" style="width: 25%;" required min="1">
                        <input type="number" class="item-preco-unitario" placeholder="Preço Unit." step="0.01" style="width: 25%;" required min="0.01">
                        <input type="text" class="item-personalizacoes" placeholder="Personalizações (opcional)" style="width: 25%;">
                        <button type="button" class="remove-item-btn" style="background-color: #dc3545; margin-left: 5px; width: auto; padding: 5px 10px;">-</button>
                    </div>
                </div>
                <button type="button" id="addItemPedidoBtn">Adicionar Item</button>
                <button type="submit">Criar Pedido</button>
                <p id="pedidoMessage" style="display:none;"></p>
            </form>
        </section>
        <section class="card">
            <h3>Lista de Pedidos</h3>
            <div id="listaPedidos">Carregando pedidos...</div>
        </section>
    `;

    // Referências aos elementos do DOM
    const pedidosList = getElement('listaPedidos');
    const pedidoForm = getElement('pedidoForm');
    const itensPedidoContainer = getElement('itensPedidoContainer');
    const addItemPedidoBtn = getElement('addItemPedidoBtn');
    const pedidoMessage = getElement('pedidoMessage');
    const searchInputPedidos = getElement('searchInputPedidos');
    const searchBtnPedidos = getElement('searchBtnPedidos');
    const pedidosSearchMessage = getElement('pedidosSearchMessage');

    hideMessage('pedidoMessage');
    hideMessage('pedidosSearchMessage');

    // Event Listener para adicionar um novo item ao formulário de pedido
    if (addItemPedidoBtn) {
        addItemPedidoBtn.addEventListener('click', () => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <input type="number" class="item-produto-id" placeholder="ID Produto" style="width: 25%;" required min="1">
                <input type="number" class="item-quantidade" placeholder="Qtd" style="width: 25%;" required min="1">
                <input type="number" class="item-preco-unitario" placeholder="Preço Unit." step="0.01" style="width: 25%;" required min="0.01">
                <input type="text" class="item-personalizacoes" placeholder="Personalizações (opcional)" style="width: 25%;">
                <button type="button" class="remove-item-btn" style="background-color: #dc3545; margin-left: 5px; width: auto; padding: 5px 10px;">-</button>
            `;
            itensPedidoContainer.appendChild(itemDiv);
            // Adiciona o listener para remover o item recém-criado
            itemDiv.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.parentNode.remove());
        });
    }

    // Event Listener para o formulário de Criação de Pedido
    if (pedidoForm) {
        pedidoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cliente_id = getElement('pedidoClienteId').value;
            const itemProdutoIds = document.querySelectorAll('.item-produto-id');
            const itemQuantidades = document.querySelectorAll('.item-quantidade');
            const itemPrecosUnitarios = document.querySelectorAll('.item-preco-unitario');
            const itemPersonalizacoes = document.querySelectorAll('.item-personalizacoes');
            const itens = [];

            if (!cliente_id || parseInt(cliente_id) <= 0) {
                showMessage('pedidoMessage', 'Por favor, informe um ID de cliente válido.', true);
                return;
            }

            for (let i = 0; i < itemProdutoIds.length; i++) {
                const produto_id = parseInt(itemProdutoIds[i].value);
                const quantidade = parseInt(itemQuantidades[i].value);
                const preco_unitario = parseFloat(itemPrecosUnitarios[i].value);
                const personalizacoes = itemPersonalizacoes[i].value;

                if (isNaN(produto_id) || produto_id <= 0 ||
                    isNaN(quantidade) || quantidade <= 0 ||
                    isNaN(preco_unitario) || preco_unitario <= 0) {
                    showMessage('pedidoMessage', 'Verifique os dados dos itens do pedido (ID Produto, Qtd, Preço Unitário).', true);
                    return;
                }
                itens.push({ produto_id, quantidade, preco_unitario, personalizacoes });
            }

            if (itens.length === 0) {
                showMessage('pedidoMessage', 'Adicione pelo menos um item ao pedido.', true);
                return;
            }

            hideMessage('pedidoMessage');

            const response = await makeApiRequest('/pedidos', 'POST', { cliente_id: parseInt(cliente_id), itens });

            if (response.ok) {
                showMessage('pedidoMessage', response.data.message);
                pedidoForm.reset();
                // Reseta o container de itens para o padrão com um item inicial
                itensPedidoContainer.innerHTML = `
                    <div>
                        <input type="number" class="item-produto-id" placeholder="ID Produto" style="width: 25%;" required min="1">
                        <input type="number" class="item-quantidade" placeholder="Qtd" style="width: 25%;" required min="1">
                        <input type="number" class="item-preco-unitario" placeholder="Preço Unit." step="0.01" style="width: 25%;" required min="0.01">
                        <input type="text" class="item-personalizacoes" placeholder="Personalizações (opcional)" style="width: 25%;">
                        <button type="button" class="remove-item-btn" style="background-color: #dc3545; margin-left: 5px; width: auto; padding: 5px 10px;">-</button>
                    </div>
                `;
                // Adiciona listener para o botão de remover do item inicial
                itensPedidoContainer.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.parentNode.remove());
                carregarPedidos(); // Recarrega a lista de pedidos
            } else {
                showMessage('pedidoMessage', response.data.message || 'Erro ao criar pedido.', true);
            }
        });
    }

    // Função para carregar e exibir a lista de pedidos
    async function carregarPedidos(searchTerm = '') {
        pedidosList.innerHTML = 'Carregando pedidos...';
        hideMessage('pedidosSearchMessage');
        const response = await makeApiRequest('/pedidos', 'GET');
        if (response.ok) {
            pedidosList.innerHTML = '';
            let orders = response.data; // Dados vêm com nomes de colunas do DB

            if (searchTerm) {
                orders = orders.filter(o =>
                    o.Cliente_Nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.Status.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (orders.length === 0) {
                    showMessage('pedidosSearchMessage', 'Nenhum pedido encontrado com estes critérios.', true);
                } else {
                    showMessage('pedidosSearchMessage', `${orders.length} pedido(s) encontrado(s).`, false);
                }
            }

            if (orders.length === 0 && !searchTerm) {
                pedidosList.textContent = 'Nenhum pedido encontrado.';
                return;
            }

            orders.forEach(order => {
                const div = document.createElement('div');
                div.className = 'pedido-item card';
                div.innerHTML = `
                    <h4>Pedido #${order.ID_Pedido} - Cliente: ${order.Cliente_Nome} (${order.Cliente_Telefone})</h4>
                    <p>Data/Hora: ${new Date(order.Data_Hora).toLocaleString()}</p>
                    <p>Status: <strong id="status-display-${order.ID_Pedido}">${order.Status}</strong></p>
                    <p>Valor Total: R$ ${parseFloat(order.Valor_Total || 0).toFixed(2)}</p>
                    <p>Itens: ${order.Itens || 'Nenhum item'}</p>
                    <select class="status-select" data-id="${order.ID_Pedido}">
                        <option value="preparando">Preparando</option>
                        <option value="a caminho">A Caminho</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                    <button class="update-status-btn" data-id="${order.ID_Pedido}">Atualizar Status</button>
                    <button class="delete-pedido-btn" data-id="${order.ID_Pedido}">Remover Pedido</button>
                `;
                pedidosList.appendChild(div);
                // Define o status selecionado no dropdown
                const statusSelect = div.querySelector(`.status-select`);
                if (statusSelect) {
                    statusSelect.value = order.Status;
                }
            });
            addEventListenersToPedidoButtons(); // Adiciona listeners aos botões após a renderização
        } else {
            pedidosList.textContent = response.data.message || 'Erro ao carregar pedidos.';
            showMessage('pedidosSearchMessage', response.data.message || 'Erro ao carregar pedidos.', true);
        }
    }

    // Adiciona event listeners aos botões de Atualizar Status e Remover Pedido
    function addEventListenersToPedidoButtons() {
        document.querySelectorAll('.update-status-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const newStatus = e.target.parentNode.querySelector('.status-select').value;
                if (confirm(`Confirmar atualização do status do Pedido #${id} para '${newStatus}'?`)) {
                    const response = await makeApiRequest(`/pedidos/${id}`, 'PUT', { status: newStatus });
                    if (response.ok) {
                        showMessage('pedidosSearchMessage', `Status do pedido #${id} atualizado para '${newStatus}'!`, false);
                        carregarPedidos(); // Recarrega a lista
                    } else {
                        showMessage('pedidosSearchMessage', response.data.message || 'Erro ao atualizar status.', true);
                    }
                }
            });
        });

        document.querySelectorAll('.delete-pedido-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm(`Tem certeza que deseja remover o Pedido #${id}? Isso removerá os itens associados.`)) {
                    const response = await makeApiRequest(`/pedidos/${id}`, 'DELETE');
                    if (response.ok) {
                        showMessage('pedidosSearchMessage', `Pedido #${id} removido com sucesso!`, false);
                        carregarPedidos();
                    } else {
                        showMessage('pedidosSearchMessage', response.data.message || 'Erro ao remover pedido.', true);
                    }
                }
            });
        });
    }

    // Event listener para pesquisa de pedidos
    if (searchBtnPedidos) {
        searchBtnPedidos.addEventListener('click', () => {
            const searchTerm = searchInputPedidos.value.trim();
            carregarPedidos(searchTerm);
        });
    }
    if (searchInputPedidos) {
        searchInputPedidos.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtnPedidos.click();
            }
        });
    }

    // Chama a função para carregar pedidos quando a página é inicializada
    carregarPedidos();
}