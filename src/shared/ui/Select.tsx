import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronRightIcon } from './icons'
import styles from './Select.module.css'

interface Option {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> {
  label: string
  options: Option[]
  hint?: string
  /** Oculta o rótulo visualmente, mantendo-o para leitores de tela. */
  hiddenLabel?: boolean
}

export function Select({ label, options, hint, hiddenLabel, ...rest }: SelectProps) {
  const id = useId()

  return (
    <div className={styles.field}>
      <label className={hiddenLabel ? 'sr-only' : styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.wrap}>
        <select className={styles.select} id={id} {...rest}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronRightIcon className={styles.chevron} width={16} height={16} />
      </div>

      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
