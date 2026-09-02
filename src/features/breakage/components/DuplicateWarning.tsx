import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { Badge } from '@/shared/ui/Badge'
import { FileIcon } from '@/shared/ui/icons'
import { formatDate } from '@/shared/lib/date'
import { labelOf } from '../tags'
import type { LossRecord, Tag } from '../types'
import styles from './DuplicateWarning.module.css'

interface DuplicateWarningProps {
  open: boolean
  existing: LossRecord | null
  reasons: Tag[]
  /** Quantidade que o usuário acabou de informar. */
  quantity: number
  busy: boolean
  onClose: () => void
  onCreateSeparate: () => void
  onAddToExisting: () => void
}

/**
 * Aviso de que já existe um registro com o mesmo produto, validade e motivo.
 *
 * **Avisa, não impede.** A repetição é legítima: a mesma mercadoria pode chegar
 * vencida duas vezes, cada vez com seu e-mail de divergência — são duas
 * ocorrências, e juntá-las perderia a prova de cada uma.
 *
 * A chave é produto + validade + motivo justamente para o aviso ser raro. Se
 * disparasse só por produto, apareceria o tempo todo, e aviso que aparece
 * sempre vira aviso que ninguém lê.
 */
export function DuplicateWarning({
  open,
  existing,
  reasons,
  quantity,
  busy,
  onClose,
  onCreateSeparate,
  onAddToExisting,
}: DuplicateWarningProps) {
  if (!existing) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Já existe um registro igual"
      subtitle="Mesmo produto, mesma validade e mesmo motivo."
      footer={
        <>
          <Button variant="secondary" onClick={onAddToExisting} loading={busy}>
            Somar ao existente
          </Button>
          <Button onClick={onCreateSeparate} loading={busy}>
            Criar registro separado
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <div className={styles.existing}>
          <div className={styles.head}>
            <Badge tone="duplicado">{labelOf(reasons, existing.reasonId)}</Badge>
            <span className={styles.when}>
              registrado em {formatDate(existing.createdAt.slice(0, 10))} por{' '}
              {existing.createdBy}
            </span>
          </div>

          <div className={styles.amount}>
            <span className={styles.quantity}>{existing.quantity}</span>
            <span className={styles.detail}>
              {existing.quantity === 1 ? 'unidade' : 'unidades'}
              {existing.expiryDate && ` · validade ${formatDate(existing.expiryDate)}`}
            </span>
          </div>

          {existing.attachments.length > 0 && (
            <span className={styles.meta}>
              <FileIcon className={styles.metaIcon} width={15} height={15} />
              {existing.attachments.map((a) => a.fileName).join(' · ')}
            </span>
          )}
        </div>

        <p className={styles.explain}>
          Se esta é <span className={styles.strong}>outra ocorrência</span> — o material chegou
          de novo, com outro documento — crie um registro separado. Se é a mesma, some as{' '}
          <span className={styles.strong}>{quantity}</span>{' '}
          {quantity === 1 ? 'unidade' : 'unidades'} ao que já existe.
        </p>
      </div>
    </Dialog>
  )
}
