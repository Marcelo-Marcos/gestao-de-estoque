import { Button } from '@/shared/ui/Button'
import { CloseIcon, TrashIcon } from '@/shared/ui/icons'
import { recordLabel } from '../label'
import type { LossRecord } from '../types'
import styles from './UndoBar.module.css'

interface UndoBarProps {
  records: LossRecord[]
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
export function UndoBar({ records, onUndo, onDismiss }: UndoBarProps) {
  if (records.length === 0) return null

  return (
    <div className={styles.bar} role="status">
      <TrashIcon className={styles.icon} width={18} height={18} />
      <span className={styles.text}>
        {records.length === 1 ? (
          <>
            Registro de <strong>{recordLabel(records[0])}</strong> excluído.
          </>
        ) : (
          <>
            <strong>{records.length} registros</strong> excluídos.
          </>
        )}
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
