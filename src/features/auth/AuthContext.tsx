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

/** Lê a sessão de onde ela tiver sido gravada, sem quebrar se estiver corrompida. */
function readStoredUser(): User | null {
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = store.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as User
    } catch {
      store.removeItem(STORAGE_KEY)
    }
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
      const store = remember ? window.localStorage : window.sessionStorage
      store.setItem(STORAGE_KEY, JSON.stringify(result.data))
      setUser(result.data)
    }

    return result
  }, [])

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    window.sessionStorage.removeItem(STORAGE_KEY)
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
