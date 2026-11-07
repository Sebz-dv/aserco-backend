import type { Request, Response } from 'express';
import { listPermissions as listAllPermissions, listModules } from '../permissions/permissions.service';
import {
  createModuleForAdmin,
  createPermissionForAdmin,
  createRoleForSuperAdmin,
  createUserForAdmin,
  listAdminUsers,
  listModulesForAdmin,
  listPermissionsForRole,
  listRolesForAdmin,
  assignUserRoles,
  changeUserStatus,
  updateRolePermissions,
} from './admin.service';

export async function createAdminUserController(req: Request, res: Response) {
  try {
    const { name, email, password, roles } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      roles?: string[];
    };

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios.' });
    }

    const user = await createUserForAdmin({
      requesterUserId: Number((req as any).user?.id ?? 0),
      name: String(name),
      email: String(email),
      password: String(password),
      roles: Array.isArray(roles) ? roles : ['admin'],
    });

    return res.status(201).json({ message: 'Usuario creado correctamente.', user });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el usuario.' });
  }
}

export async function listAdminUsersController(_req: Request, res: Response) {
  try {
    const users = await listAdminUsers();
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar usuarios.' });
  }
}

export async function listAdminRolesController(_req: Request, res: Response) {
  try {
    const roles = await listRolesForAdmin();
    return res.status(200).json({ roles });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar roles.' });
  }
}

export async function listPermissionsController(_req: Request, res: Response) {
  try {
    const permissions = await listAllPermissions();
    return res.status(200).json({ permissions });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar permisos.' });
  }
}

export async function listAdminModulesController(_req: Request, res: Response) {
  try {
    const modules = await listModulesForAdmin();
    return res.status(200).json({ modules });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar módulos.' });
  }
}

export async function createAdminModuleController(req: Request, res: Response) {
  try {
    const { name, code, description } = req.body as { name?: string; code?: string; description?: string };

    if (!name || !code) {
      return res.status(400).json({ message: 'El nombre y el código del módulo son obligatorios.' });
    }

    const module = await createModuleForAdmin({
      requesterUserId: Number((req as any).user?.id ?? 0),
      name: String(name),
      code: String(code),
      description: description ? String(description) : undefined,
    });

    return res.status(201).json({ message: 'Módulo creado correctamente.', module });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el módulo.' });
  }
}

export async function createAdminPermissionController(req: Request, res: Response) {
  try {
    const { moduleId, name, description } = req.body as { moduleId?: number | string; name?: string; description?: string };

    if (!moduleId || !name) {
      return res.status(400).json({ message: 'Debe seleccionar un módulo y un permiso.' });
    }

    const permission = await createPermissionForAdmin({
      requesterUserId: Number((req as any).user?.id ?? 0),
      moduleId,
      name: String(name),
      description: description ? String(description) : undefined,
    });

    return res.status(201).json({ message: 'Permiso creado correctamente.', permission });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el permiso.' });
  }
}

export async function createAdminRoleController(req: Request, res: Response) {
  try {
    const { name } = req.body as { name?: string };

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
    }

    const role = await createRoleForSuperAdmin({
      requesterUserId: Number((req as any).user?.id ?? 0),
      name: String(name),
    });

    return res.status(201).json({ message: 'Rol creado correctamente.', role });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el rol.' });
  }
}

export async function listRolePermissionsController(req: Request, res: Response) {
  try {
    const roleName = String(req.params.roleName ?? '').trim();

    if (!roleName) {
      return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
    }

    const permissions = await listPermissionsForRole({
      requesterUserId: Number((req as any).user?.id ?? 0),
      roleName,
    });

    return res.status(200).json({ permissions });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudieron consultar los permisos del rol.' });
  }
}

export async function updateRolePermissionsController(req: Request, res: Response) {
  try {
    const roleName = String(req.params.roleName ?? '').trim();
    const { permissions } = req.body as { permissions?: string[] };

    if (!roleName) {
      return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
    }

    const result = await updateRolePermissions({
      requesterUserId: Number((req as any).user?.id ?? 0),
      roleName,
      permissions: Array.isArray(permissions) ? permissions : [],
    });

    return res.status(200).json({ message: 'Permisos del rol actualizados.', role: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudieron actualizar los permisos.' });
  }
}

export async function updateUserStatusController(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const { isActive } = req.body as { isActive?: boolean };

    if (Number.isNaN(userId) || typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Parámetros inválidos.' });
    }

    const result = await changeUserStatus(userId, isActive);
    return res.status(200).json({ message: 'Estado actualizado.', user: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo actualizar el estado.' });
  }
}

export async function assignUserRolesController(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const { roles } = req.body as { roles?: string[] };

    if (Number.isNaN(userId) || !Array.isArray(roles)) {
      return res.status(400).json({ message: 'Roles inválidos.' });
    }

    const result = await assignUserRoles(userId, roles);
    return res.status(200).json({ message: 'Roles actualizados.', user: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudieron actualizar los roles.' });
  }
}
