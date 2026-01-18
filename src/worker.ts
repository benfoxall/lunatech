import { Hono } from 'hono';
import { TractiveClient } from '../lib/TractiveClient.ts';
import { homePage } from './views/home.ts';
import { trackerListPage } from './views/trackerList.ts';
import { dashboardPage } from './views/dashboard.ts';

const app = new Hono();

// Helper to parse Basic Auth header
function parseBasicAuth(authHeader: string | null): { email: string; password: string } | null {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }
  
  const base64 = authHeader.slice(6);
  const decoded = atob(base64);
  const [email, password] = decoded.split(':');
  
  if (!email || !password) {
    return null;
  }
  
  return { email, password };
}

// Homepage route
app.get('/', (c) => {
  return c.html(homePage());
});

// Auth endpoint - requests HTTP Basic Auth and generates token
app.get('/auth', async (c) => {
  const authHeader = c.req.header('Authorization');
  const credentials = parseBasicAuth(authHeader);
  
  if (!credentials) {
    // Request HTTP Basic Auth
    return c.text('Authentication required', 401, {
      'WWW-Authenticate': 'Basic realm="Tractive Login"'
    });
  }
  
  try {
    const client = new TractiveClient();
    await client.login(credentials.email, credentials.password);
    
    // Get trackers for the user
    const trackers = await client.getTrackers();
    
    // Store credentials in a cookie (in production, use encrypted session storage)
    // For now, we'll redirect to the tracker list with auth info
    return c.html(trackerListPage(trackers, credentials.email, credentials.password));
  } catch (error) {
    console.error('Authentication failed:', error);
    return c.text('Authentication failed. Please check your credentials.', 401, {
      'WWW-Authenticate': 'Basic realm="Tractive Login"'
    });
  }
});

// Tracker list endpoint
app.get('/trackers', async (c) => {
  const email = c.req.query('email');
  const password = c.req.query('password');
  
  if (!email || !password) {
    return c.redirect('/auth');
  }
  
  try {
    const client = new TractiveClient();
    await client.login(email, password);
    const trackers = await client.getTrackers();
    
    return c.html(trackerListPage(trackers, email, password));
  } catch (error) {
    console.error('Failed to fetch trackers:', error);
    return c.text('Failed to fetch trackers', 500);
  }
});

// Dashboard for specific tracker
app.get('/tracker/:trackerId', async (c) => {
  const trackerId = c.req.param('trackerId');
  const email = c.req.query('email');
  const password = c.req.query('password');
  
  if (!email || !password) {
    return c.redirect('/auth');
  }
  
  try {
    const client = new TractiveClient();
    await client.login(email, password);
    
    // Fetch positions for the last 120 days
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 120);
    
    const positions = await client.getPositions(trackerId, from, to);
    
    return c.html(dashboardPage(trackerId, positions, email, password));
  } catch (error) {
    console.error('Failed to fetch tracker data:', error);
    return c.text('Failed to fetch tracker data', 500);
  }
});

// API endpoint to get positions data (for AJAX requests)
app.get('/api/tracker/:trackerId/positions', async (c) => {
  const trackerId = c.req.param('trackerId');
  const email = c.req.query('email');
  const password = c.req.query('password');
  
  if (!email || !password) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  
  try {
    const client = new TractiveClient();
    await client.login(email, password);
    
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 120);
    
    const positions = await client.getPositions(trackerId, from, to);
    
    return c.json(positions);
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return c.json({ error: 'Failed to fetch positions' }, 500);
  }
});

export default app;
