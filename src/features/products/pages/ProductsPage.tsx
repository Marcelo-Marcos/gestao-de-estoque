import { useCallback, useEffect, useState } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { BoxIcon, PlusIcon, SearchIcon, UploadIcon } from '@/shared/ui/icons'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { countProducts, listProducts } from '../api'
import { ImportWizard } from '../components/ImportWizard'
import { ProductFormDialog } from '../components/ProductFormDialog'
import { ProductsTable } from '../components/ProductsTable'
import type { Product } from '../types'
import styles from './ProductsPage.module.css'

type Status = 'loading' | 'error' | 'ready'

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [onlyWithoutBarcode, setOnlyWithoutBarcode] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  /** Total da base, independente do filtro — o denominador de "X de Y". */
  const [baseTotal, setBaseTotal] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [reloadKey, setReloadKey] = useState(0)

  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // Sem espera, cada tecla dispararia uma varredura de 26 mil registros.
  const debouncedSearch = useDebouncedValue(search, 250)
  const isNarrow = useMediaQuery('(max-width: 719px)')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listProducts({ search: debouncedSearch, onlyWithoutBarcode })
      .then((page) => {
        if (cancelled) return
        setProducts(page.items)
        setTotal(page.total)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, onlyWithoutBarcode, reloadKey])

  useEffect(() => {
    let cancelled = false
    countProducts().then((count) => {
      if (!cancelled) setBaseTotal(count)
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  const isFiltered = debouncedSearch.trim() !== '' || onlyWithoutBarcode

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setFormOpen(true)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.title}>Cadastro de produtos</h1>
          <span className={styles.count}>
            {status === 'ready'
              ? isFiltered
                ? `${total.toLocaleString('pt-BR')} de ${baseTotal.toLocaleString('pt-BR')} produtos`
                : `${baseTotal.toLocaleString('pt-BR')} produtos cadastrados`
              : 'carregando…'}
          </span>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <UploadIcon width={18} height={18} />
            Importar<span className={styles.labelExtra}>&nbsp;planilha</span>
          </Button>
          <Button onClick={openNew}>
            <PlusIcon width={18} height={18} />
            Novo<span className={styles.labelExtra}>&nbsp;produto</span>
          </Button>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <SearchIcon className={styles.searchIcon} width={18} height={18} />
          <input
            className={styles.searchInput}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // O texto longo aparece cortado em tela estreita; o rótulo
            // acessível continua completo para quem usa leitor de tela.
            placeholder={isNarrow ? 'Buscar produto' : 'Buscar por descrição, SKU ou código de barras'}
            aria-label="Buscar produtos"
            autoComplete="off"
          />
        </div>

        <label className={styles.filter}>
          <input
            type="checkbox"
            checked={onlyWithoutBarcode}
            onChange={(e) => setOnlyWithoutBarcode(e.target.checked)}
          />
          Só sem código de barras
        </label>
      </div>

      {status === 'loading' && (
        <div className={styles.skeleton} aria-busy="true" aria-label="Carregando produtos">
          {Array.from({ length: 12 }, (_, i) => (
            <div className={styles.skeletonRow} key={i} style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className={styles.state}>
          <Alert tone="danger">
            Não foi possível carregar os produtos. Verifique a conexão e tente novamente.
          </Alert>
          <Button variant="secondary" onClick={reload}>
            Tentar de novo
          </Button>
        </div>
      )}

      {status === 'ready' && products.length === 0 && (
        <div className={styles.state}>
          <span className={styles.stateIcon}>
            <BoxIcon width={26} height={26} />
          </span>

          {isFiltered ? (
            <>
              <p className={styles.stateTitle}>Nenhum produto encontrado</p>
              <p className={styles.stateText}>
                Nenhum produto corresponde à busca. Tente outro termo ou limpe os filtros.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setOnlyWithoutBarcode(false)
                }}
              >
                Limpar filtros
              </Button>
            </>
          ) : (
            <>
              <p className={styles.stateTitle}>O cadastro está vazio</p>
              <p className={styles.stateText}>
                Importe a planilha do ERP para trazer a base de produtos de uma vez. Depois é só
                completar o que faltar manualmente.
              </p>
              <Button onClick={() => setImportOpen(true)}>
                <UploadIcon width={18} height={18} />
                Importar planilha
              </Button>
            </>
          )}
        </div>
      )}

      {status === 'ready' && products.length > 0 && (
        <ProductsTable products={products} onEdit={openEdit} estimatedRowHeight={isNarrow ? 118 : 52} />
      )}

      <ProductFormDialog
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSaved={reload}
      />

      <ImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={reload}
      />
    </div>
  )
}
