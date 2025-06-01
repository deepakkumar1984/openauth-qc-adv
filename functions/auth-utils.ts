// Authentication utilities shared across modules
import { jwtVerify } from 'jose';
import { Context } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  APP_BASE_URL: string; 
}

export interface User {
  id: number;
  email: string;
  username: string;
  auth_provider?: string; 
}

export interface SessionJwtPayload {
  userId: number;
  email: string;
  iat: number;
}

export const JWT_COOKIE_NAME = 'qa_session';

export async function getJwtSecret(env: Env): Promise<Uint8Array> {
  return new TextEncoder().encode(env.JWT_SECRET);
}

// Enhanced auth middleware with proper typing for Hono
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  const sessionToken = getCookie(c, JWT_COOKIE_NAME);
  
  if (!sessionToken) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const secret = await getJwtSecret(c.env);
    const { payload } = await jwtVerify(sessionToken, secret) as { payload: SessionJwtPayload };
    
    // Set user info in context variables
    c.set('userId', payload.userId);
    c.set('userEmail', payload.email);
    
    await next();
  } catch (err) {
    deleteCookie(c, JWT_COOKIE_NAME);
    return c.json({ error: 'Invalid session' }, 401);
  }
}

export async function verifyAuth(request: Request, env: Env): Promise<{ user: User | null; error: Response | null }> {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = cookieHeader?.match(new RegExp(`${JWT_COOKIE_NAME}=([^;]+)`))?.[1];

  if (!sessionToken) {
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Authentication required' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      })
    };
  }

  try {
    const secret = await getJwtSecret(env);
    const { payload } = await jwtVerify(sessionToken, secret) as { payload: SessionJwtPayload };

    const user = await env.DB.prepare(
      'SELECT id, email, username, auth_provider FROM Users WHERE id = ?1'
    ).bind(payload.userId).first<User | null>();

    if (!user) {
      return {
        user: null,
        error: new Response(JSON.stringify({ error: 'User not found' }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        })
      };
    }

    return { user, error: null };
  } catch (err) {
    console.error('JWT verification error:', err);
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Invalid session' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      })
    };
  }
}

export function requireAuth(handler: (request: Request, env: Env, ctx: ExecutionContext, user: User) => Promise<Response>) {
  return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
    const { user, error } = await verifyAuth(request, env);
    
    if (error) {
      return error;
    }
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return handler(request, env, ctx, user);
  };
}

export { JWT_COOKIE_NAME, getJwtSecret, SessionJwtPayload, Env, User };
