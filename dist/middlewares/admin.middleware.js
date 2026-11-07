"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = adminMiddleware;
const database_1 = require("../config/database");
function getRequiredPermissions(method, path) {
    const normalizedPath = path.split('?')[0];
    if (method === 'GET' && normalizedPath === '/users')
        return ['users.read'];
    if (method === 'POST' && normalizedPath === '/users')
        return ['users.create'];
    if (method === 'GET' && normalizedPath === '/roles')
        return ['roles.view'];
    if (method === 'POST' && normalizedPath === '/roles')
        return ['roles.manage'];
    if (method === 'GET' && /^\/roles\/[^/]+\/permissions$/.test(normalizedPath))
        return ['roles.view'];
    if (method === 'PATCH' && /^\/roles\/[^/]+\/permissions$/.test(normalizedPath))
        return ['permissions.manage'];
    if (method === 'GET' && normalizedPath === '/modules')
        return ['roles.view'];
    if (method === 'POST' && normalizedPath === '/modules')
        return ['permissions.manage'];
    if (method === 'GET' && normalizedPath === '/permissions')
        return ['roles.view'];
    if (method === 'POST' && normalizedPath === '/permissions')
        return ['permissions.manage'];
    if (method === 'PATCH' && /^\/users\/\d+\/status$/.test(normalizedPath))
        return ['users.edit'];
    if (method === 'PATCH' && /^\/users\/\d+\/roles$/.test(normalizedPath))
        return ['users.edit'];
    return [];
}
async function adminMiddleware(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado.' });
        }
        const [rows] = (await database_1.pool.query(`
        SELECT ur.user_id
        FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ? AND r.name IN ('admin', 'super_admin')
        LIMIT 1
      `, [req.user.id]));
        if (rows.length === 0) {
            return res.status(403).json({ message: 'No tienes permisos de administrador.' });
        }
        const requiredPermissions = getRequiredPermissions(req.method, req.path || req.originalUrl || '');
        const userPermissions = req.user.permissions ?? [];
        if (requiredPermissions.length > 0) {
            const hasPermission = requiredPermissions.some((permission) => userPermissions.includes(permission));
            if (!hasPermission) {
                return res.status(403).json({
                    message: 'No tienes permiso para realizar esta acción.',
                    requiredPermissions,
                });
            }
        }
        return next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ message: 'Error de autorización.' });
    }
}
