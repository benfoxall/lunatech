interface Tracker {
  _id: string;
  _type: string;
  _version: string;
}

export function trackerListPage(trackers: Tracker[]): string {
  const trackerCards = trackers.map(tracker => `
    <div class="tracker-card">
      <div class="tracker-info">
        <div class="tracker-id">${tracker._id}</div>
        <div class="tracker-meta">
          <span>${tracker._type}</span>
          <span class="separator">•</span>
          <span>v${tracker._version}</span>
        </div>
      </div>
      <a href="/tracker/${tracker._id}" class="view-button">
        view →
      </a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trackers - Lunatech</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Roboto Mono', monospace;
      line-height: 1.6;
      color: #e4e4e7;
      background: #09090b;
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .header {
      max-width: 1200px;
      margin: 0 auto 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #27272a;
    }
    
    h1 {
      font-size: 1.5em;
      color: #fafafa;
      font-weight: 500;
    }
    
    .subtitle {
      color: #71717a;
      font-size: 0.9em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .tracker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }
    
    .tracker-card {
      background: #18181b;
      border: 1px solid #27272a;
      padding: 20px;
      transition: border-color 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .tracker-card:hover {
      border-color: #3f3f46;
    }
    
    .tracker-info {
      flex-grow: 1;
    }
    
    .tracker-id {
      color: #fafafa;
      margin-bottom: 6px;
      font-size: 0.95em;
    }
    
    .tracker-meta {
      color: #71717a;
      font-size: 0.85em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .separator {
      margin: 0 8px;
    }
    
    .view-button {
      display: inline-block;
      padding: 8px 16px;
      background: #27272a;
      color: #fafafa;
      text-decoration: none;
      border: 1px solid #3f3f46;
      font-size: 0.85em;
      transition: all 0.2s;
    }
    
    .view-button:hover {
      background: #3f3f46;
      border-color: #52525b;
    }
    
    .nav-links {
      display: flex;
      gap: 16px;
      font-size: 0.85em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .back-link {
      color: #71717a;
      text-decoration: none;
    }
    
    .back-link:hover {
      color: #a1a1aa;
    }
    
    .logout-link {
      color: #71717a;
      text-decoration: none;
    }
    
    .logout-link:hover {
      color: #fca5a5;
    }
    
    .empty-state {
      background: #18181b;
      border: 1px solid #27272a;
      padding: 48px 32px;
      text-align: center;
    }
    
    .empty-state h2 {
      color: #fafafa;
      margin-bottom: 12px;
    }
    
    .empty-state p {
      color: #71717a;
      font-size: 0.95em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>trackers</h1>
      <p class="subtitle">${trackers.length} device${trackers.length !== 1 ? 's' : ''} connected</p>
    </div>
    <div class="nav-links">
      <a href="/" class="back-link">← home</a>
      <a href="/logout" class="logout-link">logout</a>
    </div>
  </div>
  
  <div class="container">
    ${trackers.length > 0 ? `
      <div class="tracker-grid">
        ${trackerCards}
      </div>
    ` : `
      <div class="empty-state">
        <h2>no trackers found</h2>
        <p>No devices associated with this account</p>
      </div>
    `}
  </div>
</body>
</html>`;
}
