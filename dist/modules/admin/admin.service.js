"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdminUsers = listAdminUsers;
exports.createUserForAdmin = createUserForAdmin;
exports.changeUserStatus = changeUserStatus;
exports.assignUserRoles = assignUserRoles;
exports.listRolesForAdmin = listRolesForAdmin;
exports.listPermissionsForRole = listPermissionsForRole;
exports.createRoleForSuperAdmin = createRoleForSuperAdmin;
exports.listModulesForAdmin = listModulesForAdmin;
exports.createModuleForAdmin = createModuleForAdmin;
exports.createPermissionForAdmin = createPermissionForAdmin;
exports.updateRolePermissions = updateRolePermissions;
exports.requireAdminAccess = requireAdminAccess;
const password_1 = require("../../utils/password");
const permissions_service_1 = require("../permissions/permissions.service");
const admin_repository_1 = require("./admin.repository");
async function listAdminUsers() {
    return (0, admin_repository_1.getAllUsersForAdmin)();
}
async function createUserForAdmin({ requesterUserId, name, email, password, roles, }) {
    const normalizedRoles = [...new Set((roles || []).map((role) => role.trim()).filter(Boolean))];
    if (!name.trim() || !email.trim() || !password) {
        throw new Error('Nombre, correo y contraseña son obligatorios.');
    }
    (0, password_1.validatePasswordPolicy)(password);
    const requesterIsSuperAdmin = await (0, admin_repository_1.userHasRole)(requesterUserId, 'super_admin');
    const finalRoles = normalizedRoles.length > 0 ? normalizedRoles : ['admin'];
    if (finalRoles.includes('super_admin') && !requesterIsSuperAdmin) {
        throw new Error('Solo el super admin puede crear usuarios con rol de super admin.');
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    return (0, admin_repository_1.createUserWithRoles)({
        name,
        email,
        password: passwordHash,
        roles: finalRoles,
    });
}
async function changeUserStatus(userId, isActive) {
    const updated = await (0, admin_repository_1.updateUserActiveStatus)(userId, isActive);
    if (!updated) {
        throw new Error('Usuario no encontrado.');
    }
    return {
        userId,
        isActive,
    };
}
async function assignUserRoles(userId, roles) {
    const changed = await (0, admin_repository_1.setUserRoles)(userId, roles);
    if (!changed) {
        throw new Error('No se pudo asignar el rol solicitado.');
    }
    return {
        userId,
        roles,
    };
}
async function listRolesForAdmin() {
    return (0, admin_repository_1.listAvailableRoles)();
}
async function listPermissionsForRole({ requesterUserId, roleName }) {
    const requesterIsAdmin = (await (0, admin_repository_1.userHasRole)(requesterUserId, 'admin')) || (await (0, admin_repository_1.userHasRole)(requesterUserId, 'super_admin'));
    if (!requesterIsAdmin) {
        throw new Error('No tienes permisos para consultar permisos de roles.');
    }
    return (0, admin_repository_1.listRolePermissionsForRole)(roleName);
}
async function createRoleForSuperAdmin({ requesterUserId, name }) {
    const requesterIsAdmin = (await (0, admin_repository_1.userHasRole)(requesterUserId, 'admin')) || (await (0, admin_repository_1.userHasRole)(requesterUserId, 'super_admin'));
    if (!requesterIsAdmin) {
        throw new Error('Solo el admin o super admin puede crear roles.');
    }
    return (0, admin_repository_1.createRoleRecord)(name);
}
async function listModulesForAdmin() {
    return (0, permissions_service_1.listModules)();
}
async function createModuleForAdmin({ requesterUserId, name, code, description }) {
    const requesterIsAdmin = (await (0, admin_repository_1.userHasRole)(requesterUserId, 'admin')) || (await (0, admin_repository_1.userHasRole)(requesterUserId, 'super_admin'));
    if (!requesterIsAdmin) {
        throw new Error('Solo el admin o super admin puede crear módulos.');
    }
    return (0, permissions_service_1.createModule)({ name, code, description });
}
async function createPermissionForAdmin({ requesterUserId, moduleId, name, description }) {
    const requesterIsAdmin = (await (0, admin_repository_1.userHasRole)(requesterUserId, 'admin')) || (await (0, admin_repository_1.userHasRole)(requesterUserId, 'super_admin'));
    if (!requesterIsAdmin) {
        throw new Error('Solo el admin o super admin puede crear permisos.');
    }
    return (0, permissions_service_1.createPermission)({ moduleId, name, description });
}
async function updateRolePermissions({ requesterUserId, roleName, permissions }) {
    const requesterIsAdmin = (await (0, admin_repository_1.userHasRole)(requesterUserId, 'admin')) || (await (0, admin_repository_1.userHasRole)(requesterUserId, 'super_admin'));
    if (!requesterIsAdmin) {
        throw new Error('Solo el admin o super admin puede gestionar permisos de roles.');
    }
    const result = await (0, admin_repository_1.setRolePermissions)(roleName, permissions);
    if (!result) {
        throw new Error('No se pudo actualizar el rol solicitado.');
    }
    return {
        roleName,
        permissions: await (0, admin_repository_1.listRolePermissionsForRole)(roleName),
    };
}
async function requireAdminAccess(userId) {
    const isSuperAdmin = await (0, admin_repository_1.userHasRole)(userId, 'super_admin');
    if (!isSuperAdmin) {
        throw new Error('No tienes permisos de administrador.');
    }
}
