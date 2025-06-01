// Authentication module with OAuth support
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { OpenAuth } from '@openauthjs/openauth';

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

interface User {
  id: number;
  email: string;
  username: string;
  auth_provider?: string; 
}

interface SessionJwtPayload extends JWTPayload {
  userId: number;
  email: string;
  iat?: number;
}

interface LocalAuthRequestBody {
  email?: string;
  password?: string;
  username?: string;
}

interface OAuthUserProfile {
  id?: string; 
  sub?: string; 
  email?: string;
  name?: string; 
  login?: string; 
  raw?: Record<string, any>; 
}

const JWT_COOKIE_NAME = 'qa_session';
const JWT_EXPIRATION = '24h';

async function getJwtSecret(env: Env): Promise<Uint8Array> {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export { JWT_COOKIE_NAME, getJwtSecret, User, SessionJwtPayload };

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // Only handle auth routes
    if (pathSegments[0] === 'api' && pathSegments[1] === 'auth') {
      const serviceOrProvider = pathSegments[2];
      const action = pathSegments[3]; 

      // Handle special auth endpoints first
      if (pathSegments[2] === 'me' && request.method === 'GET') {
        const cookieHeader = request.headers.get('Cookie');
        const sessionToken = cookieHeader?.match(new RegExp(`${JWT_COOKIE_NAME}=([^;]+)`))?.[1];

        if (!sessionToken) {
          return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        try {
          const secret = await getJwtSecret(env);
          const { payload } = await jwtVerify(sessionToken, secret) as { payload: SessionJwtPayload };

          const user = await env.DB.prepare(
            'SELECT id, email, username, auth_provider FROM Users WHERE id = ?1'
          ).bind(payload.userId).first<User | null>();

          if (!user) {
            const headers = new Headers({ 'Content-Type': 'application/json' });
            headers.append('Set-Cookie', `${JWT_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 401, headers });
          }
          
          return new Response(JSON.stringify({ user }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          });
        } catch (err) {
          console.error('JWT verification error:', err);
          const headers = new Headers({ 'Content-Type': 'application/json' });
          headers.append('Set-Cookie', `${JWT_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
          return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers });
        }
      }

      if (pathSegments[2] === 'logout' && request.method === 'POST') {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Set-Cookie', `${JWT_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure=${url.protocol === 'https:'}`);
        return new Response(JSON.stringify({ message: 'Logged out successfully' }), { status: 200, headers });
      }

      // --- Start: Local Email/Password Authentication ---
      if (serviceOrProvider === 'local') {
        if (request.method !== 'POST') {
          return new Response('Method not allowed for local auth', { status: 405 });
        }
        
        let reqBody: LocalAuthRequestBody;
        try {
          reqBody = await request.json();
        } catch (e) {
          return new Response('Invalid JSON body', { status: 400 });
        }

        const { email, password, username } = reqBody;

        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        if (action === 'register') {
          if (!username) {
            return new Response(JSON.stringify({ error: 'Username is required for registration' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }

          const existingUser = await env.DB.prepare(
            'SELECT id FROM Users WHERE email = ?1 OR username = ?2'
          ).bind(email, username).first<{ id: number } | null>();

          if (existingUser) {
            return new Response(JSON.stringify({ error: 'User with this email or username already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
          }

          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          try {
            const newUserResult = await env.DB.prepare(
              "INSERT INTO Users (email, username, hashed_password, auth_provider, created_at, updated_at) VALUES (?1, ?2, ?3, 'email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, email, username"
            ).bind(email, username, hashedPassword).first<User | null>();

            if (!newUserResult) {
              return new Response(JSON.stringify({ error: 'Failed to register user' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
            }
            
            const sessionPayload: SessionJwtPayload = { userId: newUserResult.id, email: newUserResult.email, iat: Math.floor(Date.now() / 1000) };
            const sessionJwt = await new SignJWT(sessionPayload)
              .setProtectedHeader({ alg: 'HS256' })
              .setIssuedAt()
              .setExpirationTime(JWT_EXPIRATION)
              .sign(await getJwtSecret(env));

            const headers = new Headers({ 'Content-Type': 'application/json' });
            const cookieOptions = `HttpOnly; Path=/; Max-Age=${24*60*60}; SameSite=Lax; Secure=${url.protocol === 'https:'}`;
            headers.append('Set-Cookie', `${JWT_COOKIE_NAME}=${sessionJwt}; ${cookieOptions}`);
            
            return new Response(JSON.stringify({ user: newUserResult, message: 'Registration successful' }), { status: 201, headers });

          } catch (dbError: any) {
            console.error('Registration DB error:', dbError.message, dbError.cause);
            if (dbError.message?.includes('UNIQUE constraint failed')) {
                 return new Response(JSON.stringify({ error: 'User with this email or username already exists.' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({ error: 'Database error during registration' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
          }

        } else if (action === 'login') {
          const userResult = await env.DB.prepare(
            "SELECT id, email, username, hashed_password FROM Users WHERE email = ?1 AND auth_provider = 'email'"
          ).bind(email).first<{ id: number; email: string; username: string; hashed_password: string | null } | null>();

          if (!userResult || !userResult.hashed_password) {
            return new Response(JSON.stringify({ error: 'Invalid email or password, or user signed up with OAuth' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
          }

          const passwordMatch = await bcrypt.compare(password, userResult.hashed_password);

          if (!passwordMatch) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
          }

          const appUser: User = { id: userResult.id, email: userResult.email, username: userResult.username };
          const sessionPayload: SessionJwtPayload = { userId: appUser.id, email: appUser.email, iat: Math.floor(Date.now() / 1000) };
          const sessionJwt = await new SignJWT(sessionPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRATION)
            .sign(await getJwtSecret(env));
          
          const headers = new Headers({ 'Content-Type': 'application/json' });
          const cookieOptions = `HttpOnly; Path=/; Max-Age=${24*60*60}; SameSite=Lax; Secure=${url.protocol === 'https:'}`;
          headers.append('Set-Cookie', `${JWT_COOKIE_NAME}=${sessionJwt}; ${cookieOptions}`);

          return new Response(JSON.stringify({ user: appUser, message: 'Login successful' }), { status: 200, headers });
        }
        return new Response('Invalid local auth action', { status: 400 });
      }
      // --- End: Local Email/Password Authentication ---

      // --- Start: OAuth Provider Authentication ---
      const providerName = serviceOrProvider;
      const oauthAction = action; 

      const baseCallbackUrl = `${env.APP_BASE_URL}/api/auth`;
      const openAuthInstance = new OpenAuth({
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          redirectUri: `${baseCallbackUrl}/google/callback`,
          scope: ['email', 'profile'],
        },
        facebook: {
          clientId: env.FACEBOOK_CLIENT_ID,
          clientSecret: env.FACEBOOK_CLIENT_SECRET,
          redirectUri: `${baseCallbackUrl}/facebook/callback`,
          scope: ['email', 'public_profile'],
        },
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          redirectUri: `${baseCallbackUrl}/github/callback`,
          scope: ['user:email', 'read:user'],
        },
      });

      try {
        const typedProviderName = providerName as keyof typeof openAuthInstance.providers;
        if (!openAuthInstance.providers[typedProviderName] && (oauthAction === 'login' || oauthAction === 'callback')) {
            return new Response('Unsupported provider', { status: 400 });
        }

        if (oauthAction === 'login' && openAuthInstance.providers[typedProviderName]) {
          const authParams = await openAuthInstance.getAuthorizationUrl(typedProviderName);
          const stateCookie = `oauth_state=${authParams.state}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax; Secure=${url.protocol === 'https:'}`;
          let cookiesToSet = [stateCookie];

          if (authParams.codeVerifier) {
            cookiesToSet.push(`oauth_code_verifier=${authParams.codeVerifier}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax; Secure=${url.protocol === 'https:'}`);
          }
          if (authParams.nonce) {
            cookiesToSet.push(`oauth_nonce=${authParams.nonce}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax; Secure=${url.protocol === 'https:'}`);
          }

          const headers = new Headers({ Location: authParams.url.toString() });
          cookiesToSet.forEach(cookie => headers.append('Set-Cookie', cookie));
          return new Response(null, { status: 302, headers });

        } else if (oauthAction === 'callback' && openAuthInstance.providers[typedProviderName]) {
          const code = url.searchParams.get('code');
          const receivedState = url.searchParams.get('state');

          const cookies = request.headers.get('Cookie');
          const originalState = cookies?.match(/oauth_state=([^;]+)/)?.[1];
          const codeVerifier = cookies?.match(/oauth_code_verifier=([^;]+)/)?.[1];
          const nonce = cookies?.match(/oauth_nonce=([^;]+)/)?.[1];

          if (!code || !receivedState || receivedState !== originalState) {
            return new Response('Invalid state or code', { status: 400 });
          }
          
          const { userProfile }: { userProfile: OAuthUserProfile } = await openAuthInstance.handleCallback(typedProviderName, url.toString(), {
            codeVerifier,
            nonce,
            state: originalState,
          });

          if (!userProfile || !userProfile.email) {
            return new Response('Failed to fetch user profile or email missing', { status: 500 });
          }

          const userEmail = userProfile.email;
          const usernameSuggestion = userProfile.name ?? userProfile.login ?? userEmail.split('@')[0] ?? 'user' + Date.now();
          const providerUserId = String(userProfile.id || userProfile.sub); 

          if (!providerUserId || providerUserId === 'undefined') { 
            console.error("Provider user ID (userProfile.id or userProfile.sub) is missing from OAuth profile", userProfile);
            return new Response('OAuth profile missing provider user ID', { status: 500 });
          }

          let appUser: User | null = null;

          const existingOAuthUser = await env.DB.prepare(
            'SELECT id, email, username FROM Users WHERE auth_provider = ?1 AND provider_id = ?2'
          ).bind(providerName, providerUserId).first<User | null>();

          if (existingOAuthUser) {
            appUser = existingOAuthUser;
          } else {
            const existingUserByEmail = await env.DB.prepare(
                'SELECT id, email, username, auth_provider FROM Users WHERE email = ?1'
            ).bind(userEmail).first<{id: number, email: string, username: string, auth_provider: string} | null>();

            if (existingUserByEmail) {
                if (existingUserByEmail.auth_provider !== providerName) {
                    console.warn(`User with email ${userEmail} already exists with auth_provider ${existingUserByEmail.auth_provider}. Current attempt with ${providerName}.`);
                    const errorRedirectUrl = new URL(env.APP_BASE_URL || '/');
                    errorRedirectUrl.searchParams.set('authError', 'email_exists_different_provider');
                    return Response.redirect(errorRedirectUrl.toString(), 302);
                }
            }

            const newUserResult = await env.DB.prepare(
              'INSERT INTO Users (email, username, auth_provider, provider_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, email, username'
            ).bind(userEmail, usernameSuggestion, providerName, providerUserId).first<User | null>();
            
            if (!newUserResult) {
              return new Response('Failed to create OAuth user in database', { status: 500 });
            }
            appUser = newUserResult;
          }
          
          if (!appUser) { 
            return new Response('User processing failed unexpectedly for OAuth user', { status: 500 });
          }

          const sessionPayload: SessionJwtPayload = { userId: appUser.id, email: appUser.email, iat: Math.floor(Date.now() / 1000) };
          const sessionJwt = await new SignJWT(sessionPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRATION)
            .sign(await getJwtSecret(env));

          const headers = new Headers({ Location: env.APP_BASE_URL || '/' }); 
          const cookieOptions = `HttpOnly; Path=/; Max-Age=${24*60*60}; SameSite=Lax; Secure=${url.protocol === 'https:'}`;
          headers.append('Set-Cookie', `${JWT_COOKIE_NAME}=${sessionJwt}; ${cookieOptions}`);
          
          headers.append('Set-Cookie', 'oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
          headers.append('Set-Cookie', 'oauth_code_verifier=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
          headers.append('Set-Cookie', 'oauth_nonce=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');

          return new Response(null, { status: 302, headers });
        }
        // Fallthrough for unsupported OAuth action
        return new Response('Unsupported OAuth action', { status: 400 }); 

      } catch (error: any) {
        console.error('OAuth error:', error.message, error.stack, error.cause);
        const errorRedirectUrl = new URL(env.APP_BASE_URL || '/');
        errorRedirectUrl.pathname = '/login'; 
        errorRedirectUrl.searchParams.set('authError', 'oauth_failed');
        return Response.redirect(errorRedirectUrl.toString(), 302);
      }
    }

    // Pass through to next handler - this allows chaining with other modules
    return new Response('Not Found', { status: 404 });
  }
};
