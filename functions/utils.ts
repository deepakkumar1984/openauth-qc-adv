// Shared utilities for authentication
import { getCookie, deleteCookie } from 'hono/cookie';
import { jwtVerify } from 'jose';
import { Env, SessionJwtPayload, JWT_COOKIE_NAME } from './types';

export async function getJwtSecret(env: Env): Promise<Uint8Array> {
  return new TextEncoder().encode(env.JWT_SECRET);
}

// Auth middleware to verify JWT
export async function authMiddleware(c: any, next: any) {
  const sessionToken = getCookie(c, JWT_COOKIE_NAME);
  
  if (!sessionToken) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const secret = await getJwtSecret(c.env);
    const { payload } = await jwtVerify(sessionToken, secret) as { payload: SessionJwtPayload };
    c.set('userId', payload.userId);
    c.set('userEmail', payload.email);
    await next();
  } catch (err) {
    deleteCookie(c, JWT_COOKIE_NAME);
    return c.json({ error: 'Invalid session' }, 401);
  }
}
