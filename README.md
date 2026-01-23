# Lunatech - Tractive Pet Tracker Visualization

Lunatech is a modern web application that connects to your Tractive pet tracker and transforms location data into beautiful, interactive visualizations.

## Features

- **View Movement Patterns**: See where your pet spends most of their time with heat maps
- **Track Activity Over Time**: Analyze daily and hourly activity patterns  
- **Multiple Trackers**: Manage and view data for all your pets in one place
- **Historical Data**: Access up to 120 days of location history
- **Offline Support**: IndexedDB caching for viewing data without network
- **No CDN Dependencies**: All frontend dependencies bundled locally

## Architecture

### Modern Frontend Stack
- **React 19** with TypeScript for UI components
- **Vite** for blazing-fast development and optimized production builds
- **D3.js** for powerful data visualizations (locally bundled)
- **IndexedDB** for client-side caching and offline support
- **Centralized DataStore** for state management and API synchronization

### Backend
- **Cloudflare Workers** for edge computing
- **Hono** web framework for routing and middleware
- **Workers Sites** for serving static assets globally

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

#### Frontend Development (Recommended)
For rapid UI development with hot module replacement:

```bash
npm run dev:frontend
```

Visit `http://localhost:5173`

#### Full-Stack Development
Build frontend and start Workers dev server:

```bash
npm run build
npm run dev
```

Visit `http://localhost:8787`

**Note**: Due to a Wrangler limitation, static assets don't serve correctly in local dev. Use the frontend dev server for UI work, or deploy to preview for testing.

### Building for Production

```bash
npm run build
```

This compiles the React app, bundles all dependencies, and prepares assets for deployment.

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Deploy to preview environment:

```bash
npx wrangler deploy --env preview
```

### Usage

1. Visit the homepage to learn about the app
2. Click "Get Started" to authenticate
3. Enter your Tractive email and password in the login form
4. The app will create a secure session cookie with your Tractive API token
5. View your list of trackers
6. Click on a tracker to see the movement dashboard with:
   - Interactive heatmap of location data
   - Timeline chart with date brushing
   - Time-of-day activity chart
7. Use the logout link to end your session

### Testing with Demo Credentials

For development and testing, use the provided test credentials:
- See `AGENTS.md` for detailed testing instructions
- Test credentials are available as environment variables

## Project Structure

```
lunatech/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components (Dashboard, Heatmap, etc.)
│   │   ├── store/         # Centralized DataStore with IndexedDB
│   │   ├── types/         # TypeScript type definitions
│   │   └── main.tsx       # Application entry point
│   └── index.html         # HTML template
├── src/                   # Cloudflare Workers backend
│   ├── views/             # Server-rendered page templates
│   └── worker.ts          # Main worker entry point
├── lib/                   # Shared libraries (TractiveClient, etc.)
├── public/                # Built frontend assets (generated)
└── AGENTS.md              # Developer guide with detailed instructions
```

## Documentation

- **[AGENTS.md](AGENTS.md)** - Comprehensive developer guide including:
  - Architecture overview and decisions
  - Setup and installation
  - Development workflow
  - Testing with Tractive credentials
  - Building and deployment
  - Troubleshooting common issues

## Key Improvements

This version includes major architectural improvements:

✅ **No CDN Dependencies** - All frontend libraries bundled locally  
✅ **Modern Build System** - Vite for fast development and optimized builds  
✅ **Centralized Data Store** - Single source of truth with IndexedDB caching  
✅ **React Components** - Modular, reusable visualization components  
✅ **Type Safety** - Full TypeScript support throughout  
✅ **Offline Support** - IndexedDB caching enables offline viewing  
✅ **Preview Deployments** - Configured for Cloudflare preview URLs  

## Authentication & Security

The app uses a secure session-based authentication flow:

1. **Login**: Users submit their Tractive credentials via a POST form (not HTTP Basic Auth)
2. **Token Storage**: The Tractive API returns an access token and user ID
3. **Session Cookie**: The token is stored in an HTTP-only, secure cookie
4. **Subsequent Requests**: All API calls use the session cookie (no credentials in URLs)
5. **Logout**: Users can explicitly end their session, which deletes the cookie

**Security Features**:
- ✅ No credentials in URLs or query parameters
- ✅ HTTP-only cookies prevent XSS access
- ✅ Secure flag ensures HTTPS-only transmission
- ✅ SameSite protection against CSRF
- ✅ Session tokens expire after 7 days
- ✅ XSS protection for embedded JSON data

**For Enhanced Production Security**:
- Use Cloudflare Workers KV or Durable Objects for server-side session storage
- Implement CSRF token validation
- Add rate limiting on login attempts
- Enable Cloudflare's Bot Management

---

# Getting Data (Legacy Scripts)

## Fetch from tractive API

Pull locations from the tractive API and write them to `trackers/TRACKER.json`

```bash
export TRACTIVE_EMAIL=`op read "op://Personal/Tractive/username"`
export TRACTIVE_PASSWORD=`op read "op://Personal/Tractive/password"`

node ./scripts/populate.ts

# Requesting: ABCDEFG
# Wrote: trackers/ABCDEFG.json
```

## Process API output

```bash
node ./scripts/convert.ts trackers/TRACKER.json locations.json
```
