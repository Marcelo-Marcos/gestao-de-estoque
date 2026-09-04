import { CameraIcon, FileIcon, ImageIcon } from '@/shared/ui/icons'
import { ATTACHMENT_LABELS } from '../attachments'
import type { Attachment, AttachmentKind } from '../types'
import styles from './AttachmentChips.module.css'

const ICONS: Record<AttachmentKind, typeof CameraIcon> = {
  'foto-produto': CameraIcon,
  'foto-etiqueta': ImageIcon,
  documento: FileIcon,
}

interface AttachmentChipsProps {
  attachments: Attachment[]
  onOpen: (attachmentId: string) => void
}

/**
 * Os anexos de um registro, um ícone por tipo.
 *
 * Um ícone por tipo, e não um contador: "3 anexos" não diz se o que falta é a
 * foto da etiqueta ou o e-mail da divergência, que é justamente a pergunta de
 * quem confere. Cada um abre o arquivo.
 */
export function AttachmentChips({ attachments, onOpen }: AttachmentChipsProps) {
  if (attachments.length === 0) {
    return <span className={styles.empty}>—</span>
  }

  return (
    <span className={styles.chips}>
      {attachments.map((anexo) => {
        const Icon = ICONS[anexo.kind]
        const rotulo = `${ATTACHMENT_LABELS[anexo.kind]}: ${anexo.fileName}`

        return (
          <button
            key={anexo.id}
            type="button"
            className={styles.chip}
            onClick={() => onOpen(anexo.id)}
            aria-label={`Abrir ${rotulo}`}
            title={rotulo}
          >
            <Icon width={16} height={16} />
          </button>
        )
      })}
    </span>
  )
}
