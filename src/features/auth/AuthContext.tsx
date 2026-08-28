import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from './api'
import type { Credentials, Result, User } from './types'

const STORAGE_KEY = 'gv.session'

interface AuthContextValue {
  user: User | null
  /** Enquanto true, ainda não sabemos se há sessão — não decida rota antes. */
  initializing: boolean
  signIn: (credentials: Credentials, remember: boolean) => Promise<Result<User>>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Acesso ao storage sempre protegido: em navegador com dados de site
 * bloqueados, em aba anônima ou dentro de um iframe restrito, até ler
 * `window.localStorage` lança exceção. A sessão é uma conveniência — falhar
 * ao gravá-la nunca pode derrubar o login.
 */
function withStore<T>(kind: 'local' | 'session', action: (store: Storage) => T): T | null {
  try {
    const store = kind === 'local' ? window.localStorage : window.sessionStorage
    return action(store)
  } catch {
    return null
  }
}

/** Lê a sessão de onde ela tiver sido gravada, sem quebrar se estiver corrompida. */
function readStoredUser(): User | null {
  for (const kind of ['local', 'session'] as const) {
    const user = withStore(kind, (store) => {
      const raw = store.getItem(STORAGE_KEY)
      if (!raw) return null

      try {
        return JSON.parse(raw) as User
      } catch {
        // Registro corrompido: descarta para não travar todo acesso futuro.
        store.removeItem(STORAGE_KEY)
        return null
      }
    })

    if (user) return user
  }

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    setUser(readStoredUser())
    setInitializing(false)
  }, [])

  const signIn = useCallback(async (credentials: Credentials, remember: boolean) => {
    const result = await authApi.signIn(credentials)

    if (result.data) {
      // "Manter conectado" decide apenas onde a sessão vive: localStorage
      // sobrevive ao fechar o navegador, sessionStorage não.
      withStore(remember ? 'local' : 'session', (store) =>
        store.setItem(STORAGE_KEY, JSON.stringify(result.data)),
      )
      setUser(result.data)
    }

    return result
  }, [])

  const signOut = useCallback(() => {
    withStore('local', (store) => store.removeItem(STORAGE_KEY))
    withStore('session', (store) => store.removeItem(STORAGE_KEY))
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, signIn, signOut }),
    [user, initializing, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  }
  return context
}
