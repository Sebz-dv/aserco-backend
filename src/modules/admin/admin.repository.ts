import { pool } from '../../config/database';
import { createUser, findUserByEmail } from '../users/users.repository';

export type AdminUserRecord = {
  id: number;
  name: string;
  email: string;
  is_active: number;
  roles: string;
};

export async function ensureRolesExist(roleNames: string[]) {
  const normalizedRoles = [...new Set(roleNames.map((role) => role.trim()).filter(Boolean))];

  if (normalizedRoles.length === 0) {
    return [] as string[];
  }

  const [existingRows] = (await pool.query(
    'SELECT name FROM roles WHERE name IN (?)',
    [normalizedRoles],
  )) as [Array<{ name: string }>, unknown];

  const existingSet = new Set(existingRows.map((row) => row.name));
  const missingRoles = normalizedRoles.filter((role) => !existingSet.has(role));

  for (const roleName of missingRoles) {
    await pool.query(
      'INSERT INTO roles (name, description) VALUES (?, ?)',
      [roleName, `Rol personalizado: ${roleName}`],
    );
  }

  const [rows] = (await pool.query(
    'SELECT name FROM roles WHERE name IN (?)',
    [normalizedRoles],
  )) as [Array<{ name: string }>, unknown];

  return rows.map((row) => row.name);
}

export async function listAvailableRoles() {
  const [rows] = (await pool.query(
    'SELECT id, name, description FROM roles ORDER BY name ASC',
  )) as [Array<{ id: number; name: string; description?: string }>, unknown];

  return rows.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description ?? null,
  }));
}

export async function createRoleRecord(name: string) {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    throw new Error('El nombre del rol es obligatorio.');
  }

  const [existing] = (await pool.query(
    'SELECT id FROM roles WHERE name = ? LIMIT 1',
    [normalizedName],
  )) as [[{ id: number }], unknown];

  if (existing.length > 0) {
    return { id: existing[0].id, name: normalizedName };
  }

  const [result] = (await pool.query(
    'INSERT INTO roles (name, description) VALUES (?, ?)',
    [normalizedName, `Rol personalizado: ${normalizedName}`],
  )) as [{ insertId: number }, unknown];

  return { id: result.insertId, name: normalizedName };
}

export async function createUserWithRoles({
  name,
  email,
  password,
  roles,
}: {
  name: string;
  email: string;
  password: string;
  roles: string[];
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error('El correo ya está registrado.');
  }

  const userId = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password,
  });

  await setUserRoles(userId, roles);

  return {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    roles,
    isActive: true,
  };
}

export async function getAllUsersForAdmin() {
  const [rows] = (await pool.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.is_active,
        COALESCE(GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ', '), '') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      GROUP BY u.id, u.name, u.email, u.is_active
      ORDER BY u.id ASC
    `,
  )) as [AdminUserRecord[], unknown];

  return rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: Boolean(user.is_active),
    roles: user.roles ? user.roles.split(', ').filter(Boolean) : [],
  }));
}

export async function updateUserActiveStatus(userId: number, isActive: boolean) {
  const [result] = (await pool.query(
    'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [isActive ? 1 : 0, userId],
  )) as [{ affectedRows: number }, unknown];

  return result.affectedRows > 0;
}

export async function setUserRoles(userId: number, roles: string[]) {
  const normalizedRoles = [...new Set(roles.map((role) => role.trim()).filter(Boolean))];

  if (normalizedRoles.length === 0) {
    return true;
  }

  const availableRoles = await ensureRolesExist(normalizedRoles);
  const [existingRoles] = (await pool.query(
    'SELECT id, name FROM roles WHERE name IN (?)',
    [availableRoles],
  )) as [Array<{ id: number; name: string }>, unknown];

  const roleIds = existingRoles.map((role) => role.id);

  if (roleIds.length === 0) {
    return false;
  }

  await pool.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);

  const values = roleIds.map(() => '(?, ?)').join(', ');
  const params = roleIds.flatMap((roleId) => [userId, roleId]);

  if (values) {
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ${values}`,
      params,
    );
  }

  return true;
}

export async function setRolePermissions(roleName: string, permissions: string[]) {
  const normalizedRoleName = roleName.trim().toLowerCase();
  const normalizedPermissions = [...new Set((permissions || []).map((permission) => String(permission).trim()).filter(Boolean))];

  if (!normalizedRoleName) {
    return false;
  }

  const [[existingRole]] = (await pool.query(
    'SELECT id FROM roles WHERE name = ? LIMIT 1',
    [normalizedRoleName],
  )) as [[{ id: number } | undefined], unknown];

  const role = existingRole ?? (await createRoleRecord(normalizedRoleName));

  if (normalizedPermissions.length === 0) {
    await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [role.id]);
    return true;
  }

  const [existingPermissions] = (await pool.query(
    'SELECT id, name FROM permissions WHERE name IN (?)',
    [normalizedPermissions],
  )) as [Array<{ id: number; name: string }>, unknown];

  const permissionIds = existingPermissions.map((permission) => permission.id);

  await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [role.id]);

  if (permissionIds.length === 0) {
    return true;
  }

  const values = permissionIds.map(() => '(?, ?)').join(', ');
  const params = permissionIds.flatMap((permissionId) => [role.id, permissionId]);

  if (values) {
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
      params,
    );
  }

  return true;
}

export async function listRolePermissionsForRole(roleName: string): Promise<string[]> {
  const normalizedRoleName = roleName.trim().toLowerCase();

  if (!normalizedRoleName) {
    return [];
  }

  const [[role]] = (await pool.query(
    'SELECT id FROM roles WHERE name = ? LIMIT 1',
    [normalizedRoleName],
  )) as [[{ id: number } | undefined], unknown];

  if (!role) {
    return [];
  }

  const [rows] = (await pool.query(
    `
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      ORDER BY p.name ASC
    `,
    [role.id],
  )) as [Array<{ name: string }>, unknown];

  return rows.map((row) => row.name);
}

export async function userHasRole(userId: number, roleName: string) {
  const [rows] = (await pool.query(
    `
      SELECT ur.user_id
      FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ? AND r.name = ?
      LIMIT 1
    `,
    [userId, roleName],
  )) as [[{ user_id: number }], unknown];

  return rows.length > 0;
}
