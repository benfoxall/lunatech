export function homePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>track</title>
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
      padding: 80px 40px;
      font-size: 15px;
      letter-spacing: -0.01em;
    }
    
    .container {
      max-width: 720px;
    }
    
    h1 {
      font-size: 3.5em;
      color: #fafafa;
      margin-bottom: 24px;
      font-weight: 300;
      letter-spacing: -0.04em;
    }
    
    .description {
      margin-bottom: 60px;
      font-size: 1.05em;
      color: #a1a1aa;
      max-width: 600px;
      line-height: 1.8;
    }
    }
    
    .cta-button {
      display: inline-block;
      padding: 14px 0;
      color: #fafafa;
      text-decoration: none;
      font-size: 1em;
      font-weight: 400;
      transition: color 0.2s;
      border-bottom: 1px solid #3f3f46;
    }
    
    .cta-button:hover {
      color: #71717a;
      border-bottom-color: #71717a;
    }
    
    .footer {
      margin-top: 120px;
      color: #52525b;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>track</h1>
    
    <div class="description">
      <p>
        Visualize Tractive pet tracker location data through interactive heatmaps, 
        timelines, and activity charts.
      </p>
    </div>
    
    <a href="/auth" class="cta-button">authenticate →</a>
    
    <div class="footer">
      <p>track.benjaminbenben.com • session-based auth • no credential storage</p>
    </div>
  </div>
</body>
</html>`;
}
