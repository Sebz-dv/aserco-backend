import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthenticatedUser = {
  id: number;
  email: string;
  name: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

const JWT_SECRET = process.env.JWT_SECRET || 'aserco-dev-secret';

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token faltante o inválido.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      sub?: number;
      email?: string;
      name?: string;
    };

    if (!decoded.sub || !decoded.email || !decoded.name) {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}
