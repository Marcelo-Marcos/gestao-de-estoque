import { useCallback, useEffect } from 'react'
import { usePersistedState } from './usePersistedState'
import { storageKey } from '../lib/storage'

const SIDEBAR_KEY = storageKey('layout', 'barra-lateral')
const FOCUS_KEY = storageKey('layout', 'modo-foco')

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Barra lateral recolhida.
 *
 * Preferência de quem usa, não estado de tela: quem trabalha o dia todo na
 * lista deixa recolhida e não quer reabrir a cada visita.
 */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = usePersistedState<boolean>(SIDEBAR_KEY, false, isBoolean)
  const toggle = useCallback(() => setCollapsed((atual) => !atual), [setCollapsed])
  return { collapsed, toggle }
}

/**
 * Modo foco: o cabeçalho da página sai e a lista fica com a altura toda.
 *
 * É um só para o app inteiro, e não um por tela. Quem liga na tela de
 * validades espera encontrá-lo ligado na quebra — modo que se perde ao trocar
 * de tela vira um botão que ninguém usa.
 *
 * Esc desliga, porque é o que se espera de qualquer modo que esconde coisas:
 * sem essa saída, quem ligou sem querer precisa procurar o botão que sumiu do
 * lugar de onde ele olhava.
 */
export function useFocusMode() {
  const [focused, setFocused] = usePersistedState<boolean>(FOCUS_KEY, false, isBoolean)

  useEffect(() => {
    if (!focused) return

    const onKeyDown = (event: KeyboardEvent) => {
      // Um diálogo aberto trata o próprio Esc; não roubamos a tecla dele.
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return
      setFocused(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [focused, setFocused])

  const toggle = useCallback(() => setFocused((atual) => !atual), [setFocused])
  return { focused, toggle }
}
