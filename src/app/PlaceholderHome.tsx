import { Button } from '@/shared/ui/Button'
import { Logo } from '@/shared/ui/Logo'
import { useAuth } from '@/features/auth'
import styles from './PlaceholderHome.module.css'

/**
 * Provisório: existe só para confirmar que o login leva a algum lugar.
 * Será substituído pelo painel quando construirmos as próximas telas.
 */
export function PlaceholderHome() {
  const { user, signOut } = useAuth()

  return (
    <div className={styles.page}>
      <Logo size={48} />
      <span className={styles.badge}>{user?.role === 'admin' ? 'Administrador' : 'Operador'}</span>
      <h1 className={styles.title}>Olá, {user?.name}</h1>
      <p className={styles.text}>
        O login está funcionando. As telas do painel — produtos, validades e importação — vêm
        nas próximas etapas.
      </p>
      <Button variant="secondary" onClick={signOut}>
        Sair
      </Button>
    </div>
  )
}
