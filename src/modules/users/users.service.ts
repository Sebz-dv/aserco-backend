import { comparePassword, hashPassword, validatePasswordPolicy } from '../../utils/password';
import { getUserDashboards, getUserPermissions } from '../permissions/permissions.service';
import { createUser, findUserByEmail, findUserById, getUserPublicProfile, getUserRoles, updateUserPassword } from './users.repository';

export type UserPayload = {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  dashboards?: Array<{ key: string; label: string; path: string }>;
};

export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error('El correo ya está registrado.');
  }

  validatePasswordPolicy(password);

  const passwordHash = await hashPassword(password);
  const userId = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const user = await findUserById(userId);
  if (!user) {
    throw new Error('No se pudo cargar el usuario creado.');
  }

  const roles = await getUserRoles(user.id);
  const permissions = await getUserPermissions(user.id);
  const dashboards = await getUserDashboards(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles,
    permissions,
    dashboards,
  } satisfies UserPayload;
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error('Credenciales inválidas.');
  }

  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) {
    throw new Error('Credenciales inválidas.');
  }

  const roles = await getUserRoles(user.id);
  const permissions = await getUserPermissions(user.id);
  const dashboards = await getUserDashboards(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles,
    permissions,
    dashboards,
  } satisfies UserPayload;
}

export async function getAuthenticatedUser(userId: number) {
  const user = await getUserPublicProfile(userId);
  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  const roles = await getUserRoles(user.id);
  const permissions = await getUserPermissions(user.id);
  const dashboards = await getUserDashboards(user.id);

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

export async function changePassword(userId: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(userId, hashedPassword);
}
