import { randomUUID } from 'crypto';
import { signAccessToken, signRefreshToken, verifyToken } from '../../utils/jwt';
import { authenticateUser, registerUser, type UserPayload } from '../users/users.service';

export type AuthSession = {
  user: UserPayload;
  accessToken: string;
  refreshToken: string;
};

export async function registerAuthUser(name: string, email: string, password: string): Promise<AuthSession> {
  const user = await registerUser(name, email, password);
  const sessionId = randomUUID();

  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name, sessionId });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, name: user.name, sessionId });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function loginAuthUser(email: string, password: string): Promise<AuthSession> {
  const user = await authenticateUser(email, password);
  const sessionId = randomUUID();

  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name, sessionId });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, name: user.name, sessionId });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export function validateToken(token: string) {
  return verifyToken(token);
}
