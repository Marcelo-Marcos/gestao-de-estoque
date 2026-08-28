/** Tipos e leitura/gravação da preferência de tema. Sem React. */

export type ThemeMode = 'dark' | 'light' | 'system'
export type AccentName = 'azul' | 'verde' | 'roxo' | 'laranja' | 'grafite'

export interface Appearance {
  mode: ThemeMode
  accent: AccentName
}

/** Escuro é o padrão do sistema, não a preferência do sistema operacional. */
export const DEFAULT_APPEARANCE: Appearance = { mode: 'dark', accent: 'azul' }

export const ACCENTS: Array<{ value: AccentName; label: string }> = [
  { value: 'azul', label: 'Azul' },
  { value: 'verde', label: 'Verde' },
  { value: 'roxo', label: 'Roxo' },
  { value: 'laranja', label: 'Laranja' },
  { value: 'grafite', label: 'Grafite' },
]

export const THEME_MODES: Array<{ value: ThemeMode; label: string }> = [
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' },
  { value: 'system', label: 'Do sistema' },
]

const STORAGE_KEY = 'gv.appearance'

function isAccent(value: unknown): value is AccentName {
  return ACCENTS.some((a) => a.value === value)
}

function isMode(value: unknown): value is ThemeMode {
  return THEME_MODES.some((m) => m.value === value)
}

export function readAppearance(): Appearance {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_APPEARANCE

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_APPEARANCE

    const { mode, accent } = parsed as Record<string, unknown>
    return {
      mode: isMode(mode) ? mode : DEFAULT_APPEARANCE.mode,
      accent: isAccent(accent) ? accent : DEFAULT_APPEARANCE.accent,
    }
  } catch {
    // Storage bloqueado ou registro corrompido: o padrão sempre serve.
    return DEFAULT_APPEARANCE
  }
}

export function writeAppearance(appearance: Appearance): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance))
  } catch {
    // Não poder lembrar a preferência não pode impedir de aplicá-la agora.
  }
}

/** 'system' precisa virar um valor concreto: o CSS só conhece dark e light. */
export function resolveMode(mode: ThemeMode): 'dark' | 'light' {
  if (mode !== 'system') return mode

  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyAppearance(appearance: Appearance): void {
  const root = document.documentElement
  root.dataset.theme = resolveMode(appearance.mode)
  root.dataset.accent = appearance.accent
  // Faz o navegador pintar barras de rolagem e campos nativos no tema certo.
  root.style.colorScheme = resolveMode(appearance.mode)
}
