// backend/src/services/dbService.js

// Importa a instância de conexão com o banco de dados
const db = require('../config/db'); // Caminho relativo para db.js

/**
 * Executa uma consulta SQL no banco de dados.
 * Esta função padroniza a forma como as queries são feitas.
 * @param {string} sql - A string da consulta SQL (com placeholders '?').
 * @param {Array<any>} [params=[]] - Um array de parâmetros para a consulta.
 * @returns {Promise<any>} Uma Promise que resolve com os resultados da consulta ou rejeita com um erro.
 */
function executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        // Usa a instância 'db' para fazer a query
        db.query(sql, params, (err, results) => {
            if (err) {
                // Se houver um erro na query, rejeita a Promise com o erro
                return reject(err);
            }
            // Se a query for bem-sucedida, resolve a Promise com os resultados
            resolve(results);
        });
    });
}

/**
 * Inicia uma transação no banco de dados.
 * @returns {Promise<void>} Uma Promise que resolve quando a transação é iniciada.
 */
function beginTransaction() {
    return new Promise((resolve, reject) => {
        db.beginTransaction(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

/**
 * Commita uma transação no banco de dados.
 * @returns {Promise<void>} Uma Promise que resolve quando a transação é commitada.
 */
function commitTransaction() {
    return new Promise((resolve, reject) => {
        db.commit(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

/**
 * Faz rollback de uma transação no banco de dados.
 * @returns {Promise<void>} Uma Promise que resolve quando o rollback é concluído.
 */
function rollbackTransaction() {
    return new Promise((resolve, reject) => {
        db.rollback(() => {
            // O callback do rollback geralmente não propaga erros,
            // mas é bom ter uma estrutura de Promise para consistência.
            resolve();
        });
    });
}


// Exporta as funções para que outros módulos possam importá-las
module.exports = {
    executeQuery,
    beginTransaction,
    commitTransaction,
    rollbackTransaction
};