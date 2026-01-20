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
    
    a {
      display: inline-block;
      padding: 14px 0;
      color: #fff;
      text-decoration: none;
      font-size: 1em;
      font-weight: 400;
      transition: opacity 0.2s, border-bottom-color 0.2s;
      border-bottom: 1px solid #3f3f46;
    }
    
    a:hover {
      opacity: 0.6;
      border-bottom-color: #71717a;
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
    
    h1 {
      font-size: 6em;
      color: #fafafa;
      font-weight: 300;
      letter-spacing: -0.04em;
    }
    
    p {
      font-size: 1.05em;
      color: #a1a1aa;
      max-width: 600px;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <h1>track</h1>
  
  <p>
    Use your tractive credentials to see your pet's activity
  </p>
  
  <a href="/auth">login →</a>
</body>
</html>`;
}
