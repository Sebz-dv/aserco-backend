"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const database_1 = require("../../config/database");
const password_1 = require("../../utils/password");
const users_service_1 = require("./users.service");
(0, vitest_1.describe)('RBAC authentication payload', () => {
    (0, vitest_1.it)('returns dashboards in the registration payload even when the user has no roles assigned yet', async () => {
        const email = `diag.register.${Date.now()}@example.com`;
        const user = await (0, users_service_1.registerUser)('Usuario de prueba', email, 'Password1!');
        (0, vitest_1.expect)(user).toMatchObject({
            id: vitest_1.expect.any(Number),
            name: 'Usuario de prueba',
            email,
        });
        (0, vitest_1.expect)(Array.isArray(user.dashboards)).toBe(true);
        (0, vitest_1.expect)(user.dashboards).toEqual([]);
    });
    (0, vitest_1.it)('returns the admin dashboard for the super administrator', async () => {
        const user = await (0, users_service_1.authenticateUser)('superadmin@aserco.com.co', 'SuperAdmin123!');
        (0, vitest_1.expect)(user.roles).toContain('super_admin');
        (0, vitest_1.expect)(user.dashboards).toEqual(vitest_1.expect.arrayContaining([
            vitest_1.expect.objectContaining({
                key: 'admin',
                label: 'Administración',
                path: '/dashboard/admin',
            }),
        ]));
    });
    (0, vitest_1.it)('returns the marketing dashboard for a marketing user', async () => {
        const email = `diag.marketing.${Date.now()}@example.com`;
        const password = 'Password1!';
        const passwordHash = await (0, password_1.hashPassword)(password);
        const createResult = await database_1.pool.query('INSERT INTO users (name, email, password_hash, is_active) VALUES (?, ?, ?, 1)', ['Marketing Test', email, passwordHash]);
        const result = createResult;
        const userId = result[0].insertId;
        const [[role]] = (await database_1.pool.query('SELECT id FROM roles WHERE name = ? LIMIT 1', ['marketing']));
        await database_1.pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, role.id]);
        const user = await (0, users_service_1.authenticateUser)(email, password);
        (0, vitest_1.expect)(user.roles).toContain('marketing');
        (0, vitest_1.expect)(user.dashboards).toEqual(vitest_1.expect.arrayContaining([
            vitest_1.expect.objectContaining({
                key: 'marketing',
                label: 'Marketing',
                path: '/dashboard/marketing',
            }),
        ]));
    });
});
