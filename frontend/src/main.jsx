import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './lib/i18n.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min
      gcTime: 1000 * 60 * 10, // 10 min
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      placeholderData: (prev) => prev,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Remove loader once React mounts
const loader = document.getElementById('root-loader');
if (loader) {
  setTimeout(()=> { loader.style.opacity='0'; setTimeout(()=>loader.remove(), 220); }, 80);
}
