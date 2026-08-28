import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { storageKey } from '@/shared/lib/storage'
import { countProducts, listProducts } from '../api'
import type { Product, ProductQuery } from '../types'

export type ListStatus = 'loading' | 'error' | 'ready'

const FILTERS_KEY = storageKey('filtros', 'produtos')

const NO_FILTERS: ProductQuery = { search: '', onlyWithoutBarcode: false }

/** Descarta um registro gravado fora de formato em vez de quebrar a tela. */
function isProductQuery(value: unknown): value is ProductQuery {
  if (typeof value !== 'object' || value === null) return false

  const { search, onlyWithoutBarcode } = value as Record<string, unknown>
  return typeof search === 'string' && typeof onlyWithoutBarcode === 'boolean'
}

/**
 * Estado da listagem: filtros lembrados entre sessões (ver CLAUDE.md) e a
 * busca dos dados que eles produzem.
 *
 * Fica fora do componente para a página cuidar só de desenhar.
 */
export function useProductList() {
  const [filters, setFilters] = usePersistedState<ProductQuery>(
    FILTERS_KEY,
    NO_FILTERS,
    isProductQuery,
  )

  const [products, setProducts] = useState<Product[]>([])
  const [matching, setMatching] = useState(0)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<ListStatus>('loading')
  const [reloadKey, setReloadKey] = useState(0)

  // Sem espera, cada tecla dispararia uma varredura da base inteira.
  const debouncedSearch = useDebouncedValue(filters.search, 250)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listProducts({ search: debouncedSearch, onlyWithoutBarcode: filters.onlyWithoutBarcode })
      .then((page) => {
        if (cancelled) return
        setProducts(page.items)
        setMatching(page.total)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, filters.onlyWithoutBarcode, reloadKey])

  useEffect(() => {
    let cancelled = false

    countProducts().then((count) => {
      if (!cancelled) setTotal(count)
    })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const setSearch = useCallback(
    (search: string) => setFilters((current) => ({ ...current, search })),
    [setFilters],
  )

  const setOnlyWithoutBarcode = useCallback(
    (onlyWithoutBarcode: boolean) =>
      setFilters((current) => ({ ...current, onlyWithoutBarcode })),
    [setFilters],
  )

  const clearFilters = useCallback(() => setFilters(NO_FILTERS), [setFilters])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  // Usa o valor com atraso, não o que está sendo digitado: senão a contagem
  // trocaria de formato antes de a lista mudar.
  const isFiltered = debouncedSearch.trim() !== '' || filters.onlyWithoutBarcode

  return {
    filters,
    products,
    matching,
    total,
    status,
    isFiltered,
    setSearch,
    setOnlyWithoutBarcode,
    clearFilters,
    reload,
  }
}
