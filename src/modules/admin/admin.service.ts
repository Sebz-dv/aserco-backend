import { hashPassword, validatePasswordPolicy } from '../../utils/password';
import { createModule, createPermission, listModules } from '../permissions/permissions.service';
import {
  createRoleRecord,
  createUserWithRoles,
  getAllUsersForAdmin,
  listAvailableRoles,
  listRolePermissionsForRole,
  setRolePermissions,
  setUserRoles,
  updateUserActiveStatus,
  userHasRole,
} from './admin.repository';

export async function listAdminUsers() {
  return getAllUsersForAdmin();
}

export async function createUserForAdmin({
  requesterUserId,
  name,
  email,
  password,
  roles,
}: {
  requesterUserId: number;
  name: string;
  email: string;
  password: string;
  roles: string[];
}) {
  const normalizedRoles = [...new Set((roles || []).map((role) => role.trim()).filter(Boolean))];

  if (!name.trim() || !email.trim() || !password) {
    throw new Error('Nombre, correo y contraseña son obligatorios.');
  }

  validatePasswordPolicy(password);

  const requesterIsSuperAdmin = await userHasRole(requesterUserId, 'super_admin');
  const finalRoles = normalizedRoles.length > 0 ? normalizedRoles : ['admin'];

  if (finalRoles.includes('super_admin') && !requesterIsSuperAdmin) {
    throw new Error('Solo el super admin puede crear usuarios con rol de super admin.');
  }

  const passwordHash = await hashPassword(password);

  return createUserWithRoles({
    name,
    email,
    password: passwordHash,
    roles: finalRoles,
  });
}

export async function changeUserStatus(userId: number, isActive: boolean) {
  const updated = await updateUserActiveStatus(userId, isActive);
  if (!updated) {
    throw new Error('Usuario no encontrado.');
  }

  return {
    userId,
    isActive,
  };
}

export async function assignUserRoles(userId: number, roles: string[]) {
  const changed = await setUserRoles(userId, roles);
  if (!changed) {
    throw new Error('No se pudo asignar el rol solicitado.');
  }

  return {
    userId,
    roles,
  };
}

export async function listRolesForAdmin() {
  return listAvailableRoles();
}

export async function listPermissionsForRole({ requesterUserId, roleName }: { requesterUserId: number; roleName: string }) {
  const requesterIsAdmin = (await userHasRole(requesterUserId, 'admin')) || (await userHasRole(requesterUserId, 'super_admin'));
  if (!requesterIsAdmin) {
    throw new Error('No tienes permisos para consultar permisos de roles.');
  }

  return listRolePermissionsForRole(roleName);
}

export async function createRoleForSuperAdmin({ requesterUserId, name }: { requesterUserId: number; name: string }) {
  const requesterIsAdmin = (await userHasRole(requesterUserId, 'admin')) || (await userHasRole(requesterUserId, 'super_admin'));
  if (!requesterIsAdmin) {
    throw new Error('Solo el admin o super admin puede crear roles.');
  }

  return createRoleRecord(name);
}

export async function listModulesForAdmin() {
  return listModules();
}

export async function createModuleForAdmin({ requesterUserId, name, code, description }: { requesterUserId: number; name: string; code: string; description?: string }) {
  const requesterIsAdmin = (await userHasRole(requesterUserId, 'admin')) || (await userHasRole(requesterUserId, 'super_admin'));
  if (!requesterIsAdmin) {
    throw new Error('Solo el admin o super admin puede crear módulos.');
  }

  return createModule({ name, code, description });
}

export async function createPermissionForAdmin({ requesterUserId, moduleId, name, description }: { requesterUserId: number; moduleId: number | string; name: string; description?: string }) {
  const requesterIsAdmin = (await userHasRole(requesterUserId, 'admin')) || (await userHasRole(requesterUserId, 'super_admin'));
  if (!requesterIsAdmin) {
    throw new Error('Solo el admin o super admin puede crear permisos.');
  }

  return createPermission({ moduleId, name, description });
}

export async function updateRolePermissions({ requesterUserId, roleName, permissions }: { requesterUserId: number; roleName: string; permissions: string[] }) {
  const requesterIsAdmin = (await userHasRole(requesterUserId, 'admin')) || (await userHasRole(requesterUserId, 'super_admin'));
  if (!requesterIsAdmin) {
    throw new Error('Solo el admin o super admin puede gestionar permisos de roles.');
  }

  const result = await setRolePermissions(roleName, permissions);
  if (!result) {
    throw new Error('No se pudo actualizar el rol solicitado.');
  }

  return {
    roleName,
    permissions: await listRolePermissionsForRole(roleName),
  };
}

export async function requireAdminAccess(userId: number) {
  const isSuperAdmin = await userHasRole(userId, 'super_admin');
  if (!isSuperAdmin) {
    throw new Error('No tienes permisos de administrador.');
  }
}
