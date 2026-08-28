/** Tipos e leitura/gravação da preferência de tema. Sem React. */

import { readJson, storageKey, writeJson } from '@/shared/lib/storage'

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

const STORAGE_KEY = storageKey('appearance')

function isAccent(value: unknown): value is AccentName {
  return ACCENTS.some((a) => a.value === value)
}

function isMode(value: unknown): value is ThemeMode {
  return THEME_MODES.some((m) => m.value === value)
}

export function readAppearance(): Appearance {
  const stored = readJson<unknown>(STORAGE_KEY, null)
  if (typeof stored !== 'object' || stored === null) return DEFAULT_APPEARANCE

  // Valida campo a campo: um tema removido numa versão futura não pode deixar
  // a interface sem cor nenhuma.
  const { mode, accent } = stored as Record<string, unknown>
  return {
    mode: isMode(mode) ? mode : DEFAULT_APPEARANCE.mode,
    accent: isAccent(accent) ? accent : DEFAULT_APPEARANCE.accent,
  }
}

export function writeAppearance(appearance: Appearance): void {
  writeJson(STORAGE_KEY, appearance)
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
