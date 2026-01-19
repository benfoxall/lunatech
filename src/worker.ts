import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { TractiveClient } from '../lib/TractiveClient.ts';
import { homePage } from './views/home.ts';
import { loginPage } from './views/login.ts';
import { trackerListPage } from './views/trackerList.ts';
import { dashboardPage } from './views/dashboard.ts';

const app = new Hono();

// Configuration
const DEFAULT_HISTORY_DAYS = 120;
const COOKIE_NAME = 'tractive_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Session data structure
interface SessionData {
  user_id: string;
  access_token: string;
  expires_at: number;
}

// Helper to get session from cookie
function getSession(c: any): SessionData | null {
  const sessionCookie = getCookie(c, COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie) as SessionData;
    
    // Check if token is expired
    if (session.expires_at && session.expires_at < Date.now() / 1000) {
      return null;
    }
    
    return session;
  } catch (error) {
    return null;
  }
}

// Helper to create authenticated client from session
function getAuthenticatedClient(session: SessionData): TractiveClient {
  const client = new TractiveClient();
  // Set the auth response directly on the client
  (client as any).authResponse = {
    user_id: session.user_id,
    access_token: session.access_token,
    expires_at: session.expires_at,
    client_id: '', // Not needed for authenticated requests
  };
  return client;
}

// Homepage route
app.get('/', (c) => {
  return c.html(homePage());
});

// Login page - GET shows form
app.get('/auth', (c) => {
  // If already authenticated, redirect to trackers
  const session = getSession(c);
  if (session) {
    return c.redirect('/trackers');
  }
  
  return c.html(loginPage());
});

// Login handler - POST processes credentials
app.post('/auth', async (c) => {
  const body = await c.req.parseBody();
  const email = body.email as string;
  const password = body.password as string;
  
  if (!email || !password) {
    return c.html(loginPage('Please provide both email and password'));
  }
  
  try {
    const client = new TractiveClient();
    await client.login(email, password);
    
    // Get the auth response from the client
    const authResponse = (client as any).authResponse;
    
    if (!authResponse) {
      throw new Error('Authentication failed');
    }
    
    // Create session data
    const sessionData: SessionData = {
      user_id: authResponse.user_id,
      access_token: authResponse.access_token,
      expires_at: authResponse.expires_at,
    };
    
    // Store session in cookie
    setCookie(c, COOKIE_NAME, JSON.stringify(sessionData), {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
    });
    
    // Redirect to trackers page
    return c.redirect('/trackers');
  } catch (error) {
    console.error('Authentication failed:', error);
    return c.html(loginPage('Authentication failed. Please check your credentials.'));
  }
});

// Logout endpoint
app.get('/logout', (c) => {
  deleteCookie(c, COOKIE_NAME);
  return c.redirect('/');
});

// Tracker list endpoint
app.get('/trackers', async (c) => {
  const session = getSession(c);
  
  if (!session) {
    return c.redirect('/auth');
  }
  
  try {
    const client = getAuthenticatedClient(session);
    const trackers = await client.getTrackers();
    
    return c.html(trackerListPage(trackers));
  } catch (error) {
    console.error('Failed to fetch trackers:', error);
    // Token might be expired, redirect to login
    deleteCookie(c, COOKIE_NAME);
    return c.redirect('/auth');
  }
});

// Dashboard for specific tracker
app.get('/tracker/:trackerId', async (c) => {
  const trackerId = c.req.param('trackerId');
  const session = getSession(c);
  
  if (!session) {
    return c.redirect('/auth');
  }
  
  try {
    const client = getAuthenticatedClient(session);
    
    // Fetch positions for the configured history period
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - DEFAULT_HISTORY_DAYS);
    
    const positions = await client.getPositions(trackerId, from, to);
    
    return c.html(dashboardPage(trackerId, positions));
  } catch (error) {
    console.error('Failed to fetch tracker data:', error);
    // Token might be expired, redirect to login
    deleteCookie(c, COOKIE_NAME);
    return c.redirect('/auth');
  }
});

// API endpoint to get positions data (for AJAX requests)
app.get('/api/tracker/:trackerId/positions', async (c) => {
  const trackerId = c.req.param('trackerId');
  const session = getSession(c);
  
  if (!session) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  
  try {
    const client = getAuthenticatedClient(session);
    
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - DEFAULT_HISTORY_DAYS);
    
    const positions = await client.getPositions(trackerId, from, to);
    
    return c.json(positions);
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return c.json({ error: 'Failed to fetch positions' }, 500);
  }
});

export default app;
