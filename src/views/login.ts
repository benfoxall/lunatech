export function loginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>track • login</title>
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
    
    .container {
      max-width: 480px;
    }
    
    h1 {
      font-size: 2em;
      color: #fafafa;
      margin-bottom: 48px;
      font-weight: 300;
      letter-spacing: -0.02em;
    }
    
    .form-group {
      margin-bottom: 32px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      color: #71717a;
      font-weight: 400;
      font-size: 0.9em;
    }
    
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 12px 0;
      border: none;
      border-bottom: 1px solid #27272a;
      background: transparent;
      color: #fafafa;
      font-size: 1em;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    
    input[type="email"]:focus,
    input[type="password"]:focus {
      outline: none;
      border-bottom-color: #52525b;
    }
    
    .error {
      color: #f87171;
      padding: 12px 0;
      margin-bottom: 24px;
      font-size: 0.9em;
    }
    
    button {
      padding: 14px 0;
      background: transparent;
      color: #fafafa;
      border: none;
      border-bottom: 1px solid #3f3f46;
      font-size: 1em;
      font-weight: 400;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      text-align: left;
      width: auto;
      margin-top: 16px;
    }
    
    button:hover {
      color: #71717a;
      border-bottom-color: #71717a;
    }
    
    .back-link {
      display: inline-block;
      margin-top: 48px;
      color: #52525b;
      text-decoration: none;
      font-size: 0.9em;
      transition: color 0.2s;
    }
    
    .back-link:hover {
      color: #71717a;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>authenticate</h1>
    
    ${error ? `<div class="error">${error}</div>` : ""}
    
    <form method="POST" action="/auth">
      <div class="form-group">
        <label for="email">email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
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
          autocomplete="current-password"
        >
      </div>
      
      <button type="submit">sign in →</button>
    </form>
    
    <a href="/" class="back-link">← back</a>
  </div>
</body>
</html>`;
}
