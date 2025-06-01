// Test worker to isolate the import issue
import { Hono } from 'hono';

const app = new Hono();

app.get('/test', (c) => {
  return c.json({ message: 'Test successful' });
});

export default app;
