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

/**
 * O prefixo do endereço, quando o app não está na raiz do domínio.
 *
 * O Vite entrega o mesmo valor de `base` do build; sem passá-lo ao roteador,
 * "/gestao-de-estoque/validades" não casaria com a rota "/validades" e toda
 * navegação cairia no redirecionamento de endereço desconhecido.
 */
const basename = import.meta.env.BASE_URL

const container = document.getElementById('root')
if (!container) throw new Error('Elemento #root não encontrado no index.html')

createRoot(container).render(
  <StrictMode>
    <Router basename={basename}>
      <AppearanceProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AppearanceProvider>
    </Router>
  </StrictMode>,
)
