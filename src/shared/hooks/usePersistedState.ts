import { useCallback, useState } from 'react'
import { readJson, writeJson } from '@/shared/lib/storage'

/**
 * Estado de componente que sobrevive ao fechamento do app.
 *
 * Usado por filtros, buscas e seleções de aba: ver CLAUDE.md, "Filtros e
 * buscas são lembrados". Um `validate` opcional permite descartar um valor
 * gravado que não faz mais sentido — depois de uma mudança de formato, por
 * exemplo — em vez de deixar a tela num estado impossível.
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
): [T, (value: T | ((current: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = readJson<unknown>(key, initialValue)
    if (validate) return validate(stored) ? stored : initialValue
    return stored as T
  })

  const update = useCallback(
    (value: T | ((current: T) => T)) => {
      setState((current) => {
        const next = typeof value === 'function' ? (value as (c: T) => T)(current) : value
        writeJson(key, next)
        return next
      })
    },
    [key],
  )

  return [state, update]
}
