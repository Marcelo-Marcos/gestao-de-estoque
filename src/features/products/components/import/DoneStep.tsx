import { Progress } from '@/shared/ui/Progress'
import { CheckIcon } from '@/shared/ui/icons'
import type { Progress as ProgressValue } from '../../import/useImportWizard'
import styles from './DoneStep.module.css'

export function ApplyingStep({ progress }: { progress: ProgressValue }) {
  return (
    <div className={styles.progress}>
      <Progress value={progress.done} max={progress.total} label="Importando produtos" />
    </div>
  )
}

interface DoneStepProps {
  imported: number
  /** Quantos foram ignorados por já existirem. */
  skipped: number
}

export function DoneStep({ imported, skipped }: DoneStepProps) {
  return (
    <div className={styles.center}>
      <span className={styles.icon}>
        <CheckIcon width={26} height={26} />
      </span>

      <p className={styles.text}>
        <strong>{imported.toLocaleString('pt-BR')}</strong> produtos foram adicionados ao
        cadastro.
        {skipped > 0 && (
          <> Outros {skipped.toLocaleString('pt-BR')} já existiam e ficaram como estavam.</>
        )}
      </p>
    </div>
  )
}
