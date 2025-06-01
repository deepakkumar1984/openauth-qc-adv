// Authentication routes with custom OAuth implementation
import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import * as bcrypt from 'bcryptjs';
import { Env, User } from './types';
import { OAuthManager } from './openauth';

const auth = new Hono<{ Bindings: Env }>();

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM Users WHERE email = ?1 OR username = ?2'
    ).bind(email, username).first();

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await c.env.DB.prepare(
      `INSERT INTO Users (email, username, hashed_password, auth_provider, created_at, updated_at) 
       VALUES (?1, ?2, ?3, 'email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, email, username`
    ).bind(email, username, hashedPassword).first<User | null>();

    if (!result) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    // Generate session token and set cookie
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await c.env.DB.prepare(
      `INSERT INTO Sessions (user_id, token, expires_at, created_at) 
       VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)`
    ).bind(result.id, sessionToken, expires.toISOString()).run();

    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      expires,
    });

    return c.json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        username: result.username,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, hashed_password FROM Users WHERE email = ?1 AND auth_provider = "email"'
    ).bind(email).first<User & { hashed_password: string } | null>();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate session token and set cookie
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await c.env.DB.prepare(
      `INSERT INTO Sessions (user_id, token, expires_at, created_at) 
       VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)`
    ).bind(user.id, sessionToken, expires.toISOString()).run();

    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      expires,
    });

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Logout endpoint
auth.post('/logout', async (c) => {
  try {
    const sessionToken = getCookie(c, 'session');

    if (sessionToken) {
      // Delete session from database
      await c.env.DB.prepare(
        'DELETE FROM Sessions WHERE token = ?1'
      ).bind(sessionToken).run();
    }

    // Clear session cookie
    deleteCookie(c, 'session');

    return c.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Current user endpoint
auth.get('/me', async (c) => {
  try {
    const sessionToken = getCookie(c, 'session');

    if (!sessionToken) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    // Find valid session
    const session = await c.env.DB.prepare(
      `SELECT s.user_id, u.id, u.email, u.username 
       FROM Sessions s 
       JOIN Users u ON s.user_id = u.id 
       WHERE s.token = ?1 AND s.expires_at > CURRENT_TIMESTAMP`
    ).bind(sessionToken).first<User | null>();

    if (!session) {
      // Session expired or invalid, clear cookie
      deleteCookie(c, 'session');
      return c.json({ error: 'Session expired' }, 401);
    }

    return c.json({
      user: {
        id: session.id,
        email: session.email,
        username: session.username,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// OAuth: Start authentication flow
auth.get('/oauth/:provider', async (c) => {
  try {
    const provider = c.req.param('provider');
    const oauthManager = new OAuthManager(c.env);
    
    // Get redirect URI from query params or use default
    const baseUrl = new URL(c.req.url).origin;
    const redirectUri = `${baseUrl}/api/auth/oauth/${provider}/callback`;
    
    const authUrl = await oauthManager.generateAuthUrl(provider, redirectUri);
    
    return c.redirect(authUrl);
  } catch (error) {
    console.error(`OAuth ${c.req.param('provider')} error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'OAuth initialization failed';
    return c.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }
});

// OAuth: Handle callback
auth.get('/oauth/:provider/callback', async (c) => {
  try {
    const provider = c.req.param('provider');
    const code = c.req.query('code');
    const state = c.req.query('state');
    const error = c.req.query('error');
    
    // Handle OAuth errors
    if (error) {
      const errorDescription = c.req.query('error_description') || 'OAuth authentication failed';
      return c.redirect(`/login?error=${encodeURIComponent(errorDescription)}`);
    }
    
    if (!code || !state) {
      return c.redirect('/login?error=Missing OAuth parameters');
    }
    
    const oauthManager = new OAuthManager(c.env);
    const baseUrl = new URL(c.req.url).origin;
    const redirectUri = `${baseUrl}/api/auth/oauth/${provider}/callback`;
    
    // Handle the OAuth callback
    const user = await oauthManager.handleCallback(provider, code, state, redirectUri);
    
    // Generate session token and set cookie
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await c.env.DB.prepare(
      `INSERT INTO Sessions (user_id, token, expires_at, created_at) 
       VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)`
    ).bind(user.id, sessionToken, expires.toISOString()).run();

    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      expires,
    });

    // Redirect to dashboard or intended page
    return c.redirect('/dashboard');
  } catch (error) {
    console.error(`OAuth ${c.req.param('provider')} callback error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'OAuth authentication failed';
    return c.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }
});

export default auth;
