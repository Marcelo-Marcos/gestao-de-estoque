import type { IsoDate } from '@/shared/lib/date'

/**
 * Etiqueta escolhida pelo usuário. Dois eixos separados usam a mesma forma:
 * o **motivo** (por que virou perda) e a **origem** (de onde veio o problema).
 *
 * Juntar os dois numa lista só faria as opções crescerem por combinação
 * — "danificado", "danificado do CD", "vencido do CD" — e os relatórios
 * deixariam de separar "quanto perdemos por avaria" de "quanto disso veio do
 * CD" (ver docs/dominio.md).
 */
export interface Tag {
  id: string
  label: string
  /** Marca as etiquetas que já vêm com o sistema, para não sumirem sem querer. */
  builtIn: boolean
}

export type AttachmentKind = 'foto-produto' | 'foto-etiqueta' | 'documento'

export interface Attachment {
  id: string
  kind: AttachmentKind
  fileName: string
  /** Para o visualizador saber se mostra a imagem ou só oferece o download. */
  mimeType: string
  /** Em bytes, para avisar o tamanho antes de alguém baixar no 4G da loja. */
  size: number
}

/**
 * Uma ocorrência de perda.
 *
 * Identidade: produto + validade + motivo. A validade é o que distingue de
 * verdade — dois lotes do mesmo produto com datas diferentes são coisas
 * diferentes. A origem é atributo, não parte da identidade.
 */
export interface LossRecord {
  id: string
  /** Vazio enquanto o produto não existe no cadastro. */
  productId: string
  /** Copiados no momento do registro: o produto pendente ainda não tem cadastro. */
  sku: string
  description: string
  barcode: string
  /** True enquanto o administrador não completar o cadastro. */
  pendingProduct: boolean
  expiryDate: IsoDate | null
  quantity: number
  reasonId: string
  /** Vazio quando o usuário não informou. */
  originId: string
  note: string
  attachments: Attachment[]
  createdAt: string
  createdBy: string
}

/** O que o formulário coleta; o resto é responsabilidade do sistema. */
export interface LossRecordDraft {
  productId: string
  sku: string
  description: string
  barcode: string
  pendingProduct: boolean
  expiryDate: IsoDate | null
  quantity: number
  reasonId: string
  originId: string
  note: string
  attachments: Attachment[]
}

export interface LossRecordQuery {
  search: string
  /** 'no-estoque' esconde os que zeraram; 'zerados' mostra só eles. */
  stockState: 'todos' | 'no-estoque' | 'zerados'
}
