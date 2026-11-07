import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type TokenPayload = {
  sub: number;
  email: string;
  name: string;
  sessionId?: string;
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as unknown as TokenPayload;
}
