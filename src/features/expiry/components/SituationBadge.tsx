import { SITUATIONS, type Situation } from '../situation'
import { SituationIcon } from './SituationIcon'
import styles from './SituationBadge.module.css'

/**
 * Etiqueta da situação.
 *
 * Cor, ícone e texto sempre juntos: quem não distingue vermelho de âmbar, ou
 * está com o celular sob sol forte, ainda lê a faixa (ver CLAUDE.md).
 */
export function SituationBadge({ situation }: { situation: Situation }) {
  const { label, token } = SITUATIONS[situation]

  return (
    <span
      className={styles.badge}
      style={
        {
          '--situation': `var(--situation-${token})`,
          '--situation-soft': `var(--situation-${token}-soft)`,
          '--situation-text': `var(--situation-${token}-text)`,
        } as React.CSSProperties
      }
    >
      <SituationIcon className={styles.icon} situation={situation} size={13} />
      {label}
    </span>
  )
}
