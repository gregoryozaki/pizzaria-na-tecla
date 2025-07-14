// frontend/public/js/products.js

import { getElement, showMessage, hideMessage, makeApiRequest, currentUser } from './utils.js';

export function setupProductCadastroPage() {
    if (!currentUser || currentUser.tipo !== 'admin') {
        alert('Acesso negado. Apenas administradores podem cadastrar produtos.');
        window.location.href = 'painel.html';
        return;
    }

    const productForm = getElement('productForm');
    const produtoMessage = getElement('produtoMessage');
    hideMessage('produtoMessage');

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = getElement('produtoNome').value;
            const descricao = getElement('produtoDescricao').value;
            const preco = parseFloat(getElement('produtoPreco').value);
            const tipo = getElement('produtoTipo').value;

            if (!nome || isNaN(preco) || preco <= 0 || !tipo) {
                showMessage('produtoMessage', 'Nome, preço (maior que zero) e tipo são obrigatórios.', true);
                return;
            }
            if (!['pizza', 'bebida', 'adicional'].includes(tipo)) {
                showMessage('produtoMessage', 'Tipo de produto inválido. Deve ser "pizza", "bebida" ou "adicional".', true);
                return;
            }

            const response = await makeApiRequest('/produtos', 'POST', { nome, descricao, preco, tipo });

            if (response.ok) {
                showMessage('produtoMessage', response.data.message);
                productForm.reset();
                setTimeout(() => window.location.href = 'produtos.html', 1500);
            } else {
                showMessage('produtoMessage', response.data.message || 'Erro ao cadastrar produto.', true);
            }
        });
    }
}

