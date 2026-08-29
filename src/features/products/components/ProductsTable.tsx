import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { BarcodeIcon, EditIcon } from '@/shared/ui/icons'
import type { Product } from '../types'
import styles from './ProductsTable.module.css'

interface ProductsTableProps {
  products: Product[]
  /** Ausente quando o perfil não pode editar: a coluna de ação some. */
  onEdit?: (product: Product) => void
  /**
   * Altura provável de uma linha, usada só até ela ser medida de verdade.
   * Um palpite próximo do real deixa a barra de rolagem estável desde o
   * primeiro quadro.
   */
  estimatedRowHeight: number
}

/**
 * Lista virtualizada: só as linhas visíveis existem no DOM.
 *
 * Sem isso, 26 mil linhas viram mais de 100 mil nós e o navegador engasga na
 * rolagem e no filtro. Com virtualização o custo passa a depender do tamanho
 * da janela, não do tamanho da base.
 */
export function ProductsTable({ products, onEdit, estimatedRowHeight }: ProductsTableProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  // O TanStack Virtual devolve funções que a checagem de hooks não consegue
  // provar seguras para memoizar. É limitação da análise, não do uso: o
  // virtualizador é feito para ser chamado exatamente assim.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 8,
    // No celular a descrição do produto ocupa uma ou duas linhas conforme o
    // nome. Com altura fixa, o nome de duas linhas passava por cima do SKU.
    // Medindo cada linha depois de desenhada, ela cresce só o necessário.
    measureElement: (element) => element.getBoundingClientRect().height,
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
                // O virtualizador precisa do índice para saber qual linha
                // acabou de medir.
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
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

                  <span className={styles.sku}>
                    {/* No celular não há cabeçalho de coluna: sem o rótulo,
                        o número solto poderia ser lido como quantidade. */}
                    <span className={styles.fieldLabel}>SKU</span>
                    {product.sku}
                  </span>
                  <span className={styles.description} title={product.description}>
                    {product.description}
                  </span>

                  {onEdit && (
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => onEdit(product)}
                      aria-label={`Editar ${product.description}`}
                    >
                      <EditIcon width={18} height={18} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
