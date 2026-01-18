# Lunatech - Tractive Pet Tracker Visualization

Lunatech is a web application that connects to your Tractive pet tracker and transforms location data into beautiful, interactive visualizations.

## Features

- **View Movement Patterns**: See where your pet spends most of their time with heat maps
- **Track Activity Over Time**: Analyze daily and hourly activity patterns
- **Multiple Trackers**: Manage and view data for all your pets in one place
- **Historical Data**: Access up to 120 days of location history

## Running the Web App

### Development

```bash
npm install
npm run dev
```

The app will be available at http://localhost:8787

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Usage

1. Visit the homepage to learn about the app
2. Click "Get Started" to authenticate
3. Enter your Tractive credentials when prompted (HTTP Basic Auth)
4. View your list of trackers
5. Click on a tracker to see the movement dashboard

## Security Notice

⚠️ **Current Implementation**: This proof-of-concept passes credentials via query parameters for simplicity. This is **not secure for production use** as credentials can be exposed in browser history, server logs, and referrer headers.

**For Production**: Implement proper session management using:
- Encrypted session cookies
- Cloudflare Workers KV or Durable Objects for session storage
- Token-based authentication
- HTTPS enforcement

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
