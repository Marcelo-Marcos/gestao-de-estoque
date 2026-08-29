import { Navigate, Route, Routes } from 'react-router-dom'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from '@/features/auth'
import { ProductsPage } from '@/features/products'
import { AppShell } from './AppShell'
import { RequireAuth } from './RequireAuth'

/**
 * Mapa de rotas do app.
 *
 * Três grupos, nesta ordem:
 *
 * 1. Rotas abertas — quem não entrou precisa alcançá-las, senão não teria como
 *    recuperar a senha.
 * 2. Rotas protegidas — aninhadas em <RequireAuth>, que redireciona para o
 *    login quando não há sessão, e depois em <AppShell>, que desenha a barra
 *    lateral e o cabeçalho ao redor de todas elas.
 * 3. Redirecionamentos — a raiz e qualquer endereço desconhecido levam ao
 *    cadastro. Cair numa tela em branco por causa de um endereço digitado
 *    errado é pior do que ir para um lugar útil.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

      {/* Tudo aqui dentro exige sessão e aparece dentro do layout do app. */}
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
