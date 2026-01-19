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
3. Enter your Tractive email and password in the login form
4. The app will create a secure session cookie with your Tractive API token
5. View your list of trackers
6. Click on a tracker to see the movement dashboard
7. Use the logout link to end your session

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
