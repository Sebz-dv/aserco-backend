"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModules = listModules;
exports.createModule = createModule;
exports.listPermissions = listPermissions;
exports.createPermission = createPermission;
exports.getRolePermissions = getRolePermissions;
exports.getUserDashboards = getUserDashboards;
exports.getUserPermissions = getUserPermissions;
exports.userHasPermission = userHasPermission;
const database_1 = require("../../config/database");
async function listModules() {
    const [rows] = (await database_1.pool.query('SELECT id, name, code, description FROM modules ORDER BY name ASC'));
    return rows.map((module) => ({
        id: module.id,
        name: module.name,
        code: module.code,
        description: module.description ?? null,
    }));
}
async function createModule({ name, code, description }) {
    const normalizedName = String(name ?? '').trim();
    const normalizedCode = String(code ?? '').trim().toLowerCase();
    if (!normalizedName || !normalizedCode) {
        throw new Error('El nombre y el código del módulo son obligatorios.');
    }
    const [existing] = (await database_1.pool.query('SELECT id FROM modules WHERE code = ? LIMIT 1', [normalizedCode]));
    if (existing.length > 0) {
        return {
            id: existing[0].id,
            name: normalizedName,
            code: normalizedCode,
            description: description ?? null,
        };
    }
    const [result] = (await database_1.pool.query('INSERT INTO modules (name, code, description) VALUES (?, ?, ?)', [normalizedName, normalizedCode, description ?? null]));
    return {
        id: result.insertId,
        name: normalizedName,
        code: normalizedCode,
        description: description ?? null,
    };
}
async function listPermissions() {
    const [rows] = (await database_1.pool.query(`
      SELECT p.id, p.name, p.description, p.module_id AS moduleId, m.name AS moduleName, m.code AS moduleCode
      FROM permissions p
      LEFT JOIN modules m ON m.id = p.module_id
      ORDER BY p.name ASC
    `));
    return rows.map((permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description ?? null,
        moduleId: permission.moduleId ?? null,
        moduleName: permission.moduleName ?? null,
        moduleCode: permission.moduleCode ?? null,
    }));
}
async function createPermission({ moduleId, name, description }) {
    const normalizedName = String(name ?? '').trim();
    const normalizedModuleId = Number(moduleId);
    if (!normalizedName) {
        throw new Error('El código del permiso es obligatorio.');
    }
    if (!Number.isFinite(normalizedModuleId)) {
        throw new Error('Debe seleccionar un módulo válido.');
    }
    const [moduleRows] = (await database_1.pool.query('SELECT id FROM modules WHERE id = ? LIMIT 1', [normalizedModuleId]));
    if (moduleRows.length === 0) {
        throw new Error('El módulo seleccionado no existe.');
    }
    const [existing] = (await database_1.pool.query('SELECT id FROM permissions WHERE name = ? LIMIT 1', [normalizedName]));
    if (existing.length > 0) {
        return {
            id: existing[0].id,
            name: normalizedName,
            description: description ?? null,
            moduleId: normalizedModuleId,
        };
    }
    const [result] = (await database_1.pool.query('INSERT INTO permissions (module_id, name, description) VALUES (?, ?, ?)', [normalizedModuleId, normalizedName, description ?? null]));
    return {
        id: result.insertId,
        name: normalizedName,
        description: description ?? null,
        moduleId: normalizedModuleId,
    };
}
async function getRolePermissions(roleName) {
    const [rows] = (await database_1.pool.query(`
      SELECT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN roles r ON r.id = rp.role_id
      WHERE r.name = ?
      ORDER BY p.name ASC
    `, [roleName]));
    return rows.map((row) => row.name);
}
async function getUserDashboards(userId) {
    const [rows] = (await database_1.pool.query(`
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = ?
    `, [userId]));
    const permissions = new Set(rows.map((row) => row.name));
    const dashboardMap = {
        'dashboard.admin': { key: 'admin', label: 'Administración', path: '/dashboard/admin' },
        'dashboard.marketing': { key: 'marketing', label: 'Marketing', path: '/dashboard/marketing' },
        'dashboard.finance': { key: 'finance', label: 'Finanzas', path: '/dashboard/finance' },
        'dashboard.comercial': { key: 'comercial', label: 'Comercial', path: '/dashboard/comercial' },
        'dashboard.access': { key: 'admin', label: 'Administración', path: '/dashboard/admin' },
    };
    const dashboards = new Map();
    for (const permission of permissions) {
        const dashboard = dashboardMap[permission];
        if (dashboard) {
            dashboards.set(dashboard.key, dashboard);
        }
    }
    const [roleRows] = (await database_1.pool.query(`
      SELECT r.name
      FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `, [userId]));
    const roles = new Set(roleRows.map((role) => role.name));
    if (roles.has('super_admin') || roles.has('admin')) {
        dashboards.set('admin', { key: 'admin', label: 'Administración', path: '/dashboard/admin' });
    }
    if (roles.has('marketing')) {
        dashboards.set('marketing', { key: 'marketing', label: 'Marketing', path: '/dashboard/marketing' });
    }
    if (roles.has('comercial')) {
        dashboards.set('comercial', { key: 'comercial', label: 'Comercial', path: '/dashboard/comercial' });
    }
    if (roles.has('contabilidad')) {
        dashboards.set('finance', { key: 'finance', label: 'Finanzas', path: '/dashboard/finance' });
    }
    return Array.from(dashboards.values());
}
async function getUserPermissions(userId) {
    const [rows] = (await database_1.pool.query(`
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = ?
      ORDER BY p.name ASC
    `, [userId]));
    return rows.map((row) => row.name);
}
async function userHasPermission(userId, permissionName) {
    const [rows] = (await database_1.pool.query(`
      SELECT ur.user_id
      FROM user_roles ur
      INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = ? AND p.name = ?
      LIMIT 1
    `, [userId, permissionName]));
    return rows.length > 0;
}
