import { describe, expect, it, vi } from 'vitest';
import { pool } from '../../config/database';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import { listRolePermissionsForRole, setRolePermissions } from './admin.repository';

describe('admin role permissions matrix', () => {
  it('persists and returns the selected permissions for a role', async () => {
    const roleName = `matrix_test_${Date.now()}`;

    await setRolePermissions(roleName, ['dashboard.view']);

    const permissions = await listRolePermissionsForRole(roleName);

    expect(permissions).toContain('dashboard.view');
  });

  it('blocks admin actions when the user does not have the required permission', async () => {
    const querySpy = vi.spyOn(pool, 'query').mockResolvedValue([[{ user_id: 99 }], {}] as never);

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
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const next = vi.fn();

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();

    querySpy.mockRestore();
  });
});
