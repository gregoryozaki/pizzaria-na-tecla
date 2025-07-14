-- 1. Criar o banco de dados
CREATE DATABASE IF NOT EXISTS projetopizzaria_db;

-- Usar o banco de dados recém-criado
USE projetopizzaria_db;

-- 2. Tabela Usuario
-- Observação: 'Senha' no modelo ER provavelmente se refere ao hash da senha.
-- 'Tipo' é um ENUM para restringir a 'admin' ou 'atendente'.
CREATE TABLE Usuario (
    ID_Usuario INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL, -- Login no modelo ER, mas email é mais comum para login.
    Senha VARCHAR(255) NOT NULL, -- Armazenará o hash da senha
    Tipo ENUM('admin', 'atendente') NOT NULL,
    Data_Criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela Produto
-- 'Status' no modelo ER para Produto pode ser 'ativo'/'inativo'.
CREATE TABLE Produto (
    ID_Produto INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Descricao TEXT,
    Preco DECIMAL(10, 2) NOT NULL,
    Tipo ENUM('pizza', 'bebida', 'adicional') NOT NULL, -- Exemplo: pizza, bebida, adicional
    Status BOOLEAN DEFAULT TRUE -- Usado para indicar se o produto está ativo/disponível
);

-- 4. Tabela Cliente
CREATE TABLE Cliente (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Telefone VARCHAR(20) UNIQUE NOT NULL, -- Telefone como UNIQUE para evitar duplicação
    Endereco TEXT NOT NULL,
    Email VARCHAR(255) UNIQUE -- E-mail é opcional, mas se informado, deve ser único
);

-- 5. Tabela Pedido
-- O atributo 'Tipo' do Pedido no MER parece ser o status do pedido ('preparando', 'a caminho', 'entregue')
CREATE TABLE Pedido (
    ID_Pedido INT AUTO_INCREMENT PRIMARY KEY,
    ID_Cliente INT NOT NULL,
    Data_Hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('preparando', 'a caminho', 'entregue', 'cancelado') DEFAULT 'preparando', -- Ajustado para refletir 'Tipo' do MER como Status
    FOREIGN KEY (ID_Cliente) REFERENCES Cliente(ID_Cliente)
);

-- 6. Tabela Item_Pedido (associativa entre Pedido e Produto)
-- 'Valor_Unitario' aqui representa o preço do produto no momento do pedido.
CREATE TABLE Item_Pedido (
    ID_Item_Pedido INT AUTO_INCREMENT PRIMARY KEY,
    ID_Pedido INT NOT NULL,
    ID_Produto INT NOT NULL,
    Quantidade INT NOT NULL,
    Valor_Unitario DECIMAL(10, 2) NOT NULL, -- Preço do produto no momento da compra
    Personalizacoes TEXT, -- Atributo 'Personalizacoes' do MER
    FOREIGN KEY (ID_Pedido) REFERENCES Pedido(ID_Pedido) ON DELETE CASCADE, -- Se um Pedido é deletado, seus Itens_Pedido também são.
    FOREIGN KEY (ID_Produto) REFERENCES Produto(ID_Produto)
);

-- 7. Tabela Entrega
CREATE TABLE Entrega (
    ID_Entrega INT AUTO_INCREMENT PRIMARY KEY,
    ID_Pedido INT UNIQUE NOT NULL, -- Uma entrega para um pedido, um pedido tem uma entrega
    Tempo_Estimado TIME, -- ou INT para minutos, dependendo da granularidade
    Endereco_Entrega TEXT NOT NULL,
    Data_Hora_Inicio DATETIME,
    Data_Hora_Conclusao DATETIME,
    Status ENUM('pendente', 'em_rota', 'entregue', 'atrasado', 'cancelado') DEFAULT 'pendente', -- Status da entrega
    FOREIGN KEY (ID_Pedido) REFERENCES Pedido(ID_Pedido)
);

-- 8. Tabela Relatorio
CREATE TABLE Relatorio (
    ID_Relatorio INT AUTO_INCREMENT PRIMARY KEY,
    ID_Usuario INT NOT NULL, -- Usuário que gerou o relatório
    Data_Geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    Tipo VARCHAR(100) NOT NULL, -- Ex: 'Vendas Diárias', 'Produtos Mais Vendidos'
    Periodo_Inicio DATE,
    Periodo_Fim DATE,
    Dados JSON, -- Para armazenar os dados do relatório em formato JSON, se complexo
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario)
);
