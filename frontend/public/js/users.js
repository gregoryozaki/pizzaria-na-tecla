// frontend/public/js/users.js

import { getElement, showMessage, hideMessage, makeApiRequest, currentUser } from './utils.js';

/**
 * Inicializa a lógica da página de Gerenciamento de Usuários (gerenciar_usuarios.html).
 */
export function setupUserManagePage() {
    // Verifica permissão (apenas admin pode acessar esta página)
    if (!currentUser || currentUser.tipo !== 'admin') {
        alert('Acesso negado. Apenas administradores podem gerenciar usuários.');
        window.location.href = 'painel.html';
        return;
    }

    const appContent = getElement('app-content');
    if (!appContent) {
        console.error('Elemento #app-content não encontrado na página de gerenciamento de usuários.');
        return;
    }

    // Injeta o HTML necessário para o gerenciamento de usuários.
    appContent.innerHTML = `
        <section class="card">
            <h2>Gerenciamento de Usuários</h2>
            <p>Visualize, edite e remova usuários do sistema.</p>
            <div style="margin-top: 1em;">
                <input type="text" id="searchInputUsuarios" placeholder="Pesquisar usuários por nome ou e-mail..." style="width: calc(100% - 110px); display: inline-block;">
                <button id="searchBtnUsuarios" style="width: 100px; margin-left: 5px;">Pesquisar</button>
            </div>
            <p id="usuariosSearchMessage" style="display:none;"></p>
        </section>
        <section class="card">
            <h3>Lista de Usuários</h3>
            <div id="listaUsuarios">Carregando usuários...</div>
        </section>
        <div id="editUserModal" style="display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
            <div style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px; border-radius: 10px;">
                <h2>Editar Usuário</h2>
                <form id="editUserForm">
                    <input type="hidden" id="editUserId">
                    <label for="editUserName">Nome:</label>
                    <input type="text" id="editUserName" required>
                    <label for="editUserEmail">E-mail:</label>
                    <input type="email" id="editUserEmail" required>
                    <label for="editUserType">Tipo:</label>
                    <select id="editUserType">
                        <option value="atendente">Atendente</option>
                        <option value="admin">Admin</option>
                    </select>
                    <br>
                    <button type="submit">Salvar Alterações</button>
                    <button type="button" id="closeUserModal" style="background-color: #6c757d;">Cancelar</button>
                    <p id="editUserMessage" style="display:none;"></p>
                </form>
            </div>
        </div>
    `;

    // Referências aos elementos do DOM
    const listaUsuariosDiv = getElement('listaUsuarios');
    const searchInputUsuarios = getElement('searchInputUsuarios');
    const searchBtnUsuarios = getElement('searchBtnUsuarios');
    const usuariosSearchMessage = getElement('usuariosSearchMessage');

    const editUserModal = getElement('editUserModal');
    const editUserForm = getElement('editUserForm');
    const closeUserModalBtn = getElement('closeUserModal');
    const editUserId = getElement('editUserId');
    const editUserName = getElement('editUserName');
    const editUserEmail = getElement('editUserEmail');
    const editUserType = getElement('editUserType');
    const editUserMessage = getElement('editUserMessage');

    hideMessage('usuariosSearchMessage');
    hideMessage('editUserMessage');

    // Função para carregar e exibir a lista de usuários
    async function carregarUsuarios(searchTerm = '') {
        listaUsuariosDiv.innerHTML = 'Carregando usuários...';
        hideMessage('usuariosSearchMessage');
        const response = await makeApiRequest('/usuarios', 'GET'); // Requisição GET para usuários
        if (response.ok) {
            listaUsuariosDiv.innerHTML = '';
            let users = response.data; // Dados vêm com nomes de colunas do DB

            if (searchTerm) {
                users = users.filter(u =>
                    u.Nome.toLowerCase().includes(searchTerm.toLowerCase()) || // Use u.Nome
                    u.Email.toLowerCase().includes(searchTerm.toLowerCase()) // Use u.Email
                );
                if (users.length === 0) {
                    showMessage('usuariosSearchMessage', 'Nenhum usuário encontrado com estes critérios.', true);
                } else {
                    showMessage('usuariosSearchMessage', `${users.length} usuário(s) encontrado(s).`, false);
                }
            }

            if (users.length === 0 && !searchTerm) {
                listaUsuariosDiv.textContent = 'Nenhum usuário cadastrado.';
                return;
            }

            users.forEach(user => {
                const div = document.createElement('div');
                div.className = 'user-item card';
                div.innerHTML = `
                    <h4>${user.Nome} (ID: ${user.ID_Usuario})</h4>
                    <p>E-mail: ${user.Email}</p>
                    <p>Tipo: ${user.Tipo}</p>
                    <p>Data Criação: ${new Date(user.Data_Criacao).toLocaleDateString()}</p>
                    <button class="edit-user-btn" data-id="${user.ID_Usuario}" data-nome="${user.Nome}" data-email="${user.Email}" data-tipo="${user.Tipo}">Editar</button>
                    <button class="delete-user-btn" data-id="${user.ID_Usuario}">Remover</button>
                `;
                listaUsuariosDiv.appendChild(div);
            });
            addEventListenersToUserButtons(); // Adiciona listeners aos botões após a renderização
        } else {
            listaUsuariosDiv.textContent = response.data.message || 'Erro ao carregar usuários.';
            showMessage('usuariosSearchMessage', response.data.message || 'Erro ao carregar usuários.', true);
        }
    }

    // Adiciona event listeners aos botões de Editar e Remover Usuário
    function addEventListenersToUserButtons() {
        document.querySelectorAll('.edit-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const dataset = e.target.dataset;
                editUserId.value = dataset.id;
                editUserName.value = dataset.nome;
                editUserEmail.value = dataset.email;
                editUserType.value = dataset.tipo;

                hideMessage('editUserMessage');
                editUserModal.style.display = 'block';
            });
        });

        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                // Prevenção simples: Não permite que um admin logado se delete.
                // Em um sistema real, seria necessário um admin mestre ou outra forma de recuperação.
                if (parseInt(id) === currentUser.userId) {
                    alert('Você não pode deletar sua própria conta de administrador logada.');
                    return;
                }

                if (confirm(`Tem certeza que deseja remover o usuário ID ${id}?`)) {
                    const response = await makeApiRequest(`/usuarios/${id}`, 'DELETE');
                    if (response.ok) {
                        alert('Usuário removido com sucesso!');
                        carregarUsuarios(); // Recarrega a lista
                    } else {
                        alert(response.data.message || 'Erro ao remover usuário.');
                    }
                }
            });
        });
    }

    // Event listeners para o modal de edição de usuário
    if (closeUserModalBtn) {
        closeUserModalBtn.addEventListener('click', () => {
            editUserModal.style.display = 'none';
        });
    }

    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = editUserId.value;
            const nome = editUserName.value;
            const email = editUserEmail.value;
            const tipo = editUserType.value;

            hideMessage('editUserMessage');

            if (!nome || !email || !tipo) {
                showMessage('editUserMessage', 'Nome, e-mail e tipo são obrigatórios.', true);
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage('editUserMessage', 'Por favor, insira um e-mail válido.', true);
                return;
            }

            const response = await makeApiRequest(`/usuarios/${id}`, 'PUT', { nome, email, tipo });

            if (response.ok) {
                showMessage('editUserMessage', response.data.message);
                carregarUsuarios();
                setTimeout(() => editUserModal.style.display = 'none', 1000);
            } else {
                showMessage('editUserMessage', response.data.message || 'Erro ao atualizar usuário.', true);
            }
        });
    }

    // Event listener para pesquisa de usuários
    if (searchBtnUsuarios) {
        searchBtnUsuarios.addEventListener('click', () => {
            const searchTerm = searchInputUsuarios.value.trim();
            carregarUsuarios(searchTerm);
        });
    }
    if (searchInputUsuarios) {
        searchInputUsuarios.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtnUsuarios.click();
            }
        });
    }

    // Chama a função para carregar usuários quando a página é inicializada
    carregarUsuarios();
}