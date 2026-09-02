import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from '@/shared/ui/Logo'
import { Button } from '@/shared/ui/Button'
import {
  BarcodeIcon,
  BoxIcon,
  CalendarIcon,
  MenuIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
} from '@/shared/ui/icons'
import { useAuth } from '@/features/auth'
import { useAppearance } from '@/features/settings'
import styles from './AppShell.module.css'

/**
 * Itens do menu.
 *
 * `adminOnly` esconde a entrada do operador. O cadastro de produtos é a bancada
 * do administrador: o operador alcança os produtos pela busca dentro do
 * registro de quebra, não por um item de menu — para ele aquela tela seria um
 * beco sem saída (ver docs/dominio.md).
 */
const NAV = [
  { to: '/validades', label: 'Validades', icon: CalendarIcon, ready: true, adminOnly: false },
  { to: '/quebra', label: 'Quebra', icon: BarcodeIcon, ready: true, adminOnly: false },
  {
    to: '/produtos',
    label: 'Cadastro de produtos',
    icon: BoxIcon,
    ready: true,
    adminOnly: true,
  },
  {
    to: '/configuracoes',
    label: 'Configurações',
    icon: SettingsIcon,
    ready: false,
    adminOnly: false,
  },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const { resolvedMode, setMode } = useAppearance()
  const [menuOpen, setMenuOpen] = useState(false)

  // Esc fecha a gaveta. Sem isto, quem navega por teclado fica preso: o menu
  // cobre a tela e a única saída seria alcançar o fundo escuro com o mouse.
  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className={styles.shell}>
      {menuOpen && (
        <button
          type="button"
          className={styles.scrim}
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <Logo size={36} />
        </div>

        <nav className={styles.nav}>
          {NAV.filter((item) => !item.adminOnly || user?.role === 'admin').map(({ to, label, icon: Icon, ready }) =>
            ready ? (
              <NavLink
                key={to}
                to={to}
                // Navegar fecha a gaveta: deixá-la aberta sobre a tela nova é
                // desorientador. É consequência do clique, não de um efeito
                // observando a rota depois que ela já mudou.
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <Icon />
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            ) : (
              <span key={to} className={styles.navItem} aria-disabled="true">
                <Icon />
                <span className={styles.navLabel}>{label}</span>
                <span className={styles.navSoon}>em breve</span>
              </span>
            ),
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.user}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userRole}>
              {user?.role === 'admin' ? 'Administrador' : 'Operador'}
            </span>
          </div>

          <div className={styles.sidebarActions}>
            <Button
              variant="secondary"
              onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
              aria-label={resolvedMode === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
            >
              {resolvedMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </Button>
            <Button variant="secondary" fullWidth onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </button>
          <Logo size={30} markOnly />
          <strong>Gestão de Validades</strong>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
