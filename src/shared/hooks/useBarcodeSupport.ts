import { useEffect, useState } from 'react'
import { supportedBarcodeFormats } from '../lib/barcode'

/**
 * Formatos que este aparelho lê. Vazio enquanto a consulta não responde e
 * também quando não há suporte — quem chama trata os dois casos igual: sem
 * leitura, sem botão.
 *
 * Esconder o botão é melhor que mostrá-lo e falhar no clique: uma tela que
 * oferece o que não pode entregar só é descoberta no erro (ver CLAUDE.md).
 */
export function useBarcodeSupport(): string[] {
  const [formats, setFormats] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    supportedBarcodeFormats().then((disponiveis) => {
      if (!cancelled) setFormats(disponiveis)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return formats
}
