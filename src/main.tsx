import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { AppearanceProvider } from '@/features/settings'
import { AppRoutes } from '@/app/routes'
import './styles/global.css'

/**
 * O build de demonstração roda como arquivo único, sem servidor que saiba
 * responder às rotas — nesse caso o endereço vai no fragmento (#/entrar).
 * Em produção o roteamento é por caminho normal.
 */
const Router = import.meta.env.VITE_HASH_ROUTER === 'true' ? HashRouter : BrowserRouter

const container = document.getElementById('root')
if (!container) throw new Error('Elemento #root não encontrado no index.html')

createRoot(container).render(
  <StrictMode>
    <Router>
      <AppearanceProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AppearanceProvider>
    </Router>
  </StrictMode>,
)
