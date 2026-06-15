import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { IntlayerProvider } from 'react-intlayer'
import App from './App.tsx'
import './index.css'
import './i18n.ts'
import { useAuthStore } from './store/authStore'

function Root() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <StrictMode>
      <IntlayerProvider>
        <App />
      </IntlayerProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
