import { Badge } from '@/shared/ui/Badge'
import { CalendarIcon, FileIcon, TrashIcon } from '@/shared/ui/icons'
import { daysUntil, formatDate } from '@/shared/lib/date'
import { recordLabel } from '../label'
import { labelOf } from '../tags'
import type { LossRecord, Tag } from '../types'
import styles from './LossRecordCard.module.css'

interface LossRecordCardProps {
  record: LossRecord
  reasons: Tag[]
  origins: Tag[]
  onDelete: (record: LossRecord) => void
}

/**
 * Texto do prazo, com o token de cor que ele merece.
 *
 * A cor nunca vem sozinha: o texto diz "venceu há 4 dias" mesmo para quem não
 * enxerga a diferença entre vermelho e âmbar (ver CLAUDE.md).
 */
function deadline(record: LossRecord) {
  if (!record.expiryDate) return { token: 'unknown', text: 'sem validade' }

  const restantes = daysUntil(record.expiryDate)
  if (restantes === null) return { token: 'unknown', text: 'sem validade' }

  if (restantes < 0) return { token: 'expired', text: `venceu há ${Math.abs(restantes)} dias` }
  if (restantes === 0) return { token: 'warning', text: 'vence hoje' }
  if (restantes <= 30) return { token: 'warning', text: `vence em ${restantes} dias` }
  return { token: 'ok', text: `vence em ${restantes} dias` }
}

/**
 * Um registro de perda.
 *
 * Cartão em vez de linha de tabela porque a tela é usada no corredor, no
 * celular: o que interessa — o produto, quanto e por quê — precisa caber sem
 * rolagem lateral.
 */
export function LossRecordCard({ record, reasons, origins, onDelete }: LossRecordCardProps) {
  const prazo = deadline(record)
  const motivo = labelOf(reasons, record.reasonId)
  const origem = labelOf(origins, record.originId)
  const zerado = record.quantity <= 0

  return (
    <article className={`${styles.card} ${zerado ? styles.zeroed : ''}`}>
      <div className={styles.head}>
        <div className={styles.identity}>
          <h2 className={styles.description}>{record.description || 'Sem descrição'}</h2>
          <span className={styles.codes}>
            {record.sku ? `SKU ${record.sku}` : 'SKU pendente'}
            {record.barcode && <span className={styles.barcode}>{record.barcode}</span>}
          </span>
        </div>

        <div className={styles.quantity}>
          <span className={styles.quantityValue}>{record.quantity}</span>
          <span className={styles.quantityLabel}>{record.quantity === 1 ? 'un' : 'un'}</span>
        </div>
      </div>

      <div className={styles.tags}>
        <span
          className={styles.deadline}
          style={
            {
              '--tone': `var(--situation-${prazo.token})`,
              '--tone-soft': `var(--situation-${prazo.token}-soft)`,
              '--tone-text': `var(--situation-${prazo.token}-text)`,
            } as React.CSSProperties
          }
        >
          <CalendarIcon width={13} height={13} />
          {record.expiryDate ? `${formatDate(record.expiryDate)} · ${prazo.text}` : prazo.text}
        </span>

        {motivo && <Badge tone="marca">{motivo}</Badge>}
        {origem && <Badge tone="neutro">{origem}</Badge>}
        {record.pendingProduct && <Badge tone="duplicado">Pendente de cadastro</Badge>}
        {zerado && <Badge tone="invalido">Saldo zerado</Badge>}
      </div>

      {record.note && <p className={styles.note}>{record.note}</p>}

      <div className={styles.foot}>
        <span className={styles.author}>
          {record.createdBy} · {formatDate(record.createdAt.slice(0, 10))}
        </span>

        {record.attachments.length > 0 && (
          <span className={styles.attachments}>
            <FileIcon width={14} height={14} />
            {record.attachments.length}
            <span className={styles.srOnly}>
              {record.attachments.length === 1 ? 'anexo' : 'anexos'}
            </span>
          </span>
        )}

        {/* Sem confirmação: o desfazer da tela resolve o engano sem cobrar um
            clique extra de toda exclusão de rotina (ver docs/dominio.md). */}
        <button
          type="button"
          className={styles.delete}
          onClick={() => onDelete(record)}
          aria-label={`Excluir registro de ${recordLabel(record)}`}
        >
          <TrashIcon width={16} height={16} />
          <span className={styles.deleteLabel}>Excluir</span>
        </button>
      </div>
    </article>
  )
}
