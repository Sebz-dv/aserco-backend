"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.adminPool = exports.dbConfig = void 0;
exports.ensureDatabase = ensureDatabase;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
exports.dbConfig = {
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    database: env_1.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
};
exports.adminPool = promise_1.default.createPool({
    host: exports.dbConfig.host,
    port: exports.dbConfig.port,
    user: exports.dbConfig.user,
    password: exports.dbConfig.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
});
exports.pool = promise_1.default.createPool(exports.dbConfig);
async function ensureDatabase() {
    const connection = await exports.adminPool.getConnection();
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${exports.dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Base de datos lista: ${exports.dbConfig.database}`);
    }
    finally {
        connection.release();
    }
}
