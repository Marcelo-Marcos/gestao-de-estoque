import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { TextField } from '@/shared/ui/TextField'
import { ArrowLeftIcon, CheckIcon } from '@/shared/ui/icons'
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
  validateOnBlur,
  validatePasswordConfirmation,
} from '@/shared/lib/validation'
import { AuthLayout } from '../components/AuthLayout'
import { resetPassword } from '../api'
import styles from '../components/authForm.module.css'

interface FieldErrors {
  password?: string
  confirmation?: string
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Derivado do estado, não copiado para outro useState.
  const requirements = useMemo(
    () => [
      { label: `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres`, met: password.length >= MIN_PASSWORD_LENGTH },
      { label: 'Uma letra', met: /[a-zA-Z]/.test(password) },
      { label: 'Um número', met: /[0-9]/.test(password) },
    ],
    [password],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors: FieldErrors = {
      password: validateNewPassword(password),
      confirmation: validatePasswordConfirmation(password, confirmation),
    }
    setFieldErrors(errors)
    if (errors.password || errors.confirmation) return

    setFormError(null)
    setSubmitting(true)

    const { error } = await resetPassword(token, password)

    setSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout title="Senha alterada">
        <div className={styles.confirmation}>
          <span className={styles.confirmationIcon}>
            <CheckIcon width={26} height={26} />
          </span>

          <p className={styles.confirmationText}>
            Sua senha foi atualizada. Use a nova senha para entrar no sistema.
          </p>

          <Button onClick={() => navigate('/entrar', { replace: true })}>
            Ir para o login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Criar nova senha" subtitle="Escolha uma senha que você não usa em outro lugar.">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert tone="danger">{formError}</Alert>}

        <TextField
          label="Nova senha"
          name="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          autoComplete="new-password"
          revealable
          autoFocus
          required
        />

        <ul className={styles.requirements}>
          {requirements.map((requirement) => (
            <li
              key={requirement.label}
              className={`${styles.requirement} ${requirement.met ? styles.requirementMet : ''}`}
            >
              <span className={styles.requirementDot}>
                {requirement.met ? <CheckIcon width={16} height={16} /> : '•'}
              </span>
              {requirement.label}
            </li>
          ))}
        </ul>

        <TextField
          label="Repita a nova senha"
          name="confirm-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          onBlur={() =>
            setFieldErrors((prev) => ({
              ...prev,
              confirmation: validateOnBlur(confirmation, (value) =>
                validatePasswordConfirmation(password, value),
              ),
            }))
          }
          error={fieldErrors.confirmation}
          autoComplete="new-password"
          revealable
          required
        />

        <Button type="submit" loading={submitting} fullWidth>
          {submitting ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
      </form>

      <div className={styles.center}>
        <Link className={styles.backLink} to="/entrar">
          <ArrowLeftIcon width={16} height={16} />
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  )
}
