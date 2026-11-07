"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.authenticateUser = authenticateUser;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.changePassword = changePassword;
const password_1 = require("../../utils/password");
const permissions_service_1 = require("../permissions/permissions.service");
const users_repository_1 = require("./users.repository");
async function registerUser(name, email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await (0, users_repository_1.findUserByEmail)(normalizedEmail);
    if (existingUser) {
        throw new Error('El correo ya está registrado.');
    }
    (0, password_1.validatePasswordPolicy)(password);
    const passwordHash = await (0, password_1.hashPassword)(password);
    const userId = await (0, users_repository_1.createUser)({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
    });
    const user = await (0, users_repository_1.findUserById)(userId);
    if (!user) {
        throw new Error('No se pudo cargar el usuario creado.');
    }
    const roles = await (0, users_repository_1.getUserRoles)(user.id);
    const permissions = await (0, permissions_service_1.getUserPermissions)(user.id);
    const dashboards = await (0, permissions_service_1.getUserDashboards)(user.id);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
        permissions,
        dashboards,
    };
}
async function authenticateUser(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await (0, users_repository_1.findUserByEmail)(normalizedEmail);
    if (!user) {
        throw new Error('Credenciales inválidas.');
    }
    const validPassword = await (0, password_1.comparePassword)(password, user.password_hash);
    if (!validPassword) {
        throw new Error('Credenciales inválidas.');
    }
    const roles = await (0, users_repository_1.getUserRoles)(user.id);
    const permissions = await (0, permissions_service_1.getUserPermissions)(user.id);
    const dashboards = await (0, permissions_service_1.getUserDashboards)(user.id);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
        permissions,
        dashboards,
    };
}
async function getAuthenticatedUser(userId) {
    const user = await (0, users_repository_1.getUserPublicProfile)(userId);
    if (!user) {
        throw new Error('Usuario no encontrado.');
    }
    const roles = await (0, users_repository_1.getUserRoles)(user.id);
    const permissions = await (0, permissions_service_1.getUserPermissions)(user.id);
    const dashboards = await (0, permissions_service_1.getUserDashboards)(user.id);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.is_active === 1,
        roles,
        permissions,
        dashboards,
    };
}
async function changePassword(userId, newPassword) {
    const hashedPassword = await (0, password_1.hashPassword)(newPassword);
    await (0, users_repository_1.updateUserPassword)(userId, hashedPassword);
}
