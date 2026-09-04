import { useState } from 'react'
import { Button } from './Button'
import { UploadIcon } from './icons'
import styles from './ExportButton.module.css'

interface ExportButtonProps {
  /** Quantos registros vão no arquivo. Zero desabilita o botão. */
  count: number
  /** Monta e entrega a planilha. Síncrono: roda com o botão já em espera. */
  onExport: () => void
}

/**
 * Exportar a lista visível para planilha.
 *
 * Mesmo lugar e mesmo rótulo em toda tela com registros, para não virar três
 * botões parecidos com nomes diferentes.
 *
 * A escrita do arquivo é síncrona e trava a aba enquanto acontece — com 26 mil
 * produtos isso é perceptível. Por isso o botão entra em espera e só então
 * cede um quadro ao navegador: sem essa pausa, o estado de espera nunca chega
 * a ser desenhado e a tela parece travada sem explicação.
 */
export function ExportButton({ count, onExport }: ExportButtonProps) {
  const [busy, setBusy] = useState(false)

  function handleClick() {
    setBusy(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          onExport()
        } finally {
          setBusy(false)
        }
      })
    })
  }

  return (
    <Button
      variant="secondary"
      disabled={count === 0 || busy}
      loading={busy}
      aria-label="Exportar para Excel"
      onClick={handleClick}
    >
      <UploadIcon className={styles.icon} width={18} height={18} />
      <span className={styles.label}>Exportar Excel</span>
    </Button>
  )
}
