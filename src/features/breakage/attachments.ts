/**
 * Os arquivos anexados aos registros.
 *
 * PROVISÓRIO: sem servidor, os arquivos vivem na memória da aba e somem ao
 * recarregar — o mesmo que já vale para os registros. Ficam separados do
 * `LossRecord` de propósito: quando houver servidor, o registro passa a
 * guardar uma URL e só este arquivo muda.
 */
import type { Attachment, AttachmentKind } from './types'

const arquivos = new Map<string, File>()

/** URLs já criadas, para não gerar uma nova a cada abertura do visualizador. */
const urls = new Map<string, string>()

export function putAttachmentFile(id: string, file: File): void {
  arquivos.set(id, file)
}

export function getAttachmentFile(id: string): File | null {
  return arquivos.get(id) ?? null
}

/**
 * Endereço para mostrar o arquivo na tela.
 *
 * A URL é criada uma vez por anexo e mantida: revogá-la ao fechar o
 * visualizador quebraria a próxima abertura, e são poucos arquivos por sessão.
 */
export function attachmentUrl(id: string): string | null {
  const existente = urls.get(id)
  if (existente) return existente

  const file = arquivos.get(id)
  if (!file) return null

  const url = URL.createObjectURL(file)
  urls.set(id, url)
  return url
}

export const ATTACHMENT_LABELS: Record<AttachmentKind, string> = {
  'foto-produto': 'Foto do produto',
  'foto-etiqueta': 'Foto da etiqueta',
  documento: 'Documento',
}

/** O que cada espaço aceita: foto abre a câmera, documento aceita PDF também. */
export const ATTACHMENT_ACCEPT: Record<AttachmentKind, string> = {
  'foto-produto': 'image/*',
  'foto-etiqueta': 'image/*',
  documento: 'application/pdf,image/*',
}

export function isImage(attachment: Attachment): boolean {
  return attachment.mimeType.startsWith('image/')
}

/** "2,3 MB" — o número cru em bytes não diz nada a quem vai baixar. */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
