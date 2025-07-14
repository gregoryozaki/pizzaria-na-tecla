// backend/src/config/db.js

const mysql = require('mysql2'); // Importa o módulo mysql2 para conexão com o banco de dados

// Configuração da conexão com o banco de dados MySQL
// As credenciais são definidas aqui. Em um ambiente de produção real,
// elas deveriam vir de variáveis de ambiente para maior segurança.
const db = mysql.createConnection({
    host: 'localhost',       // Endereço do seu servidor MySQL (geralmente localhost para desenvolvimento)
    user: 'root',            // Nome de usuário do MySQL (o padrão geralmente é 'root')
    password: '',            // Senha do usuário MySQL (vazia para muitos setups de desenvolvimento)
    database: 'projetopizzaria_db' // Nome do banco de dados que criamos no Passo 1
});

// Exporta a instância da conexão com o banco de dados
// Isso permite que outros módulos do backend usem esta conexão sem recriá-la
module.exports = db;