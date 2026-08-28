import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { BarcodeIcon, EditIcon } from '@/shared/ui/icons'
import type { Product } from '../types'
import styles from './ProductsTable.module.css'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  /** Altura de uma linha; muda entre celular e desktop. */
  rowHeight: number
}

/**
 * Lista virtualizada: só as linhas visíveis existem no DOM.
 *
 * Sem isso, 26 mil linhas viram mais de 100 mil nós e o navegador engasga na
 * rolagem e no filtro. Com virtualização o custo passa a depender do tamanho
 * da janela, não do tamanho da base.
 */
export function ProductsTable({ products, onEdit, rowHeight }: ProductsTableProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  })

  return (
    <div className={styles.wrap}>
      <div className={styles.head} role="presentation">
        <span>Código de barras</span>
        <span>SKU</span>
        <span>Descrição</span>
        <span className="sr-only">Ações</span>
      </div>

      <div className={styles.scroller} ref={scrollerRef} tabIndex={0}>
        <div className={styles.canvas} style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const product = products[virtualRow.index]

            return (
              <div
                key={product.id}
                className={styles.item}
                style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
              >
                <div className={styles.itemInner}>
                  <span className={styles.barcode}>
                    {product.barcode ? (
                      <>
                        <BarcodeIcon className={styles.barcodeIcon} width={16} height={16} />
                        {product.barcode}
                      </>
                    ) : (
                      <span className={styles.semBarras}>sem código</span>
                    )}
                  </span>

                  <span className={styles.sku}>{product.sku}</span>
                  <span className={styles.description} title={product.description}>
                    {product.description}
                  </span>

                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => onEdit(product)}
                    aria-label={`Editar ${product.description}`}
                  >
                    <EditIcon width={18} height={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
