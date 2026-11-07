"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRolesExist = ensureRolesExist;
exports.listAvailableRoles = listAvailableRoles;
exports.createRoleRecord = createRoleRecord;
exports.createUserWithRoles = createUserWithRoles;
exports.getAllUsersForAdmin = getAllUsersForAdmin;
exports.updateUserActiveStatus = updateUserActiveStatus;
exports.setUserRoles = setUserRoles;
exports.setRolePermissions = setRolePermissions;
exports.listRolePermissionsForRole = listRolePermissionsForRole;
exports.userHasRole = userHasRole;
const database_1 = require("../../config/database");
const users_repository_1 = require("../users/users.repository");
async function ensureRolesExist(roleNames) {
    const normalizedRoles = [...new Set(roleNames.map((role) => role.trim()).filter(Boolean))];
    if (normalizedRoles.length === 0) {
        return [];
    }
    const [existingRows] = (await database_1.pool.query('SELECT name FROM roles WHERE name IN (?)', [normalizedRoles]));
    const existingSet = new Set(existingRows.map((row) => row.name));
    const missingRoles = normalizedRoles.filter((role) => !existingSet.has(role));
    for (const roleName of missingRoles) {
        await database_1.pool.query('INSERT INTO roles (name, description) VALUES (?, ?)', [roleName, `Rol personalizado: ${roleName}`]);
    }
    const [rows] = (await database_1.pool.query('SELECT name FROM roles WHERE name IN (?)', [normalizedRoles]));
    return rows.map((row) => row.name);
}
async function listAvailableRoles() {
    const [rows] = (await database_1.pool.query('SELECT id, name, description FROM roles ORDER BY name ASC'));
    return rows.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description ?? null,
    }));
}
async function createRoleRecord(name) {
    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) {
        throw new Error('El nombre del rol es obligatorio.');
    }
    const [existing] = (await database_1.pool.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [normalizedName]));
    if (existing.length > 0) {
        return { id: existing[0].id, name: normalizedName };
    }
    const [result] = (await database_1.pool.query('INSERT INTO roles (name, description) VALUES (?, ?)', [normalizedName, `Rol personalizado: ${normalizedName}`]));
    return { id: result.insertId, name: normalizedName };
}
async function createUserWithRoles({ name, email, password, roles, }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await (0, users_repository_1.findUserByEmail)(normalizedEmail);
    if (existingUser) {
        throw new Error('El correo ya está registrado.');
    }
    const userId = await (0, users_repository_1.createUser)({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: password,
    });
    await setUserRoles(userId, roles);
    return {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        roles,
        isActive: true,
    };
}
async function getAllUsersForAdmin() {
    const [rows] = (await database_1.pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.is_active,
        COALESCE(GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ', '), '') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      GROUP BY u.id, u.name, u.email, u.is_active
      ORDER BY u.id ASC
    `));
    return rows.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: Boolean(user.is_active),
        roles: user.roles ? user.roles.split(', ').filter(Boolean) : [],
    }));
}
async function updateUserActiveStatus(userId, isActive) {
    const [result] = (await database_1.pool.query('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [isActive ? 1 : 0, userId]));
    return result.affectedRows > 0;
}
async function setUserRoles(userId, roles) {
    const normalizedRoles = [...new Set(roles.map((role) => role.trim()).filter(Boolean))];
    if (normalizedRoles.length === 0) {
        return true;
    }
    const availableRoles = await ensureRolesExist(normalizedRoles);
    const [existingRoles] = (await database_1.pool.query('SELECT id, name FROM roles WHERE name IN (?)', [availableRoles]));
    const roleIds = existingRoles.map((role) => role.id);
    if (roleIds.length === 0) {
        return false;
    }
    await database_1.pool.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);
    const values = roleIds.map(() => '(?, ?)').join(', ');
    const params = roleIds.flatMap((roleId) => [userId, roleId]);
    if (values) {
        await database_1.pool.query(`INSERT INTO user_roles (user_id, role_id) VALUES ${values}`, params);
    }
    return true;
}
async function setRolePermissions(roleName, permissions) {
    const normalizedRoleName = roleName.trim().toLowerCase();
    const normalizedPermissions = [...new Set((permissions || []).map((permission) => String(permission).trim()).filter(Boolean))];
    if (!normalizedRoleName) {
        return false;
    }
    const [[existingRole]] = (await database_1.pool.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [normalizedRoleName]));
    const role = existingRole ?? (await createRoleRecord(normalizedRoleName));
    if (normalizedPermissions.length === 0) {
        await database_1.pool.query('DELETE FROM role_permissions WHERE role_id = ?', [role.id]);
        return true;
    }
    const [existingPermissions] = (await database_1.pool.query('SELECT id, name FROM permissions WHERE name IN (?)', [normalizedPermissions]));
    const permissionIds = existingPermissions.map((permission) => permission.id);
    await database_1.pool.query('DELETE FROM role_permissions WHERE role_id = ?', [role.id]);
    if (permissionIds.length === 0) {
        return true;
    }
    const values = permissionIds.map(() => '(?, ?)').join(', ');
    const params = permissionIds.flatMap((permissionId) => [role.id, permissionId]);
    if (values) {
        await database_1.pool.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`, params);
    }
    return true;
}
async function listRolePermissionsForRole(roleName) {
    const normalizedRoleName = roleName.trim().toLowerCase();
    if (!normalizedRoleName) {
        return [];
    }
    const [[role]] = (await database_1.pool.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [normalizedRoleName]));
    if (!role) {
        return [];
    }
    const [rows] = (await database_1.pool.query(`
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      ORDER BY p.name ASC
    `, [role.id]));
    return rows.map((row) => row.name);
}
async function userHasRole(userId, roleName) {
    const [rows] = (await database_1.pool.query(`
      SELECT ur.user_id
      FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ? AND r.name = ?
      LIMIT 1
    `, [userId, roleName]));
    return rows.length > 0;
}
