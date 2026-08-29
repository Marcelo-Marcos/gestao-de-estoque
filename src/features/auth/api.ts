/**
 * Camada de acesso a dados da autenticação.
 *
 * PROVISÓRIO: hoje resolve tudo em memória para permitir construir e validar
 * as telas antes das regras de negócio. Quando o back-end existir, só este
 * arquivo muda — as telas consomem apenas as funções abaixo.
 */
import type { AuthError, Credentials, Result, User } from './types'

const LATENCY_MS = 700

/** Contas de demonstração enquanto não há back-end. */
const DEMO_ACCOUNTS: Array<User & { password: string; disabled?: boolean }> = [
  {
    id: '1',
    name: 'Ana Ribeiro',
    email: 'admin@exemplo.com.br',
    role: 'admin',
    password: 'senha123',
  },
  {
    id: '2',
    name: 'Carlos Menezes',
    email: 'operador@exemplo.com.br',
    role: 'operador',
    password: 'senha123',
  },
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fail(code: AuthError['code'], message: string): { data: null; error: AuthError } {
  return { data: null, error: { code, message } }
}

export async function signIn({ email, password }: Credentials): Promise<Result<User>> {
  await delay(LATENCY_MS)

  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
  )

  // A mensagem é a mesma para e-mail inexistente e senha errada: revelar qual
  // dos dois falhou entrega a um atacante quais e-mails existem.
  if (!account || account.password !== password) {
    return fail('invalid_credentials', 'E-mail ou senha incorretos.')
  }

  if (account.disabled) {
    return fail(
      'account_disabled',
      'Esta conta está desativada. Fale com o administrador do sistema.',
    )
  }

  const { password: _password, disabled: _disabled, ...user } = account
  return { data: user, error: null }
}

/**
 * Dispara a recuperação de senha.
 *
 * Responde sucesso mesmo quando o e-mail não existe — a tela mostra sempre a
 * mesma confirmação, para não funcionar como uma lista de e-mails válidos.
 */
export async function requestPasswordReset(email: string): Promise<Result<{ sent: true }>> {
  await delay(LATENCY_MS)
  void email
  return { data: { sent: true }, error: null }
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<Result<{ reset: true }>> {
  await delay(LATENCY_MS)
  void newPassword

  if (!token) {
    return fail(
      'invalid_token',
      'Este link de redefinição é inválido ou já expirou. Peça um novo.',
    )
  }

  return { data: { reset: true }, error: null }
}
