import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { TextField } from '@/shared/ui/TextField'
import { validateEmail, validateOnBlur, validateRequiredPassword } from '@/shared/lib/validation'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../AuthContext'
import styles from '../components/authForm.module.css'

interface FieldErrors {
  email?: string
  password?: string
}

/**
 * Tela de entrada.
 *
 * A mensagem de erro é a mesma para e-mail inexistente e senha errada (ver
 * `api.ts`): distinguir os dois transformaria esta tela numa forma de
 * descobrir quais e-mails estão cadastrados.
 */
export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Padrão ligado: é uso interno e diário — obrigar login toda manhã é
  // fricção sem ganho real de segurança neste contexto.
  const [remember, setRemember] = useState(true)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/validades'
    return <Navigate to={from} replace />
  }

  function validate(): FieldErrors {
    return {
      email: validateEmail(email),
      password: validateRequiredPassword(password),
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validate()
    setFieldErrors(errors)
    if (errors.email || errors.password) return

    setFormError(null)
    setSubmitting(true)

    const { error } = await signIn({ email, password }, remember)

    setSubmitting(false)

    // O formulário nunca é limpo depois de um erro: perder o que foi digitado
    // é a fricção mais irritante para quem usa o sistema o dia inteiro.
    if (error) {
      setFormError(error.message)
      return
    }

    const from = (location.state as { from?: string } | null)?.from ?? '/validades'
    navigate(from, { replace: true })
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse o painel de validades da sua loja.">
      {/* noValidate desliga a validação do navegador: as mensagens dele são
          em inglês, aparecem em balões que somem sozinhos e não seguem o
          tema. A validação daqui fica ao lado do campo e permanece na tela. */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert tone="danger">{formError}</Alert>}

        <TextField
          label="E-mail"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() =>
            setFieldErrors((prev) => ({ ...prev, email: validateOnBlur(email, validateEmail) }))
          }
          error={fieldErrors.email}
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="voce@empresa.com.br"
          autoFocus
          required
        />

        <TextField
          label="Senha"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() =>
            setFieldErrors((prev) => ({
              ...prev,
              password: validateOnBlur(password, validateRequiredPassword),
            }))
          }
          error={fieldErrors.password}
          autoComplete="current-password"
          placeholder="Sua senha"
          revealable
          required
        />

        <div className={styles.row}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Manter conectado
          </label>

          <Link className={styles.link} to="/esqueci-a-senha">
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" loading={submitting} fullWidth>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className={styles.demo}>
        <span className={styles.demoTitle}>Contas de teste (enquanto não há servidor)</span>
        Administrador: <code>admin@exemplo.com.br</code>
        <br />
        Operador: <code>operador@exemplo.com.br</code>
        <br />
        Senha: <code>senha123</code>
      </p>
    </AuthLayout>
  )
}
