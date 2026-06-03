import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTheme } from './store/index.ts'

// Apply theme before render to avoid flash
initTheme()

// Register service worker
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered(r) {
        console.log('[SW] Registered:', r)
      },
      onRegisterError(error) {
        console.warn('[SW] Registration error:', error)
      },
    })
  }).catch(() => {
    // PWA not available in dev mode, that's OK
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
