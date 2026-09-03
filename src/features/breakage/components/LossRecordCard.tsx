import type { MouseEvent } from 'react'
import { Badge } from '@/shared/ui/Badge'
import { CalendarIcon, ChevronRightIcon, EditIcon, FileIcon, TrashIcon } from '@/shared/ui/icons'
import { daysUntil, formatDate } from '@/shared/lib/date'
import { recordLabel } from '../label'
import { labelOf } from '../tags'
import type { LossRecord, Tag } from '../types'
import styles from './LossRecordCard.module.css'

interface LossRecordCardProps {
  record: LossRecord
  reasons: Tag[]
  origins: Tag[]
  selected: boolean
  /** Tela estreita: os botões saem e o cartão inteiro abre a edição. */
  compact: boolean
  onToggleSelect: (id: string) => void
  onEdit: (record: LossRecord) => void
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
  return { token: restantes <= 30 ? 'warning' : 'ok', text: `vence em ${restantes} dias` }
}

/**
 * Um registro de perda.
 *
 * Cartão em vez de linha de tabela porque a tela é usada no corredor, no
 * celular: o que interessa — o produto, quanto e por quê — precisa caber sem
 * rolagem lateral.
 *
 * No celular os botões de editar e excluir saem. Não cabem na linha dos chips
 * (um motivo comprido já ocupa a largura toda) e numa linha própria custavam
 * 52px por registro — quase meio cartão a menos na tela. No lugar deles, o
 * cartão inteiro abre a edição, e a exclusão vem pela seleção, que já existe e
 * serve melhor quando é mais de um.
 */
export function LossRecordCard({
  record,
  reasons,
  origins,
  selected,
  compact,
  onToggleSelect,
  onEdit,
  onDelete,
}: LossRecordCardProps) {
  const prazo = deadline(record)
  const motivo = labelOf(reasons, record.reasonId)
  const origem = labelOf(origins, record.originId)
  const zerado = record.quantity <= 0

  /**
   * Só abre a edição num clique que não era de outra coisa: marcar a caixa de
   * seleção ou selecionar o texto do código de barras para copiar continuam
   * fazendo o que a pessoa esperava.
   */
  function handleClick(event: MouseEvent<HTMLElement>) {
    if (!compact) return
    if ((event.target as HTMLElement).closest('button, input, label, a')) return
    if (window.getSelection()?.toString()) return
    onEdit(record)
  }

  return (
    <article
      className={`${styles.card} ${zerado ? styles.zeroed : ''} ${selected ? styles.selected : ''} ${
        compact ? styles.tappable : ''
      }`}
      onClick={handleClick}
    >
      <div className={styles.head}>
        {/* A caixa fica no cartão, e não numa barra que aparece só depois de um
            "modo seleção": marcar o segundo item não pode custar dois toques. */}
        <label className={styles.select}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={selected}
            onChange={() => onToggleSelect(record.id)}
          />
          <span className={styles.srOnly}>Selecionar {recordLabel(record)}</span>
        </label>

        <div className={styles.identity}>
          {/* No celular quem carrega a ação é o título, não o <article>: um
              botão não pode conter caixa de seleção e outros controles, ou o
              leitor de tela anuncia tudo como um bloco só. O clique no resto do
              cartão é atalho por cima disso, não o único caminho. */}
          <h2 className={styles.description}>
            {compact ? (
              <button
                type="button"
                className={styles.open}
                onClick={() => onEdit(record)}
                aria-label={`Editar registro de ${recordLabel(record)}`}
              >
                {record.description || 'Sem descrição'}
              </button>
            ) : (
              (record.description ?? '') || 'Sem descrição'
            )}
          </h2>
          <span className={styles.codes}>
            {record.sku ? `SKU ${record.sku}` : 'SKU pendente'}
            {record.barcode && <span className={styles.barcode}>{record.barcode}</span>}
          </span>
          {/* Quem apontou e quando ficam junto da identidade, e não numa linha
              própria: era a linha mais barata de cortar, e cada uma cortada é
              meio registro a mais visível na lista. */}
          <span className={styles.author}>
            {record.createdBy} · {formatDate(record.createdAt.slice(0, 10))}
          </span>
        </div>

        <div className={styles.quantity}>
          <span className={styles.quantityValue}>{record.quantity}</span>
          <span className={styles.quantityLabel}>un</span>
        </div>

        {/* Sinal de que o cartão abre: sem ele, tocar para editar é um segredo. */}
        {compact && <ChevronRightIcon className={styles.chevron} width={18} height={18} />}
      </div>

      {record.note && <p className={styles.note}>{record.note}</p>}

      <div className={styles.bottom}>
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

          {record.attachments.length > 0 && (
            <span className={styles.attachments}>
              <FileIcon width={14} height={14} />
              {record.attachments.length}
              <span className={styles.srOnly}>
                {record.attachments.length === 1 ? 'anexo' : 'anexos'}
              </span>
            </span>
          )}
        </div>

        {!compact && (
          <div className={styles.foot}>
            <button
              type="button"
              className={styles.action}
              onClick={() => onEdit(record)}
              aria-label={`Editar registro de ${recordLabel(record)}`}
            >
              <EditIcon width={16} height={16} />
              <span className={styles.actionLabel}>Editar</span>
            </button>

            {/* Sem confirmação: o desfazer da tela resolve o engano sem cobrar
                um clique extra de toda exclusão de rotina (ver docs/dominio.md). */}
            <button
              type="button"
              className={`${styles.action} ${styles.delete}`}
              onClick={() => onDelete(record)}
              aria-label={`Excluir registro de ${recordLabel(record)}`}
            >
              <TrashIcon width={16} height={16} />
              <span className={styles.actionLabel}>Excluir</span>
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
