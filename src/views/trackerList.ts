interface Tracker {
  _id: string;
  _type: string;
  _version: string;
}

export function trackerListPage(trackers: Tracker[], email: string, password: string): string {
  const trackerCards = trackers.map(tracker => `
    <div class="tracker-card">
      <div class="tracker-icon">📍</div>
      <div class="tracker-info">
        <h3>Tracker ${tracker._id}</h3>
        <p class="tracker-type">Type: ${tracker._type}</p>
        <p class="tracker-version">Version: ${tracker._version}</p>
      </div>
      <a href="/tracker/${tracker._id}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}" class="view-button">
        View Dashboard →
      </a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Trackers - Lunatech</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 20px;
    }
    
    .header {
      max-width: 1200px;
      margin: 0 auto 40px;
      text-align: center;
    }
    
    h1 {
      font-size: 2.5em;
      color: #667eea;
      margin-bottom: 10px;
    }
    
    .subtitle {
      color: #666;
      font-size: 1.1em;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .tracker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .tracker-card {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .tracker-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
    }
    
    .tracker-icon {
      font-size: 3em;
      margin-bottom: 15px;
    }
    
    .tracker-info {
      flex-grow: 1;
      margin-bottom: 20px;
    }
    
    .tracker-info h3 {
      color: #333;
      margin-bottom: 10px;
      font-size: 1.3em;
    }
    
    .tracker-type,
    .tracker-version {
      color: #666;
      font-size: 0.9em;
      margin: 5px 0;
    }
    
    .view-button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    
    .view-button:hover {
      transform: scale(1.05);
    }
    
    .back-link {
      display: inline-block;
      margin-top: 20px;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .back-link:hover {
      text-decoration: underline;
    }
    
    .empty-state {
      background: white;
      border-radius: 15px;
      padding: 60px 30px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .empty-state h2 {
      color: #667eea;
      margin-bottom: 15px;
    }
    
    .empty-state p {
      color: #666;
      font-size: 1.1em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐾 Your Pet Trackers</h1>
    <p class="subtitle">Select a tracker to view movement data and statistics</p>
  </div>
  
  <div class="container">
    ${trackers.length > 0 ? `
      <div class="tracker-grid">
        ${trackerCards}
      </div>
    ` : `
      <div class="empty-state">
        <h2>No Trackers Found</h2>
        <p>It looks like you don't have any trackers associated with your account.</p>
      </div>
    `}
    
    <div style="text-align: center;">
      <a href="/" class="back-link">← Back to Home</a>
    </div>
  </div>
</body>
</html>`;
}
