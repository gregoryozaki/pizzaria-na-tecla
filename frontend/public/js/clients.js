// frontend/public/js/clients.js

import { getElement, showMessage, hideMessage, makeApiRequest, currentUser } from './utils.js';

/**
 * Inicializa a lógica da página de Gerenciamento de Clientes (clientes.html).
 */
export function setupClientManagePage() {
    // Verifica permissão (qualquer usuário logado pode acessar)
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const appContent = getElement('app-content');
    if (!appContent) {
        console.error('Elemento #app-content não encontrado na página de clientes.');
        return;
    }

    // Injeta o HTML necessário para o gerenciamento de clientes na main da página.
    // Este HTML corresponde ao que estava no seu clientes.html original, mas agora é injetado dinamicamente.
    appContent.innerHTML = `
        <section class="card">
            <h2>Gerenciamento de Clientes</h2>
            <p>Cadastre e consulte os clientes de forma prática e eficiente para facilitar pedidos e entregas.</p>
            <div style="margin-top: 1em;">
                <input type="text" id="searchInputClientes" placeholder="Pesquisar clientes por nome/telefone..." style="width: calc(100% - 110px); display: inline-block;">
                <button id="searchBtnClientes" style="width: 100px; margin-left: 5px;">Pesquisar</button>
            </div>
            <p id="clientesSearchMessage" style="display:none;"></p>
        </section>
        <section class="card">
            <h3>Cadastrar Novo Cliente</h3>
            <form id="clienteForm">
                <label for="clienteNome">Nome:</label>
                <input type="text" id="clienteNome" required>
                <label for="clienteTelefone">Telefone:</label>
                <input type="text" id="clienteTelefone" required>
                <label for="clienteEndereco">Endereço:</label>
                <textarea id="clienteEndereco" required></textarea>
                <label for="clienteEmail">E-mail (opcional):</label>
                <input type="email" id="clienteEmail">
                <button type="submit">Cadastrar Cliente</button>
                <p id="clienteMessage" style="display:none;"></p>
            </form>
        </section>
        <section class="card">
            <h3>Lista de Clientes</h3>
            <div id="listaClientes">Carregando clientes...</div>
        </section>
         <div id="editClientModal" style="display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
            <div style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px; border-radius: 10px;">
                <h2>Editar Cliente</h2>
                <form id="editClientForm">
                    <input type="hidden" id="editClientId">
                    <label for="editClientNome">Nome:</label>
                    <input type="text" id="editClientNome" required>
                    <label for="editClientTelefone">Telefone:</label>
                    <input type="text" id="editClientTelefone" required>
                    <label for="editClientEndereco">Endereço:</label>
                    <textarea id="editClientEndereco" required></textarea>
                    <label for="editClientEmail">E-mail (opcional):</label>
                    <input type="email" id="editClientEmail">
                    <br>
                    <button type="submit">Salvar Alterações</button>
                    <button type="button" id="closeClientModal" style="background-color: #6c757d;">Cancelar</button>
                    <p id="editClientMessage" style="display:none;"></p>
                </form>
            </div>
        </div>
    `;

    // Referências aos elementos do DOM
    const clienteForm = getElement('clienteForm');
    const clienteMessage = getElement('clienteMessage');
    const listaClientesDiv = getElement('listaClientes');
    const searchInputClientes = getElement('searchInputClientes');
    const searchBtnClientes = getElement('searchBtnClientes');
    const clientesSearchMessage = getElement('clientesSearchMessage');

    const editClientModal = getElement('editClientModal');
    const editClientForm = getElement('editClientForm');
    const closeClientModalBtn = getElement('closeClientModal');
    const editClientId = getElement('editClientId');
    const editClientNome = getElement('editClientNome');
    const editClientTelefone = getElement('editClientTelefone');
    const editClientEndereco = getElement('editClientEndereco');
    const editClientEmail = getElement('editClientEmail');
    const editClientMessage = getElement('editClientMessage');

    hideMessage('clienteMessage');
    hideMessage('clientesSearchMessage');
    hideMessage('editClientMessage');

    // Event Listener para o formulário de Cadastro de Cliente
    if (clienteForm) {
        clienteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = getElement('clienteNome').value;
            const telefone = getElement('clienteTelefone').value;
            const endereco = getElement('clienteEndereco').value;
            const email = getElement('clienteEmail').value;

            if (!nome || !telefone || !endereco) {
                showMessage('clienteMessage', 'Nome, telefone e endereço são obrigatórios.', true);
                return;
            }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage('clienteMessage', 'Por favor, insira um e-mail válido (opcional, mas se preenchido, deve ser válido).', true);
                return;
            }

            const response = await makeApiRequest('/clientes', 'POST', { nome, telefone, endereco, email });
            if (response.ok) {
                showMessage('clienteMessage', response.data.message);
                clienteForm.reset();
                carregarClientes(); // Recarrega a lista de clientes
            } else {
                showMessage('clienteMessage', response.data.message || 'Erro ao cadastrar cliente.', true);
            }
        });
    }

    // Função para carregar e exibir a lista de clientes
    async function carregarClientes(searchTerm = '') {
        listaClientesDiv.innerHTML = 'Carregando clientes...';
        hideMessage('clientesSearchMessage');
        const response = await makeApiRequest('/clientes', 'GET'); // Requisição GET para clientes
        if (response.ok) {
            listaClientesDiv.innerHTML = '';
            let clients = response.data; // Dados vêm com nomes de colunas do DB

            if (searchTerm) {
                clients = clients.filter(c =>
                    c.Nome.toLowerCase().includes(searchTerm.toLowerCase()) || // Use c.Nome
                    c.Telefone.includes(searchTerm) // Use c.Telefone
                );
                if (clients.length === 0) {
                    showMessage('clientesSearchMessage', 'Nenhum cliente encontrado com estes critérios.', true);
                } else {
                    showMessage('clientesSearchMessage', `${clients.length} cliente(s) encontrado(s).`, false);
                }
            }

            if (clients.length === 0 && !searchTerm) {
                listaClientesDiv.textContent = 'Nenhum cliente cadastrado.';
                return;
            }

            clients.forEach(client => {
                const div = document.createElement('div');
                div.className = 'client-item card';
                div.innerHTML = `
                    <h4>${client.Nome} (ID: ${client.ID_Cliente})</h4>
                    <p>Telefone: ${client.Telefone}</p>
                    <p>Endereço: ${client.Endereco}</p>
                    <p>E-mail: ${client.Email || 'N/A'}</p>
                    <button class="edit-client-btn" data-id="${client.ID_Cliente}" data-nome="${client.Nome}" data-telefone="${client.Telefone}" data-endereco="${client.Endereco}" data-email="${client.Email || ''}">Editar</button>
                    <button class="delete-client-btn" data-id="${client.ID_Cliente}">Remover</button>
                `;
                listaClientesDiv.appendChild(div);
            });
            addEventListenersToClientButtons(); // Adiciona listeners aos botões após a renderização
        } else {
            listaClientesDiv.textContent = response.data.message || 'Erro ao carregar clientes.';
            showMessage('clientesSearchMessage', response.data.message || 'Erro ao carregar clientes.', true);
        }
    }

    // Adiciona event listeners aos botões de Editar e Remover Cliente
    function addEventListenersToClientButtons() {
        document.querySelectorAll('.edit-client-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const dataset = e.target.dataset;
                editClientId.value = dataset.id;
                editClientNome.value = dataset.nome;
                editClientTelefone.value = dataset.telefone;
                editClientEndereco.value = dataset.endereco;
                editClientEmail.value = dataset.email === 'N/A' ? '' : dataset.email; // Trata 'N/A' para campo vazio

                hideMessage('editClientMessage');
                editClientModal.style.display = 'block';
            });
        });

        document.querySelectorAll('.delete-client-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm(`Tem certeza que deseja remover o cliente ID ${id}? Isso pode falhar se houver pedidos associados.`)) {
                    const response = await makeApiRequest(`/clientes/${id}`, 'DELETE');
                    if (response.ok) {
                        alert('Cliente removido com sucesso!');
                        carregarClientes(); // Recarrega a lista
                    } else {
                        alert(response.data.message || 'Erro ao remover cliente.');
                    }
                }
            });
        });
    }

    // Event listeners para o modal de edição de cliente
    if (closeClientModalBtn) {
        closeClientModalBtn.addEventListener('click', () => {
            editClientModal.style.display = 'none';
        });
    }

    if (editClientForm) {
        editClientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = editClientId.value;
            const nome = editClientNome.value;
            const telefone = editClientTelefone.value;
            const endereco = editClientEndereco.value;
            const email = editClientEmail.value;

            hideMessage('editClientMessage');

            if (!nome || !telefone || !endereco) {
                showMessage('editClientMessage', 'Nome, telefone e endereço são obrigatórios.', true);
                return;
            }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage('editClientMessage', 'Por favor, insira um e-mail válido (opcional, mas se preenchido, deve ser válido).', true);
                return;
            }

            const response = await makeApiRequest(`/clientes/${id}`, 'PUT', { nome, telefone, endereco, email });

            if (response.ok) {
                showMessage('editClientMessage', response.data.message);
                carregarClientes();
                setTimeout(() => editClientModal.style.display = 'none', 1000);
            } else {
                showMessage('editClientMessage', response.data.message || 'Erro ao atualizar cliente.', true);
            }
        });
    }

    // Event listener para pesquisa de clientes
    if (searchBtnClientes) {
        searchBtnClientes.addEventListener('click', () => {
            const searchTerm = searchInputClientes.value.trim();
            carregarClientes(searchTerm);
        });
    }
    if (searchInputClientes) {
        searchInputClientes.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtnClientes.click();
            }
        });
    }

    // Chama a função para carregar clientes quando a página é inicializada
    carregarClientes();
}