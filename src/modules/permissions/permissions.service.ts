import { pool } from '../../config/database';

export type Module = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
};

export type Permission = {
  id: number;
  name: string;
  description?: string | null;
  moduleId?: number | null;
  moduleName?: string | null;
  moduleCode?: string | null;
};

export type UserDashboard = {
  key: string;
  label: string;
  path: string;
};

export async function listModules(): Promise<Module[]> {
  const [rows] = (await pool.query(
    'SELECT id, name, code, description FROM modules ORDER BY name ASC',
  )) as [Array<{ id: number; name: string; code: string; description?: string | null }>, unknown];

  return rows.map((module) => ({
    id: module.id,
    name: module.name,
    code: module.code,
    description: module.description ?? null,
  }));
}

export async function createModule({ name, code, description }: { name: string; code: string; description?: string }) {
  const normalizedName = String(name ?? '').trim();
  const normalizedCode = String(code ?? '').trim().toLowerCase();

  if (!normalizedName || !normalizedCode) {
    throw new Error('El nombre y el código del módulo son obligatorios.');
  }

  const [existing] = (await pool.query(
    'SELECT id FROM modules WHERE code = ? LIMIT 1',
    [normalizedCode],
  )) as [[{ id: number }], unknown];

  if (existing.length > 0) {
    return {
      id: existing[0].id,
      name: normalizedName,
      code: normalizedCode,
      description: description ?? null,
    };
  }

  const [result] = (await pool.query(
    'INSERT INTO modules (name, code, description) VALUES (?, ?, ?)',
    [normalizedName, normalizedCode, description ?? null],
  )) as [{ insertId: number }, unknown];

  return {
    id: result.insertId,
    name: normalizedName,
    code: normalizedCode,
    description: description ?? null,
  };
}

export async function listPermissions(): Promise<Permission[]> {
  const [rows] = (await pool.query(
    `
      SELECT p.id, p.name, p.description, p.module_id AS moduleId, m.name AS moduleName, m.code AS moduleCode
      FROM permissions p
      LEFT JOIN modules m ON m.id = p.module_id
      ORDER BY p.name ASC
    `,
  )) as [Array<{ id: number; name: string; description?: string | null; moduleId?: number | null; moduleName?: string | null; moduleCode?: string | null }>, unknown];

  return rows.map((permission) => ({
    id: permission.id,
    name: permission.name,
    description: permission.description ?? null,
    moduleId: permission.moduleId ?? null,
    moduleName: permission.moduleName ?? null,
    moduleCode: permission.moduleCode ?? null,
  }));
}

export async function createPermission({ moduleId, name, description }: { moduleId: number | string; name: string; description?: string }) {
  const normalizedName = String(name ?? '').trim();
  const normalizedModuleId = Number(moduleId);

  if (!normalizedName) {
    throw new Error('El código del permiso es obligatorio.');
  }

  if (!Number.isFinite(normalizedModuleId)) {
    throw new Error('Debe seleccionar un módulo válido.');
  }

  const [moduleRows] = (await pool.query(
    'SELECT id FROM modules WHERE id = ? LIMIT 1',
    [normalizedModuleId],
  )) as [Array<{ id: number }>, unknown];

  if (moduleRows.length === 0) {
    throw new Error('El módulo seleccionado no existe.');
  }

  const [existing] = (await pool.query(
    'SELECT id FROM permissions WHERE name = ? LIMIT 1',
    [normalizedName],
  )) as [[{ id: number }], unknown];

  if (existing.length > 0) {
    return {
      id: existing[0].id,
      name: normalizedName,
      description: description ?? null,
      moduleId: normalizedModuleId,
    };
  }

  const [result] = (await pool.query(
    'INSERT INTO permissions (module_id, name, description) VALUES (?, ?, ?)',
    [normalizedModuleId, normalizedName, description ?? null],
  )) as [{ insertId: number }, unknown];

  return {
    id: result.insertId,
    name: normalizedName,
    description: description ?? null,
    moduleId: normalizedModuleId,
  };
}

export async function getRolePermissions(roleName: string): Promise<string[]> {
  const [rows] = (await pool.query(
    `
      SELECT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN roles r ON r.id = rp.role_id
      WHERE r.name = ?
      ORDER BY p.name ASC
    `,
    [roleName],
  )) as [Array<{ name: string }>, unknown];

  return rows.map((row) => row.name);
}

export async function getUserDashboards(userId: number): Promise<UserDashboard[]> {
  const [rows] = (await pool.query(
    `
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = ?
    `,
    [userId],
  )) as [Array<{ name: string }>, unknown];

  const permissions = new Set(rows.map((row) => row.name));
  const dashboardMap: Record<string, UserDashboard> = {
    'dashboard.admin': { key: 'admin', label: 'Administración', path: '/dashboard/admin' },
    'dashboard.marketing': { key: 'marketing', label: 'Marketing', path: '/dashboard/marketing' },
    'dashboard.finance': { key: 'finance', label: 'Finanzas', path: '/dashboard/finance' },
    'dashboard.comercial': { key: 'comercial', label: 'Comercial', path: '/dashboard/comercial' },
    'dashboard.access': { key: 'admin', label: 'Administración', path: '/dashboard/admin' },
  };

  const dashboards = new Map<string, UserDashboard>();

  for (const permission of permissions) {
    const dashboard = dashboardMap[permission];
    if (dashboard) {
      dashboards.set(dashboard.key, dashboard);
    }
  }

  const [roleRows] = (await pool.query(
    `
      SELECT r.name
      FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `,
    [userId],
  )) as [Array<{ name: string }>, unknown];

  const roles = new Set(roleRows.map((role) => role.name));

  if (roles.has('super_admin') || roles.has('admin')) {
    dashboards.set('admin', { key: 'admin', label: 'Administración', path: '/dashboard/admin' });
  }

  if (roles.has('marketing')) {
    dashboards.set('marketing', { key: 'marketing', label: 'Marketing', path: '/dashboard/marketing' });
  }

  if (roles.has('comercial')) {
    dashboards.set('comercial', { key: 'comercial', label: 'Comercial', path: '/dashboard/comercial' });
  }

  if (roles.has('contabilidad')) {
    dashboards.set('finance', { key: 'finance', label: 'Finanzas', path: '/dashboard/finance' });
  }

  return Array.from(dashboards.values());
}

export async function getUserPermissions(userId: number): Promise<string[]> {
  const [rows] = (await pool.query(
    `
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = ?
      ORDER BY p.name ASC
    `,
    [userId],
  )) as [Array<{ name: string }>, unknown];

  return rows.map((row) => row.name);
}

export async function userHasPermission(userId: number, permissionName: string): Promise<boolean> {
  const [rows] = (await pool.query(
    `
      SELECT ur.user_id
      FROM user_roles ur
      INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = ? AND p.name = ?
      LIMIT 1
    `,
    [userId, permissionName],
  )) as [[{ user_id: number }], unknown];

  return rows.length > 0;
}
