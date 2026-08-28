import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readJson, removeKey, storageKey, writeJson } from '@/shared/lib/storage'
import * as authApi from './api'
import type { Credentials, Result, User } from './types'

const STORAGE_KEY = storageKey('session')

interface AuthContextValue {
  user: User | null
  signIn: (credentials: Credentials, remember: boolean) => Promise<Result<User>>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Lê a sessão de onde ela tiver sido gravada, em qualquer um dos dois storages. */
function readStoredUser(): User | null {
  return (
    readJson<User | null>(STORAGE_KEY, null, 'local') ??
    readJson<User | null>(STORAGE_KEY, null, 'session')
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lida na inicialização do estado, não em efeito: o storage responde na
  // hora, então já sabemos se há sessão no primeiro render. Ler depois
  // custaria um render a mais e uma janela em que a rota seria decidida sem
  // saber quem está logado.
  const [user, setUser] = useState<User | null>(readStoredUser)

  const signIn = useCallback(async (credentials: Credentials, remember: boolean) => {
    const result = await authApi.signIn(credentials)

    if (result.data) {
      // "Manter conectado" decide apenas onde a sessão vive: localStorage
      // sobrevive ao fechar o navegador, sessionStorage não.
      writeJson(STORAGE_KEY, result.data, remember ? 'local' : 'session')
      setUser(result.data)
    }

    return result
  }, [])

  const signOut = useCallback(() => {
    removeKey(STORAGE_KEY, 'local')
    removeKey(STORAGE_KEY, 'session')
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  }
  return context
}
