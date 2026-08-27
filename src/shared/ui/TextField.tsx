import { useId, useState, forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { AlertIcon, EyeIcon, EyeOffIcon } from './icons'
import styles from './TextField.module.css'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  /** Adiciona o botão de mostrar/ocultar senha. */
  revealable?: boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, optional = false, revealable = false, type = 'text', className, ...rest },
  ref,
) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)

  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  const inputType = revealable ? (revealed ? 'text' : 'password') : type

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional && <span className={styles.optional}> (opcional)</span>}
      </label>

      <div className={styles.inputWrap}>
        <input
          {...rest}
          ref={ref}
          id={id}
          type={inputType}
          className={[
            styles.input,
            revealable ? styles.hasAction : '',
            error ? styles.invalid : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        />

        {revealable && (
          <button
            type="button"
            className={styles.action}
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={revealed}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {hint && !error && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className={styles.error} id={errorId}>
          <AlertIcon width={16} height={16} />
          {error}
        </p>
      )}
    </div>
  )
})
