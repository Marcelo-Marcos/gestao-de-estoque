/** Validações puras, sem React — reaproveitadas por qualquer formulário. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Valida ao sair do campo, mas só depois que a pessoa digitou alguma coisa.
 * Acusar "informe seu e-mail" em um campo que ela apenas tangenciou é
 * corretivo sem motivo — a cobrança de campo obrigatório fica para o envio.
 */
export function validateOnBlur(
  value: string,
  validate: (value: string) => string | undefined,
): string | undefined {
  return value.trim() ? validate(value) : undefined
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Informe seu e-mail.'
  if (!EMAIL_RE.test(email)) return 'E-mail inválido. Confira o endereço.'
  return undefined
}

export function validateRequiredPassword(value: string): string | undefined {
  if (!value) return 'Informe sua senha.'
  return undefined
}

export const MIN_PASSWORD_LENGTH = 8

/** Regra usada apenas ao criar/redefinir senha, não ao entrar. */
export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Crie uma senha.'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa de pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return 'A senha precisa misturar letras e números.'
  }
  return undefined
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (!confirmation) return 'Repita a senha.'
  if (password !== confirmation) return 'As senhas não são iguais.'
  return undefined
}
