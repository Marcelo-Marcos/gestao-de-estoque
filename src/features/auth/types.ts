export type UserRole = 'admin' | 'operador'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Credentials {
  email: string
  password: string
}

/**
 * Erros de autenticação são tratados como valor, não exceção solta:
 * cada caso tem uma mensagem própria na interface.
 */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'account_disabled'
  | 'invalid_token'
  | 'network'

export interface AuthError {
  code: AuthErrorCode
  message: string
}

export type Result<T> = { data: T; error: null } | { data: null; error: AuthError }