export function setupProductManagePage() {
    if (!currentUser || currentUser.tipo !== 'admin') {
        alert('Acesso negado. Apenas administradores podem gerenciar produtos.');
        window.location.href = 'painel.html';
        return;
    }

    const appContent = getElement('app-content');
    if (!appContent) {
        console.error('Elemento #app-content não encontrado na página de produtos.');
        return;
    }

    // O HTML para a página de produtos é injetado aqui para garantir que os elementos existam no DOM
    appContent.innerHTML = `
        <section class="card">
            <h2>Gerenciamento de Produtos</h2>
            <p>Cadastre, edite e controle todos os produtos disponíveis no cardápio da pizzaria.</p>
            <div style="margin-top: 1em;">
                <input type="text" id="searchInputProdutos" placeholder="Pesquisar produtos por nome..." style="width: calc(100% - 110px); display: inline-block;">
                <button id="searchBtnProdutos" style="width: 100px; margin-left: 5px;">Pesquisar</button>
            </div>
            <p id="produtosSearchMessage" style="display:none;"></p>
        </section>
        <section class="card">
            <h3>Lista de Produtos</h3>
            <div id="listaProdutos">Carregando produtos...</div>
        </section>
        <div id="editProductModal" style="display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
            <div style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px; border-radius: 10px;">
                <h2>Editar Produto</h2>
                <form id="editProductForm">
                    <input type="hidden" id="editProductId">
                    <label for="editNome">Nome:</label>
                    <input type="text" id="editNome" required>
                    <label for="editDescricao">Descrição:</label>
                    <textarea id="editDescricao"></textarea>
                    <label for="editPreco">Preço:</label>
                    <input type="number" id="editPreco" step="0.01" required>
                    <label for="editTipo">Tipo:</label>
                    <select id="editTipo">
                        <option value="pizza">Pizza</option>
                        <option value="bebida">Bebida</option>
                        <option value="adicional">Adicional</option>
                    </select>
                    <label for="editAtivo">Ativo:</label>
                    <input type="checkbox" id="editAtivo" style="width: auto; margin-left: 0;">
                    <br>
                    <button type="submit">Salvar Alterações</button>
                    <button type="button" id="closeProductModal" style="background-color: #6c757d;">Cancelar</button>
                    <p id="editProductMessage" style="display:none;"></p>
                </form>
            </div>
        </div>
    `;

    const listaProdutosDiv = getElement('listaProdutos');
    const searchInputProdutos = getElement('searchInputProdutos');
    const searchBtnProdutos = getElement('searchBtnProdutos');
    const produtosSearchMessage = getElement('produtosSearchMessage');

    const editProductModal = getElement('editProductModal');
    const editProductForm = getElement('editProductForm');
    const closeProductModalBtn = getElement('closeProductModal');
    const editProductId = getElement('editProductId');
    const editNome = getElement('editNome');
    const editDescricao = getElement('editDescricao');
    const editPreco = getElement('editPreco');
    const editTipo = getElement('editTipo');
    const editAtivo = getElement('editAtivo');
    const editProductMessage = getElement('editProductMessage');


    async function carregarProdutos(searchTerm = '') {
        listaProdutosDiv.innerHTML = 'Carregando produtos...';
        hideMessage('produtosSearchMessage');
        const response = await makeApiRequest('/produtos', 'GET');
        if (response.ok) {
            listaProdutosDiv.innerHTML = '';
            let products = response.data;

            if (searchTerm) {
                products = products.filter(p => p.Nome.toLowerCase().includes(searchTerm.toLowerCase()));
                if (products.length === 0) {
                    showMessage('produtosSearchMessage', 'Nenhum produto encontrado com este nome.', true);
                } else {
                    showMessage('produtosSearchMessage', `${products.length} produto(s) encontrado(s).`, false);
                }
            }


            if (products.length === 0 && !searchTerm) {
                listaProdutosDiv.textContent = 'Nenhum produto cadastrado.';
                return;
            }

            products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'product-item card';
                div.innerHTML = `
                    <h4>${product.Nome} (ID: ${product.ID_Produto})</h4>
                    <p>Descrição: ${product.Descricao || 'N/A'}</p>
                    <p>Preço: R$ ${parseFloat(product.Preco).toFixed(2)}</p>
                    <p>Tipo: ${product.Tipo}</p>
                    <p>Ativo: ${product.Status ? 'Sim' : 'Não'}</p>
                    <button class="edit-btn" data-id="${product.ID_Produto}" data-nome="${product.Nome}" data-descricao="${product.Descricao}" data-preco="${product.Preco}" data-tipo="${product.Tipo}" data-ativo="${product.Status}">Editar</button>
                    <button class="delete-btn" data-id="${product.ID_Produto}">Remover</button>
                `;
                listaProdutosDiv.appendChild(div);
            });
            addEventListenersToProductButtons();
        } else {
            listaProdutosDiv.textContent = response.data.message || 'Erro ao carregar produtos.';
            showMessage('produtosSearchMessage', response.data.message || 'Erro ao carregar produtos.', true);
        }
    }

    function addEventListenersToProductButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const dataset = e.target.dataset;
                editProductId.value = dataset.id;
                editNome.value = dataset.nome;
                editDescricao.value = dataset.descricao === 'N/A' ? '' : dataset.descricao;
                editPreco.value = parseFloat(dataset.preco).toFixed(2);
                editTipo.value = dataset.tipo;
                editAtivo.checked = dataset.ativo === 'true';
                
                hideMessage('editProductMessage');
                editProductModal.style.display = 'block';
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm(`Tem certeza que deseja remover o produto ID ${id}?`)) {
                    const response = await makeApiRequest(`/produtos/${id}`, 'DELETE');
                    if (response.ok) {
                        alert('Produto removido com sucesso!');
                        carregarProdutos();
                    } else {
                        alert(response.data.message || 'Erro ao remover produto. Verifique se há pedidos associados.');
                    }
                }
            });
        });
    }

    closeProductModalBtn.addEventListener('click', () => {
        editProductModal.style.display = 'none';
    });

    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editProductId.value;
        const nome = editNome.value;
        const descricao = editDescricao.value;
        const preco = parseFloat(editPreco.value);
        const tipo = editTipo.value;
        const ativo = editAtivo.checked;

        hideMessage('editProductMessage');

        if (!nome || isNaN(preco) || preco <= 0 || !tipo) {
            showMessage('editProductMessage', 'Nome, preço (positivo) e tipo são obrigatórios.', true);
            return;
        }
        if (!['pizza', 'bebida', 'adicional'].includes(tipo)) {
            showMessage('editProductMessage', 'Tipo de produto inválido. Deve ser "pizza", "bebida" ou "adicional".', true);
            return;
        }

        const response = await makeApiRequest(`/produtos/${id}`, 'PUT', { nome, descricao, preco, tipo, ativo });

        if (response.ok) {
            showMessage('editProductMessage', response.data.message);
            carregarProdutos();
            setTimeout(() => editProductModal.style.display = 'none', 1000);
        } else {
            showMessage('editProductMessage', response.data.message || 'Erro ao atualizar produto.', true);
        }
    });

    searchBtnProdutos.addEventListener('click', () => {
        const searchTerm = searchInputProdutos.value.trim();
        carregarProdutos(searchTerm);
    });
    searchInputProdutos.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtnProdutos.click();
        }
    });

    carregarProdutos();
}