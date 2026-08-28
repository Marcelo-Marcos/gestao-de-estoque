/**
 * Acesso ao armazenamento local, sempre protegido.
 *
 * Ler `window.localStorage` pode lançar exceção antes mesmo de acessar uma
 * chave: navegador com dados de site bloqueados, aba anônima em alguns
 * aparelhos, página dentro de iframe restrito. Preferência guardada é sempre
 * conveniência — nunca pode derrubar a tela que a usa.
 */

type StorageKind = 'local' | 'session'

function getStore(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readJson<T>(key: string, fallback: T, kind: StorageKind = 'local'): T {
  const store = getStore(kind)
  if (!store) return fallback

  try {
    const raw = store.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Registro corrompido: descarta para não travar todo acesso futuro.
    try {
      store.removeItem(key)
    } catch {
      /* nada a fazer */
    }
    return fallback
  }
}

export function writeJson(key: string, value: unknown, kind: StorageKind = 'local'): void {
  const store = getStore(kind)
  if (!store) return

  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    // Cota estourada ou gravação proibida: seguir sem lembrar é aceitável.
  }
}

export function removeKey(key: string, kind: StorageKind = 'local'): void {
  const store = getStore(kind)
  if (!store) return

  try {
    store.removeItem(key)
  } catch {
    /* nada a fazer */
  }
}

/** Prefixo único do app, para não colidir com outra coisa no mesmo domínio. */
export function storageKey(...parts: string[]): string {
  return ['gv', ...parts].join('.')
}
