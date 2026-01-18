export function homePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lunatech - Tractive Pet Tracker Visualization</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 60px;
      text-align: center;
    }
    
    h1 {
      font-size: 3em;
      color: #667eea;
      margin-bottom: 20px;
      font-weight: 700;
    }
    
    .subtitle {
      font-size: 1.3em;
      color: #666;
      margin-bottom: 40px;
    }
    
    .description {
      text-align: left;
      margin-bottom: 40px;
      font-size: 1.1em;
      color: #555;
    }
    
    .description h2 {
      color: #667eea;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.5em;
    }
    
    .description ul {
      margin-left: 20px;
      margin-bottom: 20px;
    }
    
    .description li {
      margin-bottom: 10px;
    }
    
    .cta-button {
      display: inline-block;
      padding: 15px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-size: 1.2em;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    
    .icon {
      font-size: 4em;
      margin-bottom: 20px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #999;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🐾</div>
    <h1>Lunatech</h1>
    <p class="subtitle">Visualize Your Pet's Adventures</p>
    
    <div class="description">
      <p>
        Lunatech is a web application that connects to your Tractive pet tracker 
        and transforms location data into beautiful, interactive visualizations.
      </p>
      
      <h2>What You Can Do</h2>
      <ul>
        <li><strong>View Movement Patterns:</strong> See where your pet spends most of their time with heat maps</li>
        <li><strong>Track Activity Over Time:</strong> Analyze daily and hourly activity patterns</li>
        <li><strong>Multiple Trackers:</strong> Manage and view data for all your pets in one place</li>
        <li><strong>Historical Data:</strong> Access up to 120 days of location history</li>
      </ul>
      
      <h2>How It Works</h2>
      <p>
        Simply log in with your Tractive credentials. We'll securely fetch your pet's 
        location data and present it through interactive charts and maps. Your credentials 
        are only used to authenticate with Tractive's API and are never stored.
      </p>
    </div>
    
    <a href="/auth" class="cta-button">Get Started</a>
    
    <div class="footer">
      <p>This app uses the Tractive API to access your pet tracker data.</p>
      <p>Your login information is transmitted securely and not stored.</p>
    </div>
  </div>
</body>
</html>`;
}
