import { Navigate, Route, Routes } from 'react-router-dom'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from '@/features/auth'
import { ProductsPage } from '@/features/products'
import { AppShell } from './AppShell'
import { RequireAuth } from './RequireAuth'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/produtos" element={<ProductsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/produtos" replace />} />
      <Route path="*" element={<Navigate to="/produtos" replace />} />
    </Routes>
  )
}
