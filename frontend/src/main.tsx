import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from './components/Dashboard';
import './index.css';

// Get tracker ID from data attribute or URL
const rootElement = document.getElementById('root');
const trackerId = rootElement?.dataset.trackerId || '';

if (!trackerId) {
  console.error('No tracker ID provided');
} else {
  createRoot(rootElement!).render(
    <StrictMode>
      <Dashboard trackerId={trackerId} />
    </StrictMode>
  );
}
