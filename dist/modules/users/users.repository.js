"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.updateUserPassword = updateUserPassword;
exports.getUserRoles = getUserRoles;
exports.getUserPublicProfile = getUserPublicProfile;
const database_1 = require("../../config/database");
async function findUserByEmail(email) {
    const [rows] = (await database_1.pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]));
    return rows[0] ?? null;
}
async function findUserById(id) {
    const [rows] = (await database_1.pool.query('SELECT id, name, email, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1', [id]));
    return rows[0] ?? null;
}
async function createUser({ name, email, passwordHash }) {
    const [result] = (await database_1.pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, passwordHash]));
    return result.insertId;
}
async function updateUserPassword(id, passwordHash) {
    await database_1.pool.query('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, id]);
}
async function getUserRoles(id) {
    const [rows] = (await database_1.pool.query(`
      SELECT r.name
      FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY r.name ASC
    `, [id]));
    return rows.map((row) => row.name);
}
async function getUserPublicProfile(id) {
    const [rows] = (await database_1.pool.query('SELECT id, name, email, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1', [id]));
    return rows[0] ?? null;
}
