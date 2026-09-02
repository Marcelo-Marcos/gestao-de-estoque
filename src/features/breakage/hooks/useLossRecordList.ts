import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { storageKey } from '@/shared/lib/storage'
import { deleteLossRecord, listLossRecords, restoreLossRecord } from '../api'
import type { LossRecord, LossRecordQuery } from '../types'

export type ListStatus = 'loading' | 'error' | 'ready'

const FILTERS_KEY = storageKey('filtros', 'quebra')

const NO_FILTERS: LossRecordQuery = { search: '', stockState: 'no-estoque' }

const STOCK_STATES: LossRecordQuery['stockState'][] = ['todos', 'no-estoque', 'zerados']

/** Descarta registro fora de formato em vez de deixar a tela num estado impossível. */
function isLossRecordQuery(value: unknown): value is LossRecordQuery {
  if (typeof value !== 'object' || value === null) return false

  const { search, stockState } = value as Record<string, unknown>
  return (
    typeof search === 'string' && STOCK_STATES.includes(stockState as LossRecordQuery['stockState'])
  )
}

/**
 * Estado da tela de quebra: filtros lembrados entre sessões, a lista que eles
 * produzem e a exclusão com desfazer.
 *
 * O padrão da lista é "no estoque": um registro que zerou já não é trabalho
 * pendente, e deixá-lo à vista faria a tela crescer com o que não exige nada
 * de ninguém. Continua a um clique de distância na aba "zerados".
 */
export function useLossRecordList() {
  const [filters, setFilters] = usePersistedState<LossRecordQuery>(
    FILTERS_KEY,
    NO_FILTERS,
    isLossRecordQuery,
  )

  const [result, setResult] = useState<{ key: string; items: LossRecord[] } | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  /** Último registro excluído, enquanto o desfazer ainda está de pé. */
  const [undoable, setUndoable] = useState<LossRecord | null>(null)
  const undoTimer = useRef<number | null>(null)

  // Sem espera, cada tecla dispararia uma varredura da lista inteira.
  const debouncedSearch = useDebouncedValue(filters.search, 250)

  const queryKey = `${debouncedSearch}|${filters.stockState}|${reloadKey}`

  useEffect(() => {
    let cancelled = false

    listLossRecords({ search: debouncedSearch, stockState: filters.stockState })
      .then((items) => {
        if (cancelled) return
        setFailedKey(null)
        setResult({ key: queryKey, items })
      })
      .catch(() => {
        if (!cancelled) setFailedKey(queryKey)
      })

    return () => {
      cancelled = true
    }
  }, [queryKey, debouncedSearch, filters.stockState])

  // O desfazer some sozinho; sem esta limpeza, um temporizador sobreviveria à
  // saída da tela e tentaria escrever estado de um componente já desmontado.
  useEffect(() => {
    return () => {
      if (undoTimer.current !== null) window.clearTimeout(undoTimer.current)
    }
  }, [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const setSearch = useCallback(
    (search: string) => setFilters((current) => ({ ...current, search })),
    [setFilters],
  )

  const setStockState = useCallback(
    (stockState: LossRecordQuery['stockState']) =>
      setFilters((current) => ({ ...current, stockState })),
    [setFilters],
  )

  const clearFilters = useCallback(() => setFilters(NO_FILTERS), [setFilters])

  /**
   * Exclui e guarda o registro para o desfazer.
   *
   * Sem confirmação antes: perguntar "tem certeza?" a cada exclusão de rotina
   * treina a pessoa a confirmar sem ler. O desfazer resolve o engano de
   * verdade, e só custa quando ele acontece (ver docs/dominio.md).
   */
  const remove = useCallback(
    async (record: LossRecord) => {
      const removed = await deleteLossRecord(record.id)
      if (!removed) return

      setUndoable(removed)
      reload()

      if (undoTimer.current !== null) window.clearTimeout(undoTimer.current)
      undoTimer.current = window.setTimeout(() => setUndoable(null), 8000)
    },
    [reload],
  )

  const undo = useCallback(async () => {
    if (!undoable) return

    if (undoTimer.current !== null) window.clearTimeout(undoTimer.current)
    setUndoable(null)
    await restoreLossRecord(undoable)
    reload()
  }, [undoable, reload])

  const dismissUndo = useCallback(() => {
    if (undoTimer.current !== null) window.clearTimeout(undoTimer.current)
    setUndoable(null)
  }, [])

  const status: ListStatus =
    failedKey === queryKey ? 'error' : result === null ? 'loading' : 'ready'

  const isFiltered = debouncedSearch.trim() !== '' || filters.stockState !== NO_FILTERS.stockState

  return {
    filters,
    records: result?.items ?? [],
    status,
    isFiltered,
    undoable,
    setSearch,
    setStockState,
    clearFilters,
    reload,
    remove,
    undo,
    dismissUndo,
  }
}
