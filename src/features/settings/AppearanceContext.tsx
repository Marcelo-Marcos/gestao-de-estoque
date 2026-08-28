import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  applyAppearance,
  readAppearance,
  resolveMode,
  writeAppearance,
  type AccentName,
  type Appearance,
  type ThemeMode,
} from './theme'

interface AppearanceContextValue extends Appearance {
  /** O tema realmente aplicado — 'system' já resolvido. */
  resolvedMode: 'dark' | 'light'
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentName) => void
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

export function AppearanceProvider({ children }: { children: ReactNode }) {
  // Lê na inicialização do estado, não em efeito: aplicar depois da primeira
  // pintura faria a tela piscar no tema errado.
  const [appearance, setAppearance] = useState<Appearance>(() => {
    const stored = readAppearance()
    applyAppearance(stored)
    return stored
  })

  const [systemMode, setSystemMode] = useState<'dark' | 'light'>(() => resolveMode('system'))

  // Só acompanha o sistema operacional quando o usuário pediu isso.
  useEffect(() => {
    if (appearance.mode !== 'system') return

    const query = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      setSystemMode(query.matches ? 'light' : 'dark')
      applyAppearance(appearance)
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [appearance])

  const update = useCallback((patch: Partial<Appearance>) => {
    setAppearance((current) => {
      const next = { ...current, ...patch }
      applyAppearance(next)
      writeAppearance(next)
      return next
    })
  }, [])

  const value = useMemo<AppearanceContextValue>(
    () => ({
      ...appearance,
      resolvedMode: appearance.mode === 'system' ? systemMode : appearance.mode,
      setMode: (mode) => update({ mode }),
      setAccent: (accent) => update({ accent }),
    }),
    [appearance, systemMode, update],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error('useAppearance precisa estar dentro de <AppearanceProvider>.')
  return context
}
