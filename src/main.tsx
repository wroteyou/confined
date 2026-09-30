import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NowPlayingProvider } from '@/context/now-playing';
import App from '@/App';
import '@/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NowPlayingProvider>
      <App />
    </NowPlayingProvider>
  </StrictMode>,
);
