import { useCallback, useState } from 'react'
import { readOrigins, readReasons, writeOrigins, writeReasons } from '../tags'
import type { Tag } from '../types'

/**
 * As listas de motivo e origem, prontas para o formulário.
 *
 * Ficam em estado porque mudam quando alguém cria uma etiqueta durante o
 * preenchimento; reler o storage a cada render não deixaria a tela mais em dia
 * e custaria uma leitura por tecla digitada.
 *
 * A lista é uma só, da loja: se cada pessoa mantivesse a própria, "danificado",
 * "danificada" e "avaria" virariam três motivos e a soma por motivo deixaria de
 * fechar (ver docs/dominio.md).
 */
export function useTagLists() {
  const [reasons, setReasons] = useState<Tag[]>(() => readReasons())
  const [origins, setOrigins] = useState<Tag[]>(() => readOrigins())

  const addReason = useCallback((tag: Tag) => {
    setReasons((current) => {
      const next = [...current, tag]
      writeReasons(next)
      return next
    })
  }, [])

  const addOrigin = useCallback((tag: Tag) => {
    setOrigins((current) => {
      const next = [...current, tag]
      writeOrigins(next)
      return next
    })
  }, [])

  return { reasons, origins, addReason, addOrigin }
}
