import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeTone = 'novo' | 'existente' | 'duplicado' | 'invalido' | 'neutro' | 'marca'

export function Badge({ tone = 'neutro', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}
