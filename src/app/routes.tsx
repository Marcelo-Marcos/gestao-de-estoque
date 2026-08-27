import { Navigate, Route, Routes } from 'react-router-dom'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from '@/features/auth'
import { RequireAuth } from './RequireAuth'
import { PlaceholderHome } from './PlaceholderHome'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<PlaceholderHome />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
