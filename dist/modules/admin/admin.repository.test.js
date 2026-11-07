"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const database_1 = require("../../config/database");
const admin_middleware_1 = require("../../middlewares/admin.middleware");
const admin_repository_1 = require("./admin.repository");
(0, vitest_1.describe)('admin role permissions matrix', () => {
    (0, vitest_1.it)('persists and returns the selected permissions for a role', async () => {
        const roleName = `matrix_test_${Date.now()}`;
        await (0, admin_repository_1.setRolePermissions)(roleName, ['dashboard.view']);
        const permissions = await (0, admin_repository_1.listRolePermissionsForRole)(roleName);
        (0, vitest_1.expect)(permissions).toContain('dashboard.view');
    });
    (0, vitest_1.it)('blocks admin actions when the user does not have the required permission', async () => {
        const querySpy = vitest_1.vi.spyOn(database_1.pool, 'query').mockResolvedValue([[{ user_id: 99 }], {}]);
        const req = {
            method: 'POST',
            path: '/users',
            baseUrl: '/api/admin',
            user: {
                id: 99,
                name: 'Admin sin permisos',
                email: 'admin@aserco.com',
                permissions: ['roles.view'],
            },
        };
        const res = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
        };
        const next = vitest_1.vi.fn();
        await (0, admin_middleware_1.adminMiddleware)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(403);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
        querySpy.mockRestore();
    });
});
