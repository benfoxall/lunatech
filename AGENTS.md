# Lunatech Development Guide

This document provides comprehensive instructions for developers working on Lunatech, including setup, architecture, testing, and credential management.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Setup & Installation](#setup--installation)
- [Development Workflow](#development-workflow)
- [Testing with Tractive Credentials](#testing-with-tractive-credentials)
- [Building & Deployment](#building--deployment)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

### Frontend Architecture

Lunatech uses a modern, structured frontend architecture:

- **Build System**: Vite for fast development and optimized production builds
- **UI Framework**: React 19 with TypeScript
- **Data Visualization**: D3.js and d3-hexbin (locally bundled, no CDN dependencies)
- **State Management**: Centralized DataStore with IndexedDB caching and API sync
- **Styling**: CSS with modern design system

### Backend Architecture

- **Framework**: Hono (lightweight web framework for Cloudflare Workers)
- **Runtime**: Cloudflare Workers (edge computing)
- **Session Management**: Secure HTTP-only cookies
- **API Integration**: Tractive API client for pet tracker data

### Data Flow

```
User Browser
    ↓
React Components
    ↓
DataStore (Singleton)
    ↓
IndexedDB ← → API Endpoints ← → Tractive API
```

The DataStore abstracts all data loading:
- Checks IndexedDB cache first (1-hour TTL)
- Falls back to API if cache miss or expired
- Notifies subscribers of data changes
- Handles authentication and error states

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Wrangler CLI (installed as dev dependency)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/benfoxall/lunatech.git
   cd lunatech
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

## Development Workflow

### Frontend Development

The frontend code lives in `frontend/src/`:

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard orchestrator
│   │   ├── Heatmap.tsx        # Geographic heatmap visualization
│   │   ├── Timeline.tsx       # Date-based timeline with brushing
│   │   └── TimeOfDayChart.tsx # Hourly activity chart
│   ├── store/
│   │   └── DataStore.ts       # Centralized data store
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
└── index.html                 # HTML template
```

### Development Servers

#### Option 1: Frontend-Only Development (Recommended for UI work)

Run Vite dev server with hot module replacement:

```bash
npm run dev:frontend
```

This starts Vite on `http://localhost:5173` with:
- Hot Module Replacement (HMR)
- Fast refresh for React
- Source maps for debugging

**Note**: API calls will need to be proxied or mocked in this mode. To use real API data, you need to:
1. First authenticate by starting the full-stack server (Option 2) and logging in
2. Copy the session cookie
3. Use a browser extension or proxy to add the cookie when testing on `localhost:5173`

#### Option 2: Full-Stack Development

**Known Limitation**: Static asset serving via Cloudflare Workers Sites is currently not working in local development mode. This is a known issue with Wrangler's local dev server and Workers Sites configuration.

**Workaround for Testing**:

Until the Workers Sites issue is resolved, use this approach:

1. Deploy to Cloudflare preview environment:
   ```bash
   npm run build
   npx wrangler deploy --env preview
   ```

2. Access the preview URL (will be shown after deployment)

3. Test with Tractive credentials there

**Alternative**: For rapid frontend development, use Option 1 (Vite dev server) which works perfectly for UI changes.

### Making Changes

#### To modify visualizations:

1. Edit components in `frontend/src/components/`
2. Components use React hooks and D3.js
3. Data flows from DataStore via subscription pattern
4. Test in frontend dev server (`npm run dev:frontend`)
5. Rebuild and test full stack (`npm run build && npm run dev`)

#### To modify data store:

1. Edit `frontend/src/store/DataStore.ts`
2. The store provides:
   - `loadPositions(trackerId)` - Main data loading method
   - `subscribe(callback)` - Subscribe to data changes
   - `clearCache()` - Clear all cached data
3. Uses IndexedDB for client-side caching
4. Automatically syncs with `/api/tracker/:trackerId/positions`

#### To modify backend routes:

1. Edit `src/worker.ts`
2. Add new routes using Hono's routing:
   ```typescript
   app.get('/new-route', async (c) => {
     // Your logic here
   });
   ```
3. Test with `npm run dev`

## Testing with Tractive Credentials

### Available Test Credentials

Lunatech includes test credentials for development and CI/CD:

```bash
# Available as environment variables
TRACTIVE_TEST_EMAIL=benfoxall@gmail.com
TRACTIVE_TEST_PASSWORD=yxQuX67Xcwng3qqn4K4P
```

### How to Use Test Credentials

#### Local Development Testing

1. Start the development server:
   ```bash
   npm run build
   npm run dev
   ```

2. Navigate to `http://localhost:8787`

3. Click "Get Started" → "Login"

4. Enter the test credentials:
   - Email: `benfoxall@gmail.com`
   - Password: `yxQuX67Xcwng3qqn4K4P`

5. You'll be redirected to the tracker list and can view real tracking data

#### Automated Testing

If you want to write automated tests:

```javascript
// Example test setup
const testAuth = {
  email: process.env.TRACTIVE_TEST_EMAIL,
  password: process.env.TRACTIVE_TEST_PASSWORD
};

// Use in your test framework
describe('Tractive Integration', () => {
  it('should authenticate successfully', async () => {
    const response = await fetch('http://localhost:8787/auth', {
      method: 'POST',
      body: new URLSearchParams(testAuth)
    });
    expect(response.status).toBe(302); // Redirect on success
  });
});
```

#### Legacy Script Testing

The repository includes legacy scripts that can use the credentials:

```bash
export TRACTIVE_EMAIL=$TRACTIVE_TEST_EMAIL
export TRACTIVE_PASSWORD=$TRACTIVE_TEST_PASSWORD

# Fetch data directly from Tractive API
node ./scripts/populate.ts

# Process the data
node ./scripts/convert.ts trackers/TRACKER.json locations.json
```

### Understanding the Test Account

- **Purpose**: Development and testing only
- **Data**: Contains real tracker data from test devices
- **Limitations**: Do not use in production or share publicly
- **Security**: Credentials are scoped to this development environment

## Building & Deployment

### Build Process

The build process compiles the frontend and prepares it for deployment:

```bash
npm run build
```

This:
1. Runs Vite to build React app
2. Bundles all dependencies (D3, React, etc.)
3. Generates optimized assets in `public/`
4. Creates cache-busting hashed filenames
5. Generates a manifest for asset references

Output structure:
```
public/
├── .vite/
│   └── manifest.json          # Asset manifest
├── assets/
│   ├── main-[hash].js         # Bundled JavaScript
│   └── main-[hash].css        # Bundled CSS
└── index.html                 # Built HTML
```

### Deployment to Cloudflare

#### Prerequisites

1. Cloudflare account
2. Wrangler authenticated: `npx wrangler login`

#### Deploy to Production

```bash
npm run deploy
```

This:
1. Builds the frontend (`npm run build`)
2. Deploys to Cloudflare Workers
3. Uploads assets to Cloudflare
4. Updates routes and configuration

#### Deploy to Preview

Preview deployments are useful for testing before production:

```bash
npx wrangler deploy --env preview
```

Configuration in `wrangler.toml`:
```toml
[env.preview]
name = "lunatech-preview"
```

Preview URLs are automatically generated by Cloudflare Workers and follow the pattern:
- `lunatech-preview.[subdomain].workers.dev`

### Cloudflare Configuration

The `wrangler.toml` file configures Cloudflare Workers:

```toml
# Static asset serving
[assets]
directory = "public"
binding = "ASSETS"

# Preview environment
[env.preview]
name = "lunatech-preview"
```

Key settings:
- **assets.directory**: Serves built frontend from `public/`
- **env.preview**: Separate environment for preview deployments
- **routes**: Custom domain configuration

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Problem**: TypeScript or Node can't find imported modules.

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. Build fails with Vite errors

**Problem**: Vite can't build the frontend.

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

#### 3. Assets not loading in local development

**Problem**: JavaScript/CSS files return 404 in `wrangler dev`.

**Root Cause**: Cloudflare Workers Sites KV binding doesn't populate correctly in local development mode with Wrangler 4.x.

**Solution**: 
- For frontend development: Use `npm run dev:frontend` (Vite dev server)
- For full-stack testing: Deploy to preview environment (`npx wrangler deploy --env preview`)
- Production deployments work correctly with Workers Sites

#### 4. Assets not loading in production

**Problem**: JavaScript/CSS files return 404.

**Solution**:
- Check `public/` directory exists and contains assets
- Verify `wrangler.toml` has `[assets]` configuration
- Update asset hashes in `src/views/dashboardReact.ts` if needed
- Redeploy: `npm run deploy`

#### 4. Preview URLs not working

**Problem**: Cloudflare preview deployments don't generate URLs.

**Solution**:
- Ensure `[env.preview]` is configured in `wrangler.toml`
- Deploy specifically to preview: `npx wrangler deploy --env preview`
- Check Cloudflare dashboard for the generated preview URL

#### 5. Authentication fails with test credentials

**Problem**: Can't login with test credentials.

**Solution**:
- Verify environment variables are set
- Check network connectivity
- Tractive API may be down (check status)
- Session cookie may be blocked (check browser settings)

#### 6. Data not loading in dashboard

**Problem**: Dashboard shows "Loading..." indefinitely.

**Solution**:
- Open browser DevTools → Network tab
- Check if `/api/tracker/:id/positions` returns 200
- Check if session cookie is present
- Verify tracker ID is correct
- Clear IndexedDB cache: `dataStore.clearCache()`

#### 7. IndexedDB errors

**Problem**: "Failed to open database" or quota exceeded.

**Solution**:
```javascript
// Clear IndexedDB in browser console
indexedDB.deleteDatabase('lunatech_db');
// Then refresh the page
```

### Debug Mode

Enable verbose logging:

```typescript
// In frontend/src/store/DataStore.ts
const DEBUG = true;

// Add logging
if (DEBUG) console.log('Loading positions for', trackerId);
```

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for errors
2. Check Cloudflare Workers logs: `npx wrangler tail`
3. Review recent commits for breaking changes
4. Open an issue on GitHub with:
   - Steps to reproduce
   - Error messages
   - Browser and Node versions

## Architecture Decisions

### Why Vite?

- **Fast**: Uses esbuild for blazing-fast builds
- **Modern**: First-class TypeScript and React support
- **Simple**: Minimal configuration needed
- **Developer Experience**: HMR, source maps, great error messages

### Why React?

- **Familiarity**: Large ecosystem and community
- **Hooks**: Modern patterns for state and effects
- **Performance**: Virtual DOM for efficient updates
- **TypeScript**: Excellent type definitions

### Why DataStore Pattern?

- **Single Source of Truth**: All components use same data
- **Caching**: Reduces API calls and improves performance
- **Offline Support**: IndexedDB enables offline viewing
- **Observable**: Components auto-update when data changes

### Why IndexedDB?

- **Capacity**: Can store large datasets (50MB+)
- **Performance**: Faster than LocalStorage
- **Structure**: Supports complex data structures
- **Async**: Non-blocking I/O

### Why Cloudflare Workers?

- **Edge Computing**: Deploy globally, run near users
- **Serverless**: No infrastructure to manage
- **Cost**: Generous free tier
- **Performance**: Fast cold starts and execution

## Contributing

When contributing to Lunatech:

1. **Test Locally**: Use `npm run dev` to test changes
2. **Build Before Commit**: Ensure `npm run build` succeeds
3. **No CDN Dependencies**: All frontend deps must be bundled
4. **Type Safety**: Use TypeScript for all new code
5. **Follow Patterns**: Use DataStore for data, React hooks for state
6. **Document Changes**: Update this file for architecture changes

---

**Happy coding!** 🚀
