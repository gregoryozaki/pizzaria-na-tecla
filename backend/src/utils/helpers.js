// backend/src/utils/helpers.js

/**
 * Simulação de hash de senha.
 * ATENÇÃO: PARA PROJETOS REAIS/PRODUÇÃO, USE BIBLIOTECAS COMO 'bcryptjs' ou 'argon2'.
 * Esta implementação é apenas para fins de demonstração acadêmica e NÃO É SEGURA.
 * @param {string} password - A senha em texto claro.
 * @returns {string} A senha "hashada" simuladamente.
 */
function hashPassword(password) {
    // Em produção: usar await bcrypt.hash(password, saltRounds);
    return password + '_simulated_hashed';
}

/**
 * Simulação de verificação de senha.
 * ATENÇÃO: PARA PROJETOS REAIS/PRODUÇÃO, USE BIBLIOTECAS COMO 'bcryptjs' ou 'argon2'.
 * Esta implementação é apenas para fins de demonstração acadêmica e NÃO É SEGURA.
 * @param {string} password - A senha em texto claro fornecida pelo usuário.
 * @param {string} hashedPassword - A senha "hashada" armazenada no banco de dados.
 * @returns {boolean} True se as senhas "correspondem" na simulação, caso contrário, false.
 */
function verifyPassword(password, hashedPassword) {
    // Em produção: usar await bcrypt.compare(password, hashedPassword);
    return (password + '_simulated_hashed') === hashedPassword;
}

// Exporta as funções para que outros módulos possam importá-las
module.exports = {
    hashPassword,
    verifyPassword
};