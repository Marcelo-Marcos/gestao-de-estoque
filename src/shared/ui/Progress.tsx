import styles from './Progress.module.css'

interface ProgressProps {
  value: number
  max: number
  label: string
}

export function Progress({ value, max, label }: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        <span>{label}</span>
        <span className={styles.count}>
          {value.toLocaleString('pt-BR')} de {max.toLocaleString('pt-BR')}
        </span>
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
