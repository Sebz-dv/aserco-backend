import { describe, expect, it } from 'vitest';
import { pool } from '../../config/database';
import { hashPassword } from '../../utils/password';
import { authenticateUser, registerUser } from './users.service';

describe('RBAC authentication payload', () => {
  it('returns dashboards in the registration payload even when the user has no roles assigned yet', async () => {
    const email = `diag.register.${Date.now()}@example.com`;
    const user = await registerUser('Usuario de prueba', email, 'Password1!');

    expect(user).toMatchObject({
      id: expect.any(Number),
      name: 'Usuario de prueba',
      email,
    });
    expect(Array.isArray(user.dashboards)).toBe(true);
    expect(user.dashboards).toEqual([]);
  });

  it('returns the admin dashboard for the super administrator', async () => {
    const user = await authenticateUser('superadmin@aserco.com.co', 'SuperAdmin123!');

    expect(user.roles).toContain('super_admin');
    expect(user.dashboards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'admin',
          label: 'Administración',
          path: '/dashboard/admin',
        }),
      ]),
    );
  });

  it('returns the marketing dashboard for a marketing user', async () => {
    const email = `diag.marketing.${Date.now()}@example.com`;
    const password = 'Password1!';
    const passwordHash = await hashPassword(password);
    const createResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, is_active) VALUES (?, ?, ?, 1)',
      ['Marketing Test', email, passwordHash],
    );
    const result = createResult as [{ insertId: number }, unknown];
    const userId = result[0].insertId;
    const [[role]] = (await pool.query('SELECT id FROM roles WHERE name = ? LIMIT 1', ['marketing'])) as [[{ id: number }], unknown];

    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, role.id]);

    const user = await authenticateUser(email, password);

    expect(user.roles).toContain('marketing');
    expect(user.dashboards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'marketing',
          label: 'Marketing',
          path: '/dashboard/marketing',
        }),
      ]),
    );
  });
});
