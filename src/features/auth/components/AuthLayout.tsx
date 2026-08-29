import type { ReactNode } from 'react'
import { Logo } from '@/shared/ui/Logo'
import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
}

/**
 * Legenda da faixa de validade, mostrada no painel lateral do login.
 *
 * Ensina o código de cores antes do primeiro acesso: quando a pessoa chega às
 * listas, vermelho, âmbar e verde já significam alguma coisa. Sem isso, a cor
 * viraria decoração até alguém explicar.
 */
const LEGEND = [
  { color: 'var(--expired)', label: 'Vencido', text: 'já passou da data' },
  { color: 'var(--warning)', label: 'Vence em breve', text: 'dentro do prazo de alerta' },
  { color: 'var(--ok)', label: 'Dentro do prazo', text: 'gira antes de vencer' },
]

/**
 * Moldura das telas de autenticação (entrar, recuperar senha, criar senha).
 *
 * Divide em duas colunas no desktop: apresentação à esquerda, formulário à
 * direita. No celular a apresentação some — ali o objetivo é entrar, e rolar
 * texto institucional antes do campo de e-mail só atrapalha.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <Logo size={44} />

        <div>
          <h2 className={styles.asideHeadline}>
            Nenhum produto deveria vencer na prateleira sem ninguém perceber.
          </h2>
          <p className={styles.asideText}>
            Acompanhe validade, saldo e giro dos produtos em um só lugar — e receba o aviso
            enquanto ainda dá tempo de vender.
          </p>

          <ul className={styles.legend}>
            {LEGEND.map((item) => (
              <li className={styles.legendItem} key={item.label}>
                <span className={styles.legendBar} style={{ background: item.color }} />
                <span>
                  <span className={styles.legendLabel}>{item.label}</span> — {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <span />
      </aside>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.mobileLogo}>
            <Logo size={40} />
          </div>

          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>

          {children}
        </div>
      </main>
    </div>
  )
}
