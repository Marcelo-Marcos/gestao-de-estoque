import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { storageKey } from '@/shared/lib/storage'
import { deleteLossRecords, listLossRecords, restoreLossRecords } from '../api'
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
 * produzem, a seleção múltipla e a exclusão com desfazer.
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

  /** Ids marcados para a exclusão em grupo. */
  const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set())

  /** Últimos registros excluídos, enquanto o desfazer ainda está de pé. */
  const [undoable, setUndoable] = useState<LossRecord[]>([])
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

  const records = useMemo(() => result?.items ?? [], [result])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  /**
   * Trocar de filtro limpa a seleção.
   *
   * Sem isso, marcar itens numa aba e excluir em outra apagaria registros que
   * a pessoa não está vendo — o pior tipo de exclusão em massa.
   */
  const changeFilters = useCallback(
    (change: (current: LossRecordQuery) => LossRecordQuery) => {
      setSelection(new Set())
      setFilters(change)
    },
    [setFilters],
  )

  const setSearch = useCallback(
    (search: string) => changeFilters((current) => ({ ...current, search })),
    [changeFilters],
  )

  const setStockState = useCallback(
    (stockState: LossRecordQuery['stockState']) =>
      changeFilters((current) => ({ ...current, stockState })),
    [changeFilters],
  )

  const clearFilters = useCallback(() => changeFilters(() => NO_FILTERS), [changeFilters])

  const toggleSelected = useCallback((id: string) => {
    setSelection((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelection(new Set(records.map((record) => record.id)))
  }, [records])

  const clearSelection = useCallback(() => setSelection(new Set()), [])

  /**
   * Exclui e guarda os registros para o desfazer.
   *
   * Sem confirmação antes: perguntar "tem certeza?" a cada exclusão de rotina
   * treina a pessoa a confirmar sem ler. O desfazer resolve o engano de
   * verdade, e só custa quando ele acontece (ver docs/dominio.md).
   */
  const remove = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return

      const removed = await deleteLossRecords(ids)
      if (removed.length === 0) return

      setSelection(new Set())
      setUndoable(removed)
      reload()

      if (undoTimer.current !== null) window.clearTimeout(undoTimer.current)
      undoTimer.current = window.setTimeout(() => setUndoable([]), 8000)
    },
    [reload],
  )

  const removeSelected = useCallback(() => remove([...selection]), [remove, selection])

  const undo = useCallback(async () => {
    if (undoable.length === 0) return

    if (undoTimer.current !== null) window.clearTimeout(undoTimer.current)
    const voltando = undoable
    setUndoable([])
    await restoreLossRecords(voltando)
    reload()
  }, [undoable, reload])

  const dismissUndo = useCallback(() => {
    if (undoTimer.current !== null) window.clearTimeout(undoTimer.current)
    setUndoable([])
  }, [])

  const status: ListStatus =
    failedKey === queryKey ? 'error' : result === null ? 'loading' : 'ready'

  const isFiltered = debouncedSearch.trim() !== '' || filters.stockState !== NO_FILTERS.stockState

  return {
    filters,
    records,
    status,
    isFiltered,
    selection,
    undoable,
    setSearch,
    setStockState,
    clearFilters,
    toggleSelected,
    selectAll,
    clearSelection,
    reload,
    remove,
    removeSelected,
    undo,
    dismissUndo,
  }
}
