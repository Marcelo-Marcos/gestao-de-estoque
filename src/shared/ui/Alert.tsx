import type { ReactNode } from 'react'
import { AlertIcon, CheckIcon } from './icons'
import styles from './Alert.module.css'

type Tone = 'danger' | 'success' | 'info'

interface AlertProps {
  tone?: Tone
  children: ReactNode
}

/**
 * Nunca comunica só por cor: sempre acompanha ícone e texto, para funcionar
 * em daltonismo e em tela sob luz forte.
 */
export function Alert({ tone = 'info', children }: AlertProps) {
  const Icon = tone === 'success' ? CheckIcon : AlertIcon

  return (
    <div
      className={`${styles.alert} ${styles[tone]}`}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <Icon className={styles.icon} width={18} height={18} />
      <div>{children}</div>
    </div>
  )
}
