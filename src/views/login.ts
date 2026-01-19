export function loginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Lunatech</title>
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
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      max-width: 420px;
      width: 100%;
      background: #18181b;
      border: 1px solid #27272a;
      padding: 40px;
    }
    
    h1 {
      font-size: 1.5em;
      color: #fafafa;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .subtitle {
      color: #71717a;
      margin-bottom: 32px;
      font-size: 0.9em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 6px;
      color: #a1a1aa;
      font-weight: 400;
      font-size: 0.85em;
      text-transform: lowercase;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #27272a;
      background: #09090b;
      color: #e4e4e7;
      font-size: 0.95em;
      transition: border-color 0.2s;
      font-family: 'SF Mono', monospace;
    }
    
    input[type="email"]:focus,
    input[type="password"]:focus {
      outline: none;
      border-color: #3f3f46;
    }
    
    .error {
      background: #18181b;
      border: 1px solid #dc2626;
      color: #fca5a5;
      padding: 10px 12px;
      margin-bottom: 20px;
      font-size: 0.85em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    button {
      width: 100%;
      padding: 12px;
      background: #27272a;
      color: #fafafa;
      border: 1px solid #3f3f46;
      font-size: 0.95em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'SF Mono', monospace;
    }
    
    button:hover {
      background: #3f3f46;
      border-color: #52525b;
    }
    
    button:active {
      background: #27272a;
    }
    
    .back-link {
      display: block;
      text-align: center;
      margin-top: 24px;
      color: #71717a;
      text-decoration: none;
      font-size: 0.85em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .back-link:hover {
      color: #a1a1aa;
    }
    
    .info {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #27272a;
      color: #52525b;
      font-size: 0.8em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>authenticate</h1>
    <p class="subtitle">Tractive API credentials</p>
    
    ${error ? `<div class="error">${error}</div>` : ''}
    
    <form method="POST" action="/auth">
      <div class="form-group">
        <label for="email">email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          placeholder="user@example.com"
          autocomplete="email"
        >
      </div>
      
      <div class="form-group">
        <label for="password">password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          required 
          placeholder="••••••••"
          autocomplete="current-password"
        >
      </div>
      
      <button type="submit">→ sign in</button>
    </form>
    
    <a href="/" class="back-link">← back</a>
    
    <div class="info">
      <p>Session-based authentication • HTTP-only cookies • No credential storage</p>
    </div>
  </div>
</body>
</html>`;
}
