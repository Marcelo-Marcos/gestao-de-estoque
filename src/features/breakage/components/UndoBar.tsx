import { Button } from '@/shared/ui/Button'
import { CloseIcon, TrashIcon } from '@/shared/ui/icons'
import { recordLabel } from '../label'
import type { LossRecord } from '../types'
import styles from './UndoBar.module.css'

interface UndoBarProps {
  record: LossRecord | null
  onUndo: () => void
  onDismiss: () => void
}

/**
 * A contrapartida da exclusão sem confirmação.
 *
 * Fica fixa no rodapé porque no celular a lista rola: um aviso no topo sumiria
 * da tela junto com o registro excluído, e o desfazer só serve enquanto está à
 * vista.
 */
export function UndoBar({ record, onUndo, onDismiss }: UndoBarProps) {
  if (!record) return null

  return (
    <div className={styles.bar} role="status">
      <TrashIcon className={styles.icon} width={18} height={18} />
      <span className={styles.text}>
        Registro de <strong>{recordLabel(record)}</strong> excluído.
      </span>
      <Button variant="secondary" onClick={onUndo}>
        Desfazer
      </Button>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="Dispensar">
        <CloseIcon width={16} height={16} />
      </button>
    </div>
  )
}
