import type { NextFunction, Request, Response } from 'express';
import { getUserDashboards, getUserPermissions } from '../modules/permissions/permissions.service';
import { getUserRoles } from '../modules/users/users.repository';
import { verifyToken } from '../utils/jwt';

export type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    name: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    dashboards?: Array<{ key: string; label: string; path: string }>;
  };
};

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token as string | undefined;

  if (!token) {
    return res.status(401).json({ message: 'Sesión no válida o expirada.' });
  }

  try {
    const decoded = verifyToken(token);
    const roles = await getUserRoles(decoded.sub);
    const permissions = await getUserPermissions(decoded.sub);
    const dashboards = await getUserDashboards(decoded.sub);

    req.user = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      roles,
      permissions,
      dashboards,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}
