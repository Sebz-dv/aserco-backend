import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { loginSchema, refreshSchema, registerSchema } from './auth.validator';
import { loginAuthUser, registerAuthUser, validateToken } from './auth.service';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 15,
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
}

export async function registerController(req: Request, res: Response) {
  try {
    const payload = registerSchema.parse(req.body);
    const session = await registerAuthUser(payload.name, payload.email, payload.password);

    setAuthCookies(res, session.accessToken, session.refreshToken);

    return res.status(201).json({
      message: 'Usuario creado correctamente.',
      user: session.user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const payload = loginSchema.parse(req.body);
    const session = await loginAuthUser(payload.email, payload.password);

    setAuthCookies(res, session.accessToken, session.refreshToken);

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      user: session.user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({ message: error.message });
    }
  }
}

export async function refreshController(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refresh_token ?? req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token faltante.' });
    }

    const payload = refreshSchema.parse({ refreshToken });
    const decoded = validateToken(payload.refreshToken);
    const nextAccessToken = signAccessToken({ sub: decoded.sub, email: decoded.email, name: decoded.name, sessionId: decoded.sessionId });
    const nextRefreshToken = signRefreshToken({ sub: decoded.sub, email: decoded.email, name: decoded.name, sessionId: decoded.sessionId });

    setAuthCookies(res, nextAccessToken, nextRefreshToken);

    return res.status(200).json({
      message: 'Token renovado.',
      user: {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token inválido o expirado.' });
  }
}

export async function logoutController(_req: Request, res: Response) {
  clearAuthCookies(res);

  return res.status(200).json({
    message: 'Sesión cerrada correctamente.',
  });
}

export async function meController(req: AuthenticatedRequest, res: Response) {
  const user = req.user;

  return res.status(200).json({
    message: 'Usuario autenticado.',
    user: user ?? null,
  });
}
