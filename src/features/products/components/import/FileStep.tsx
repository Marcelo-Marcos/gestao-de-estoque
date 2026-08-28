import { useState } from 'react'
import type { DragEvent } from 'react'
import { UploadIcon } from '@/shared/ui/icons'
import styles from './FileStep.module.css'

interface FileStepProps {
  busy: boolean
  onSelect: (file: File) => void
}

export function FileStep({ busy, onSelect }: FileStepProps) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)

    const file = event.dataTransfer.files[0]
    if (file) onSelect(file)
  }

  return (
    <label
      className={`${styles.dropzone} ${dragging ? styles.active : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <UploadIcon width={32} height={32} />
      <span className={styles.title}>
        {busy ? 'Lendo a planilha…' : 'Arraste a planilha aqui'}
      </span>
      <span className={styles.hint}>ou clique para escolher — aceita .xlsx e .csv</span>

      <input
        className={styles.input}
        type="file"
        accept=".xlsx,.csv,.txt,.tsv"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onSelect(file)
          // Permite escolher o mesmo arquivo de novo depois de um erro.
          event.target.value = ''
        }}
      />
    </label>
  )
}
