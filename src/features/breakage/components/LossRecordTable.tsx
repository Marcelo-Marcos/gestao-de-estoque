import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Badge } from '@/shared/ui/Badge'
import { EditIcon, TrashIcon } from '@/shared/ui/icons'
import { formatDate } from '@/shared/lib/date'
import { deadline } from '../deadline'
import { recordLabel } from '../label'
import { labelOf } from '../tags'
import type { LossRecord, Tag } from '../types'
import { AttachmentChips } from './AttachmentChips'
import styles from './LossRecordTable.module.css'

interface LossRecordTableProps {
  records: LossRecord[]
  reasons: Tag[]
  origins: Tag[]
  selection: ReadonlySet<string>
  onToggleSelect: (id: string) => void
  onEdit: (record: LossRecord) => void
  onDelete: (record: LossRecord) => void
  onOpenAttachment: (record: LossRecord, attachmentId: string) => void
}

/**
 * Lista dos registros de quebra em linhas.
 *
 * Mesma técnica e mesma grade da tela de validades: as duas mostram registros
 * de produto, e ler uma coluna no mesmo lugar nas duas telas vale mais que
 * cada tela ter o desenho ideal para si.
 *
 * Só as linhas visíveis existem no DOM. Abaixo de 720px a grade não cabe e a
 * lista vira cartão — o mesmo corte da tela de validades.
 */
export function LossRecordTable({
  records,
  reasons,
  origins,
  selection,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenAttachment,
}: LossRecordTableProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => 62,
    overscan: 8,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  return (
    <div className={styles.wrap}>
      <div className={styles.head} role="presentation">
        <span></span>
        <span></span>
        <span>Produto</span>
        <span>Validade</span>
        <span className={styles.number}>Qtd</span>
        <span>Motivo e origem</span>
        <span>Anexos</span>
        <span></span>
      </div>

      <div className={styles.scroller} ref={scrollerRef} tabIndex={0}>
        <div className={styles.canvas} style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const record = records[virtualRow.index]
            const prazo = deadline(record)
            const motivo = labelOf(reasons, record.reasonId)
            const origem = labelOf(origins, record.originId)
            const selecionado = selection.has(record.id)

            return (
              <div
                key={record.id}
                className={styles.item}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <div
                  className={`${styles.itemInner} ${selecionado ? styles.selected : ''}`}
                  style={
                    { '--situation': `var(--situation-${prazo.token})` } as React.CSSProperties
                  }
                >
                  <span className={styles.stripe} />

                  <label className={styles.select}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selecionado}
                      onChange={() => onToggleSelect(record.id)}
                    />
                    <span className={styles.srOnly}>Selecionar {recordLabel(record)}</span>
                  </label>

                  <span className={styles.product}>
                    <span className={styles.description} title={record.description}>
                      {record.description || 'Sem descrição'}
                    </span>
                    <span className={styles.codes}>
                      {record.sku ? `SKU ${record.sku}` : 'SKU pendente'}
                      {record.barcode && ` · ${record.barcode}`}
                      {` · ${record.createdBy}`}
                    </span>
                  </span>

                  {record.expiryDate ? (
                    <span className={styles.expiry}>
                      <span className={styles.date}>{formatDate(record.expiryDate)}</span>
                      <span className={`${styles.remaining} ${styles[prazo.token]}`}>
                        {prazo.text}
                      </span>
                    </span>
                  ) : (
                    <span className={styles.absent}>sem validade</span>
                  )}

                  <span className={styles.number}>{record.quantity}</span>

                  <span className={styles.tags}>
                    {motivo && <Badge tone="marca">{motivo}</Badge>}
                    {origem && <Badge tone="neutro">{origem}</Badge>}
                    {record.pendingProduct && <Badge tone="duplicado">Pendente</Badge>}
                    {record.quantity <= 0 && <Badge tone="invalido">Zerado</Badge>}
                  </span>

                  <AttachmentChips
                    attachments={record.attachments}
                    onOpen={(attachmentId) => onOpenAttachment(record, attachmentId)}
                  />

                  <span className={styles.actions}>
                    <button
                      type="button"
                      className={styles.action}
                      onClick={() => onEdit(record)}
                      aria-label={`Editar registro de ${recordLabel(record)}`}
                    >
                      <EditIcon width={16} height={16} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.action} ${styles.delete}`}
                      onClick={() => onDelete(record)}
                      aria-label={`Excluir registro de ${recordLabel(record)}`}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
