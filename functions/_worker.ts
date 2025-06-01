// Cloudflare Worker entry point
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import auth from './auth';
import { createCoursesModule } from './courses';

function createApp() {
  const app = new Hono<{ Bindings: Env }>();

  // CORS middleware
  app.use('/api/*', cors({
    origin: (origin, c) => {
      const env = c.env;
      if (origin === env.APP_BASE_URL || origin?.includes('localhost') || origin?.includes('127.0.0.1')) {
        return origin;
      }
      return null;
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }));

  // Mount authentication routes
  app.route('/api/auth', auth);

  // Mount courses routes  
  app.route('/api/courses', createCoursesModule());

  // Health check endpoint
  app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler for API routes
  app.notFound((c) => {
    return c.json({ error: 'API endpoint not found' }, 404);
  });

  return app;
}

export default createApp();
