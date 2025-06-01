// Shared utilities for authentication
import { getCookie, deleteCookie } from 'hono/cookie';


// Auth middleware to verify database-backed session
export async function authMiddleware(c: any, next: any) {
  const sessionToken = getCookie(c, 'session'); // Use 'session' cookie name
  
  if (!sessionToken) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    // Find valid session in the database
    const query = await c.env.DB.prepare(
      `SELECT s.user_id, u.email 
       FROM Sessions s 
       JOIN Users u ON s.user_id = u.id 
       WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP`
    ).bind(sessionToken);
    
    const sessionAndUser = await query.first() as { user_id: number; email: string } | null;

    if (!sessionAndUser) {
      deleteCookie(c, 'session'); // Clear invalid or expired session cookie
      return c.json({ error: 'Invalid or expired session' }, 401);
    }

    c.set('userId', sessionAndUser.user_id);
    c.set('userEmail', sessionAndUser.email);
    await next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    // It's good practice to also clear the cookie if an unexpected error occurs
    deleteCookie(c, 'session'); 
    return c.json({ error: 'Internal server error during authentication' }, 500);
  }
}
