import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { PlusIcon, UploadIcon } from '@/shared/ui/icons'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { ImportWizard } from '../components/ImportWizard'
import { ProductFormDialog } from '../components/ProductFormDialog'
import { ProductsEmptyState, ProductsErrorState } from '../components/ProductsEmptyState'
import { ProductsSkeleton } from '../components/ProductsSkeleton'
import { ProductsTable } from '../components/ProductsTable'
import { ProductsToolbar } from '../components/ProductsToolbar'
import { useProductList } from '../hooks/useProductList'
import type { Product } from '../types'
import styles from './ProductsPage.module.css'

export function ProductsPage() {
  const list = useProductList()
  const isNarrow = useMediaQuery('(max-width: 719px)')
  const rowHeight = isNarrow ? 118 : 52

  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  function openForm(product: Product | null) {
    setEditing(product)
    setFormOpen(true)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.title}>Cadastro de produtos</h1>
          <span className={styles.count}>
            {list.status === 'ready'
              ? `${list.total.toLocaleString('pt-BR')} produtos cadastrados`
              : 'carregando…'}
          </span>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <UploadIcon width={18} height={18} />
            {/* Rótulo em um único elemento: como o botão é flex, deixar a
                palavra extra como irmã do texto faria o gap somar ao espaço. */}
            <span>
              Importar<span className={styles.labelExtra}> planilha</span>
            </span>
          </Button>
          <Button onClick={() => openForm(null)}>
            <PlusIcon width={18} height={18} />
            <span>
              Novo<span className={styles.labelExtra}> produto</span>
            </span>
          </Button>
        </div>
      </header>

      <ProductsToolbar
        filters={list.filters}
        isFiltered={list.isFiltered}
        matching={list.matching}
        narrow={isNarrow}
        onSearch={list.setSearch}
        onToggleWithoutBarcode={list.setOnlyWithoutBarcode}
        onClear={list.clearFilters}
      />

      {list.status === 'loading' && <ProductsSkeleton rowHeight={rowHeight} />}

      {list.status === 'error' && <ProductsErrorState onRetry={list.reload} />}

      {list.status === 'ready' && list.products.length === 0 && (
        <ProductsEmptyState
          filtered={list.isFiltered}
          onClear={list.clearFilters}
          onImport={() => setImportOpen(true)}
        />
      )}

      {list.status === 'ready' && list.products.length > 0 && (
        <ProductsTable
          products={list.products}
          onEdit={(product) => openForm(product)}
          estimatedRowHeight={rowHeight}
        />
      )}

      <ProductFormDialog
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSaved={list.reload}
      />

      <ImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={list.reload}
      />
    </div>
  )
}
