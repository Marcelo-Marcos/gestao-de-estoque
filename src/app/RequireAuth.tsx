import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'

/**
 * Enquanto a sessão está sendo lida do storage não decidimos rota nenhuma —
 * redirecionar antes disso faria a tela piscar no login a cada recarga.
 */
export function RequireAuth() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return null

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
