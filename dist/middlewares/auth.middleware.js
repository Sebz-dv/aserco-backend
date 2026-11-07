"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const permissions_service_1 = require("../modules/permissions/permissions.service");
const users_repository_1 = require("../modules/users/users.repository");
const jwt_1 = require("../utils/jwt");
async function authMiddleware(req, res, next) {
    const token = req.cookies?.access_token;
    if (!token) {
        return res.status(401).json({ message: 'Sesión no válida o expirada.' });
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        const roles = await (0, users_repository_1.getUserRoles)(decoded.sub);
        const permissions = await (0, permissions_service_1.getUserPermissions)(decoded.sub);
        const dashboards = await (0, permissions_service_1.getUserDashboards)(decoded.sub);
        req.user = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            roles,
            permissions,
            dashboards,
        };
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
}
