import type { Step } from '../../import/useImportWizard'
import styles from './WizardSteps.module.css'

const LABELS: Array<{ id: Step; label: string }> = [
  { id: 'arquivo', label: 'Arquivo' },
  { id: 'mapeamento', label: 'Colunas' },
  { id: 'revisao', label: 'Revisão' },
  { id: 'resumo', label: 'Conclusão' },
]

/** Mostra em que ponto do processo o usuário está, e quanto falta. */
export function WizardSteps({ step }: { step: Step }) {
  // 'aplicando' não é uma parada do trilho: é a última etapa em andamento.
  const currentIndex = LABELS.findIndex((s) => s.id === (step === 'aplicando' ? 'resumo' : step))

  return (
    <ol className={styles.steps}>
      {LABELS.map((s, index) => (
        <li
          key={s.id}
          className={[
            styles.step,
            index === currentIndex ? styles.current : '',
            index < currentIndex ? styles.done : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-current={index === currentIndex ? 'step' : undefined}
        >
          <span className={styles.number}>{index < currentIndex ? '✓' : index + 1}</span>
          {s.label}
          {index < LABELS.length - 1 && <span className={styles.divider} />}
        </li>
      ))}
    </ol>
  )
}
