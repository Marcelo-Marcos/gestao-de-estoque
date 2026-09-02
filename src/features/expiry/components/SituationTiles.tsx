import { SITUATIONS, SITUATION_ORDER, type Situation } from '../situation'
import { SituationIcon } from './SituationIcon'
import styles from './SituationTiles.module.css'

interface SituationTilesProps {
  counts: Record<Situation, number>
  /** Faixas ligadas; vazio mostra todas. */
  selected: Situation[]
  onToggle: (situation: Situation) => void
}

/**
 * Os quatro números do topo, cada um filtrando a lista abaixo.
 *
 * As contagens vêm sempre da base inteira, não do resultado filtrado: um
 * cartão que muda de número ao ser clicado deixaria de servir como panorama.
 */
export function SituationTiles({ counts, selected, onToggle }: SituationTilesProps) {
  return (
    <div className={styles.tiles}>
      {SITUATION_ORDER.map((situation) => {
        const { label, hint, token } = SITUATIONS[situation]
        const active = selected.includes(situation)

        return (
          <button
            type="button"
            key={situation}
            className={`${styles.tile} ${active ? styles.active : ''}`}
            aria-pressed={active}
            onClick={() => onToggle(situation)}
            style={
              {
                '--situation': `var(--situation-${token})`,
                '--situation-soft': `var(--situation-${token}-soft)`,
                '--situation-text': `var(--situation-${token}-text)`,
              } as React.CSSProperties
            }
          >
            <span className={styles.head}>
              <SituationIcon situation={situation} size={16} />
              <span className={styles.label}>{label}</span>
            </span>
            <span className={styles.value}>{counts[situation].toLocaleString('pt-BR')}</span>
            <span className={styles.hint}>{hint}</span>
          </button>
        )
      })}
    </div>
  )
}
