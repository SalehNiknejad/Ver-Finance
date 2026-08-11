import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { Toaster } from 'sonner'
import { AppRouter } from '@/app/router'
import { ThemeProvider } from '@/app/theme-provider'
import '@/index.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider><AppRouter /><Toaster position="top-center" richColors dir="rtl" /></ThemeProvider>
  </StrictMode>
)
