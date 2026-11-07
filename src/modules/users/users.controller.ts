import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getAuthenticatedUser } from './users.service';

export async function meController(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const profile = await getAuthenticatedUser(user.id);
    return res.status(200).json({ user: profile });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al consultar el usuario.' });
  }
}
