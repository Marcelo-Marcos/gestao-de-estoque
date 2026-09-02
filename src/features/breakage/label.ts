import type { LossRecord } from './types'

/**
 * Como o registro se chama na tela.
 *
 * Produto pendente entra sem descrição e sem SKU — só com o código de barras
 * lido. Sem esta escada, o desfazer chegava a dizer "Registro de excluído",
 * uma frase truncada que não identifica nada.
 */
export function recordLabel(record: LossRecord): string {
  return record.description.trim() || record.sku || record.barcode || 'produto sem identificação'
}
