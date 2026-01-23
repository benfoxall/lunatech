// Simplified dashboard page that loads the React app from built assets
// In production, this reads the actual built asset paths
export function dashboardPageReact(trackerId: string): string {
  // These will be replaced at build time or read from manifest
  // For now, we'll inline the structure and let the worker handle serving
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>track • ${trackerId}</title>
  <link rel="stylesheet" crossorigin href="/assets/index-BHNlELXy.css">
  <style>
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
    
    .header {
      max-width: 1200px;
      margin: 0 auto 40px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    h1 {
      font-size: 1.5em;
      color: #fafafa;
      margin: 0;
      font-weight: 300;
      letter-spacing: -0.02em;
    }
    
    .nav-links {
      display: flex;
      gap: 24px;
      font-size: 0.9em;
    }
    
    .back-link {
      border: none;
      padding: 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>track • ${trackerId}</h1>
    <div class="nav-links">
      <a href="/trackers" class="back-link">← back</a>
      <a href="/logout">logout</a>
    </div>
  </div>
  <div id="root" data-tracker-id="${trackerId}"></div>
  <script type="module" crossorigin src="/assets/index-K3txeeut.js"></script>
</body>
</html>`;
}
