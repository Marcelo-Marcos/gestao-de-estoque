import styles from './Logo.module.css'

interface LogoProps {
  /** Tamanho do símbolo em px. */
  size?: number
  /** Oculta o texto — usado em barras estreitas. */
  markOnly?: boolean
}

/**
 * O símbolo é uma etiqueta de lote atravessada pela "faixa de validade":
 * três segmentos que vão de vencido (vermelho) a dentro do prazo (verde).
 * É o elemento que se repete no resto do app — nos cards e nas linhas de
 * produto — para que a cor sempre signifique a mesma coisa.
 */
export function Logo({ size = 40, markOnly = false }: LogoProps) {
  return (
    <span className={styles.logo}>
      <svg
        className={styles.mark}
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        role="img"
        aria-label="Gestão de Validades"
      >
        <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--surface)" />
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          stroke="var(--border-strong)"
          strokeWidth="1"
        />
        {/* A faixa: vencido → vence em breve → dentro do prazo. */}
        <rect x="9" y="9" width="5" height="22" rx="2.5" fill="var(--expired)" />
        <rect x="17.5" y="13" width="5" height="18" rx="2.5" fill="var(--warning)" />
        <rect x="26" y="18" width="5" height="13" rx="2.5" fill="var(--ok)" />
      </svg>

      {!markOnly && (
        <span className={styles.wordmark}>
          <span className={styles.name}>Gestão de Validades</span>
          <span className={styles.tagline}>Controle de estoque</span>
        </span>
      )}
    </span>
  )
}
