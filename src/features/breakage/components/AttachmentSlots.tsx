import { CameraIcon, BarcodeIcon, FileIcon } from '@/shared/ui/icons'
import type { Attachment, AttachmentKind } from '../types'
import styles from './AttachmentSlots.module.css'

interface AttachmentSlotsProps {
  attachments: Attachment[]
  onToggle: (kind: AttachmentKind) => void
}

const SLOTS: Array<{ kind: AttachmentKind; label: string; Icon: typeof CameraIcon }> = [
  { kind: 'foto-produto', label: 'Foto do produto', Icon: CameraIcon },
  { kind: 'foto-etiqueta', label: 'Etiqueta do lote', Icon: BarcodeIcon },
  { kind: 'documento', label: 'Documento', Icon: FileIcon },
]

/**
 * Anexos do registro.
 *
 * **Nenhum é obrigatório**, nem no motivo mais grave. Registro incompleto é
 * melhor que registro que não acontece porque o celular ficou sem bateria no
 * corredor — e o que falta pode ser anexado depois (ver docs/dominio.md).
 *
 * PROVISÓRIO: sem servidor não há upload, então o clique apenas marca o espaço
 * como preenchido. A escolha do arquivo entra quando houver onde guardá-lo.
 */
export function AttachmentSlots({ attachments, onToggle }: AttachmentSlotsProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        Anexos <span className={styles.hint}>(ajudam a comprovar)</span>
      </span>

      <div className={styles.slots}>
        {SLOTS.map(({ kind, label, Icon }) => {
          const anexo = attachments.find((a) => a.kind === kind)

          return (
            <button
              type="button"
              key={kind}
              className={`${styles.slot} ${anexo ? styles.filled : ''}`}
              aria-pressed={Boolean(anexo)}
              onClick={() => onToggle(kind)}
            >
              <Icon className={anexo ? styles.filledIcon : undefined} width={22} height={22} />
              <span className={styles.fileName}>{anexo ? anexo.fileName : label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
