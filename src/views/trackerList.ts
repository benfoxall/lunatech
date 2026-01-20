interface Tracker {
  _id: string;
  _type: string;
  _version: string;
}

export function trackerListPage(trackers: Tracker[]): string {
  const trackerItems = trackers
    .map(
      (tracker) => `
    <div class="tracker-item">
      <a href="/tracker/${tracker._id}" class="tracker-link">
        <span class="tracker-id">${tracker._id}</span>
        <span class="tracker-meta">${tracker._type} • v${tracker._version}</span>
      </a>
    </div>
  `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>track • trackers</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', sans-serif;
      line-height: 1.7;
      color: #e4e4e7;
      background: #0a0a0a;
      min-height: 100vh;
      padding: 40px;
      font-size: 15px;
      letter-spacing: -0.01em;
    }
    
    .header {
      max-width: 900px;
      margin-bottom: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    h1 {
      font-size: 2em;
      color: #fafafa;
      font-weight: 300;
      letter-spacing: -0.02em;
    }
    
    .container {
      max-width: 900px;
    }
    
    .tracker-list {
      margin-bottom: 60px;
    }
    
    .tracker-item {
      margin-bottom: 2px;
    }
    
    .tracker-link {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 16px 0;
      color: #fafafa;
      text-decoration: none;
      transition: color 0.2s;
      border-bottom: 1px solid #18181b;
    }
    
    .tracker-link:hover {
      color: #71717a;
    }
    
    .tracker-link:hover .tracker-id {
      color: #71717a;
    }
    
    .tracker-id {
      font-size: 1em;
      transition: color 0.2s;
    }
    
    .tracker-meta {
      color: #52525b;
      font-size: 0.9em;
    }
    
    .nav-links {
      display: flex;
      gap: 24px;
      font-size: 0.9em;
    }
    
    .back-link {
      color: #52525b;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .back-link:hover {
      color: #71717a;
    }
    
    .logout-link {
      color: #52525b;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .logout-link:hover {
      color: #f87171;
    }
    
    .empty-state {
      padding: 60px 0;
      color: #52525b;
    }
    
    .empty-state h2 {
      font-size: 1em;
      font-weight: 300;
      margin-bottom: 8px;
      color: #71717a;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>trackers</h1>
    <div class="nav-links">
      <a href="/" class="back-link">← home</a>
      <a href="/logout" class="logout-link">logout</a>
    </div>
  </div>
  
  <div class="container">
    ${
      trackers.length > 0
        ? `
      <div class="tracker-list">
        ${trackerItems}
      </div>
    `
        : `
      <div class="empty-state">
        <h2>no trackers</h2>
        <p>no devices connected</p>
      </div>
    `
    }
  </div>
</body>
</html>`;
}
