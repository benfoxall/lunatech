export function homePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lunatech - Tractive Data Visualization</title>
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
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #18181b;
      border: 1px solid #27272a;
      padding: 48px;
    }
    
    h1 {
      font-size: 2.5em;
      color: #fafafa;
      margin-bottom: 8px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    
    .subtitle {
      font-size: 1em;
      color: #71717a;
      margin-bottom: 48px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .description {
      margin-bottom: 48px;
      font-size: 0.95em;
      color: #a1a1aa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .description h2 {
      color: #fafafa;
      margin-top: 32px;
      margin-bottom: 16px;
      font-size: 1.1em;
      font-weight: 500;
      font-family: 'SF Mono', monospace;
    }
    
    .description ul {
      margin-left: 0;
      margin-bottom: 24px;
      list-style: none;
    }
    
    .description li {
      margin-bottom: 12px;
      padding-left: 20px;
      position: relative;
    }
    
    .description li:before {
      content: '▸';
      position: absolute;
      left: 0;
      color: #52525b;
    }
    
    .description strong {
      color: #e4e4e7;
      font-weight: 500;
    }
    
    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background: #27272a;
      color: #fafafa;
      text-decoration: none;
      border: 1px solid #3f3f46;
      font-size: 0.95em;
      font-weight: 500;
      transition: all 0.2s;
      font-family: 'SF Mono', monospace;
    }
    
    .cta-button:hover {
      background: #3f3f46;
      border-color: #52525b;
    }
    
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #27272a;
      color: #52525b;
      font-size: 0.85em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>lunatech</h1>
    <p class="subtitle">Tractive data visualization tool</p>
    
    <div class="description">
      <p>
        A web application for visualizing Tractive pet tracker location data through 
        interactive heatmaps, timelines, and activity charts.
      </p>
      
      <h2>features</h2>
      <ul>
        <li><strong>Movement Patterns:</strong> Spatial heatmap analysis</li>
        <li><strong>Activity Tracking:</strong> Daily and hourly activity patterns</li>
        <li><strong>Multiple Trackers:</strong> Multi-device data aggregation</li>
        <li><strong>Historical Data:</strong> 120-day location history</li>
      </ul>
      
      <h2>how it works</h2>
      <p>
        Authenticate with Tractive API credentials. Session tokens are stored in secure 
        HTTP-only cookies. Location data is fetched on-demand and visualized client-side 
        using D3.js.
      </p>
    </div>
    
    <a href="/auth" class="cta-button">→ authenticate</a>
    
    <div class="footer">
      <p>Uses Tractive API • Session-based authentication • No credential storage</p>
    </div>
  </div>
</body>
</html>`;
}
