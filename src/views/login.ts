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
      max-width: 450px;
      width: 100%;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 50px 40px;
    }
    
    .icon {
      text-align: center;
      font-size: 4em;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 2.5em;
      color: #667eea;
      margin-bottom: 10px;
      text-align: center;
    }
    
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 40px;
      font-size: 1.1em;
    }
    
    .form-group {
      margin-bottom: 25px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 600;
      font-size: 0.95em;
    }
    
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1em;
      transition: border-color 0.3s;
    }
    
    input[type="email"]:focus,
    input[type="password"]:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .error {
      background: #ffebee;
      color: #d32f2f;
      padding: 12px 15px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-size: 0.95em;
    }
    
    button {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.1em;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    .back-link {
      display: block;
      text-align: center;
      margin-top: 25px;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .back-link:hover {
      text-decoration: underline;
    }
    
    .info {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #999;
      font-size: 0.85em;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🐾</div>
    <h1>Login</h1>
    <p class="subtitle">Sign in with your Tractive account</p>
    
    ${error ? `<div class="error">${error}</div>` : ''}
    
    <form method="POST" action="/auth">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          placeholder="your@email.com"
          autocomplete="email"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          required 
          placeholder="••••••••"
          autocomplete="current-password"
        >
      </div>
      
      <button type="submit">Sign In</button>
    </form>
    
    <a href="/" class="back-link">← Back to Home</a>
    
    <div class="info">
      <p>Your credentials are used only to authenticate with Tractive's API.</p>
      <p>We don't store your password.</p>
    </div>
  </div>
</body>
</html>`;
}
