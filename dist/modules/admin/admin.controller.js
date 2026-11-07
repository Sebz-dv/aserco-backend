"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminUserController = createAdminUserController;
exports.listAdminUsersController = listAdminUsersController;
exports.listAdminRolesController = listAdminRolesController;
exports.listPermissionsController = listPermissionsController;
exports.listAdminModulesController = listAdminModulesController;
exports.createAdminModuleController = createAdminModuleController;
exports.createAdminPermissionController = createAdminPermissionController;
exports.createAdminRoleController = createAdminRoleController;
exports.listRolePermissionsController = listRolePermissionsController;
exports.updateRolePermissionsController = updateRolePermissionsController;
exports.updateUserStatusController = updateUserStatusController;
exports.assignUserRolesController = assignUserRolesController;
const permissions_service_1 = require("../permissions/permissions.service");
const admin_service_1 = require("./admin.service");
async function createAdminUserController(req, res) {
    try {
        const { name, email, password, roles } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios.' });
        }
        const user = await (0, admin_service_1.createUserForAdmin)({
            requesterUserId: Number(req.user?.id ?? 0),
            name: String(name),
            email: String(email),
            password: String(password),
            roles: Array.isArray(roles) ? roles : ['admin'],
        });
        return res.status(201).json({ message: 'Usuario creado correctamente.', user });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el usuario.' });
    }
}
async function listAdminUsersController(_req, res) {
    try {
        const users = await (0, admin_service_1.listAdminUsers)();
        return res.status(200).json({ users });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar usuarios.' });
    }
}
async function listAdminRolesController(_req, res) {
    try {
        const roles = await (0, admin_service_1.listRolesForAdmin)();
        return res.status(200).json({ roles });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar roles.' });
    }
}
async function listPermissionsController(_req, res) {
    try {
        const permissions = await (0, permissions_service_1.listPermissions)();
        return res.status(200).json({ permissions });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar permisos.' });
    }
}
async function listAdminModulesController(_req, res) {
    try {
        const modules = await (0, admin_service_1.listModulesForAdmin)();
        return res.status(200).json({ modules });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar módulos.' });
    }
}
async function createAdminModuleController(req, res) {
    try {
        const { name, code, description } = req.body;
        if (!name || !code) {
            return res.status(400).json({ message: 'El nombre y el código del módulo son obligatorios.' });
        }
        const module = await (0, admin_service_1.createModuleForAdmin)({
            requesterUserId: Number(req.user?.id ?? 0),
            name: String(name),
            code: String(code),
            description: description ? String(description) : undefined,
        });
        return res.status(201).json({ message: 'Módulo creado correctamente.', module });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el módulo.' });
    }
}
async function createAdminPermissionController(req, res) {
    try {
        const { moduleId, name, description } = req.body;
        if (!moduleId || !name) {
            return res.status(400).json({ message: 'Debe seleccionar un módulo y un permiso.' });
        }
        const permission = await (0, admin_service_1.createPermissionForAdmin)({
            requesterUserId: Number(req.user?.id ?? 0),
            moduleId,
            name: String(name),
            description: description ? String(description) : undefined,
        });
        return res.status(201).json({ message: 'Permiso creado correctamente.', permission });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el permiso.' });
    }
}
async function createAdminRoleController(req, res) {
    try {
        const { name } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
        }
        const role = await (0, admin_service_1.createRoleForSuperAdmin)({
            requesterUserId: Number(req.user?.id ?? 0),
            name: String(name),
        });
        return res.status(201).json({ message: 'Rol creado correctamente.', role });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el rol.' });
    }
}
async function listRolePermissionsController(req, res) {
    try {
        const roleName = String(req.params.roleName ?? '').trim();
        if (!roleName) {
            return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
        }
        const permissions = await (0, admin_service_1.listPermissionsForRole)({
            requesterUserId: Number(req.user?.id ?? 0),
            roleName,
        });
        return res.status(200).json({ permissions });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudieron consultar los permisos del rol.' });
    }
}
async function updateRolePermissionsController(req, res) {
    try {
        const roleName = String(req.params.roleName ?? '').trim();
        const { permissions } = req.body;
        if (!roleName) {
            return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
        }
        const result = await (0, admin_service_1.updateRolePermissions)({
            requesterUserId: Number(req.user?.id ?? 0),
            roleName,
            permissions: Array.isArray(permissions) ? permissions : [],
        });
        return res.status(200).json({ message: 'Permisos del rol actualizados.', role: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudieron actualizar los permisos.' });
    }
}
async function updateUserStatusController(req, res) {
    try {
        const userId = Number(req.params.userId);
        const { isActive } = req.body;
        if (Number.isNaN(userId) || typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'Parámetros inválidos.' });
        }
        const result = await (0, admin_service_1.changeUserStatus)(userId, isActive);
        return res.status(200).json({ message: 'Estado actualizado.', user: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo actualizar el estado.' });
    }
}
async function assignUserRolesController(req, res) {
    try {
        const userId = Number(req.params.userId);
        const { roles } = req.body;
        if (Number.isNaN(userId) || !Array.isArray(roles)) {
            return res.status(400).json({ message: 'Roles inválidos.' });
        }
        const result = await (0, admin_service_1.assignUserRoles)(userId, roles);
        return res.status(200).json({ message: 'Roles actualizados.', user: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudieron actualizar los roles.' });
    }
}
