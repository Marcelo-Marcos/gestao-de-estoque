import styles from './Progress.module.css'

interface ProgressProps {
  value: number
  max: number
  label: string
}

/**
 * Barra de progresso com o número ao lado.
 *
 * A porcentagem sozinha não diz o tamanho do trabalho: "38%" de uma importação
 * pode ser 4 ou 4 mil linhas. Por isso a contagem aparece junto.
 *
 * O `role="progressbar"` com os valores em aria faz o leitor de tela anunciar
 * o avanço — uma barra puramente visual não existe para quem não a vê.
 */
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
