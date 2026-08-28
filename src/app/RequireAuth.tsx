import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'

/**
 * A sessão é conhecida já no primeiro render (ver AuthContext), então dá para
 * decidir a rota sem passar por um estado intermediário.
 *
 * Quando houver servidor, validar a sessão passa a ser assíncrono e volta a
 * existir um momento de "ainda não sei" para tratar aqui.
 */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
