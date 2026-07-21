import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { toast } from 'sonner';

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { registerOfflineServiceWorker } from './lib/register-service-worker.ts'

import './styles/globals.css'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void registerOfflineServiceWorker({
    onOfflineReady: () => {
      toast.success('Ready to work offline');
    },
    onNeedRefresh: (applyUpdate) => {
      toast.info('An editor update is ready', {
        duration: Infinity,
        action: {
          label: 'Reload',
          onClick: applyUpdate,
        },
      });
    },
    onRegisterError: (error) => {
      console.error('Offline support could not be enabled', error);
    },
  })
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
)
