import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { DownloadIcon, FileIcon } from '@/shared/ui/icons'
import { downloadBlob } from '@/shared/lib/download'
import {
  ATTACHMENT_LABELS,
  attachmentUrl,
  formatSize,
  getAttachmentFile,
  isImage,
} from '../attachments'
import type { Attachment } from '../types'
import styles from './AttachmentViewer.module.css'

interface AttachmentViewerProps {
  attachment: Attachment | null
  onClose: () => void
}

/**
 * Vê o anexo e o baixa.
 *
 * Imagem aparece na hora — é o caso comum, a foto da etiqueta que alguém quer
 * conferir sem sair da lista. Documento não tenta se mostrar: um PDF embutido
 * num diálogo pequeno é pior que o leitor do próprio sistema, então aqui ele
 * se apresenta e oferece o download.
 */
export function AttachmentViewer({ attachment, onClose }: AttachmentViewerProps) {
  if (!attachment) return null

  const url = attachmentUrl(attachment.id)
  const imagem = isImage(attachment)

  function baixar() {
    if (!attachment) return
    const file = getAttachmentFile(attachment.id)
    if (file) downloadBlob(file, attachment.fileName)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={ATTACHMENT_LABELS[attachment.kind]}
      subtitle={`${attachment.fileName} · ${formatSize(attachment.size)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={baixar} disabled={!url}>
            <DownloadIcon width={18} height={18} />
            <span>Baixar</span>
          </Button>
        </>
      }
    >
      {url && imagem && (
        <img className={styles.image} src={url} alt={ATTACHMENT_LABELS[attachment.kind]} />
      )}

      {url && !imagem && (
        <div className={styles.file}>
          <FileIcon className={styles.fileIcon} width={40} height={40} />
          <span className={styles.fileName}>{attachment.fileName}</span>
          <span className={styles.fileHint}>Baixe para abrir no leitor do seu aparelho.</span>
        </div>
      )}

      {/* PROVISÓRIO: sem servidor, os arquivos vivem na memória da aba. Depois
          de recarregar, o registro continua e o arquivo não — dizer isso é
          melhor que mostrar um quadro vazio sem explicação. */}
      {!url && (
        <div className={styles.file}>
          <FileIcon className={styles.fileIcon} width={40} height={40} />
          <span className={styles.fileName}>Arquivo indisponível</span>
          <span className={styles.fileHint}>
            Os anexos ainda ficam só na memória do navegador e se perdem ao recarregar a página.
          </span>
        </div>
      )}
    </Dialog>
  )
}
