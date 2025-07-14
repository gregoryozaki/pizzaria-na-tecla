// frontend/public/js/auth.js

// Importa as funções e variáveis necessárias do módulo utils.js
import {
    getElement,
    showMessage,
    hideMessage,
    makeApiRequest,
    updateSession,
    currentUser // Importa currentUser para verificar autenticação
} from './utils.js'; // Caminho relativo para utils.js

/**
 * Inicializa a lógica da página de Login (login.html).
 * Lida com o envio do formulário de login.
 */
export function setupLoginPage() {
    // Redireciona para o painel se o usuário já estiver logado
    if (currentUser) {
        window.location.href = 'painel.html';
        return;
    }

    const loginForm = getElement('loginForm');
    const loginMessage = getElement('loginMessage');
    hideMessage('loginMessage'); // Oculta a mensagem inicial

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Previne o recarregamento da página

            const email = getElement('loginEmail').value;
            const senha = getElement('loginSenha').value;

            // Validação básica de campos
            if (!email || !senha) {
                showMessage('loginMessage', 'Por favor, preencha todos os campos.', true);
                return;
            }

            // Faz a requisição à API de login no backend
            const response = await makeApiRequest('/usuarios/login', 'POST', { email, senha });

            if (response.ok) {
                // Login bem-sucedido: atualiza a sessão e redireciona
                showMessage('loginMessage', response.data.message);
                updateSession(response.data.sessionId, response.data.user); // Armazena sessão e user
                window.location.href = 'painel.html'; // Redireciona para o painel
            } else {
                // Login falhou: exibe mensagem de erro
                showMessage('loginMessage', response.data.message || 'Erro no login. Verifique suas credenciais.', true);
            }
        });
    }
}

/**
 * Inicializa a lógica da página de Cadastro de Usuário (inserir_usuario.html).
 * Lida com o envio do formulário de cadastro.
 */
export function setupUserCadastroPage() {
    const userForm = getElement('userForm');
    const cadastroMessage = getElement('cadastroMessage');
    hideMessage('cadastroMessage'); // Oculta a mensagem inicial

    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Previne o recarregamento da página

            const nome = getElement('cadastroNome').value;
            const email = getElement('cadastroEmail').value;
            const senha = getElement('cadastroSenha').value;
            const tipo = getElement('cadastroTipo').value;

            // Validações detalhadas dos campos
            if (!nome || !email || !senha || !tipo) {
                showMessage('cadastroMessage', 'Por favor, preencha todos os campos.', true);
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage('cadastroMessage', 'Por favor, insira um e-mail válido.', true);
                return;
            }
            if (senha.length < 6) {
                showMessage('cadastroMessage', 'A senha deve ter pelo menos 6 caracteres.', true);
                return;
            }

            // Faz a requisição à API de registro no backend
            const response = await makeApiRequest('/usuarios/register', 'POST', { nome, email, senha, tipo });

            if (response.ok) {
                showMessage('cadastroMessage', response.data.message);
                userForm.reset(); // Limpa o formulário após sucesso
                // Opcional: Redirecionar para login após sucesso no cadastro
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                showMessage('cadastroMessage', response.data.message || 'Erro ao cadastrar usuário.', true);
            }
        });
    }
}

/**
 * Inicializa a lógica da página de Atualização de Senha (atualizar_senha.html).
 * Esta função deve ser chamada pelo script.js principal.
 */
export function setupUpdatePasswordPage() {
    const passForm = getElement('passForm');
    const updatePassMessage = getElement('updatePassMessage');
    hideMessage('updatePassMessage');

    if (passForm) {
        passForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = getElement('updateEmail').value;
            const senha = getElement('updateSenha').value;

            if (!email || !senha || senha.length < 6) {
                showMessage('updatePassMessage', 'E-mail e senha (mínimo 6 caracteres) são obrigatórios.', true);
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage('updatePassMessage', 'Por favor, insira um e-mail válido.', true);
                return;
            }

            const response = await makeApiRequest('/usuarios/atualizar-senha', 'POST', { email, senha });

            if (response.ok) {
                showMessage('updatePassMessage', response.data.message);
                passForm.reset();
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                showMessage('updatePassMessage', response.data.message || 'Erro ao atualizar senha.', true);
            }
        });
    }
}