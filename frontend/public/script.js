// frontend/public/script.js

import {
    currentSessionId,
    currentUser,
    getElement,
    makeApiRequest,
    updateSession
} from './js/utils.js';

import {
    setupLoginPage,
    setupUserCadastroPage,
    setupUpdatePasswordPage
} from './js/auth.js';

import {
    setupProductCadastroPage,
    setupProductManagePage
}
 from './js/products.js';

import {
    setupClientManagePage
} from './js/clients.js';

import {
    setupOrderManagePage // <-- NOVO: Importa a função de setup de pedidos
} from './js/orders.js';

import {
    setupReportsPage
} from './js/reports.js';

import {
    setupUserManagePage
} from './js/users.js';


function updateNavbar() {
    const nav = getElement('main-nav');
    if (!nav) return;

    nav.innerHTML = '';

    const createNavLink = (href, text, id = null) => {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        if (id) a.id = id;
        return a;
    };

    if (document.body.id === 'home-page-public' && currentUser) {
        window.location.href = 'painel.html';
        return;
    }

    nav.appendChild(createNavLink('index.html', 'Início'));

    if (currentUser) {
        nav.appendChild(createNavLink('painel.html', 'Painel'));
        nav.appendChild(createNavLink('pedidos.html', 'Pedidos', 'navPedidos'));
        nav.appendChild(createNavLink('clientes.html', 'Clientes', 'navClientes'));

        if (currentUser.tipo === 'admin') {
            nav.appendChild(createNavLink('produtos.html', 'Produtos', 'navProdutos'));
            nav.appendChild(createNavLink('relatorios.html', 'Relatórios', 'navRelatorios'));
            nav.appendChild(createNavLink('inserir_usuario.html', 'Novo Usuário', 'navNovoUsuario'));
            nav.appendChild(createNavLink('inserir_produto.html', 'Novo Produto', 'navNovoProduto'));
            nav.appendChild(createNavLink('gerenciar_usuarios.html', 'Gerenciar Usuários', 'navGerenciarUsuarios'));
        }

        const logoutLink = createNavLink('#', 'Sair', 'navLogout');
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const response = await makeApiRequest('/usuarios/logout', 'POST');
            if (response.ok) {
                updateSession(null, null);
                alert('Você foi desconectado com sucesso!');
                window.location.href = 'login.html';
            } else {
                alert(response.data.message || 'Erro ao desconectar. Tente novamente.');
            }
        });
        nav.appendChild(logoutLink);

    } else {
        const publicAuthPages = ['login-page', 'cadastro-usuario-page', 'atualizar-senha-page', 'home-page-public'];

        if (!publicAuthPages.includes(document.body.id)) {
            window.location.href = 'login.html';
            return;
        }

        if (document.body.id !== 'home-page-public') {
            nav.appendChild(createNavLink('login.html', 'Login', 'navLogin'));
            nav.appendChild(createNavLink('inserir_usuario.html', 'Cadastre-se', 'navCadastro'));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    switch (document.body.id) {
        case 'login-page':
            setupLoginPage();
            break;
        case 'cadastro-usuario-page':
            setupUserCadastroPage();
            break;
        case 'atualizar-senha-page':
            setupUpdatePasswordPage();
            break;
        case 'painel-page':
            if (!currentUser) {
                window.location.href = 'login.html';
                return;
            }
            const welcomeUserElement = getElement('welcomeUserName');
            const userTypeElement = getElement('userType');
            if (welcomeUserElement) welcomeUserElement.textContent = currentUser.userName;
            if (userTypeElement) userTypeElement.textContent = currentUser.tipo;
            break;
        case 'gerenciar-usuarios-page':
            setupUserManagePage();
            break;
        case 'cadastro-produto-page':
            setupProductCadastroPage();
            break;
        case 'produtos-page':
            setupProductManagePage();
            break;
        case 'clientes-page':
            setupClientManagePage();
            break;
        case 'pedidos-page': // <-- NOVO: Chama a função de setup de pedidos
            setupOrderManagePage();
            break;
        case 'relatorios-page':
            setupReportsPage();
            break;
    }
});