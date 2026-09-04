/**
 * Exportação do cadastro de produtos para .xlsx.
 *
 * Exporta **o que está na tela**, com os filtros aplicados — mesma regra da
 * quebra. Quem filtrou por "só sem código de barras" quer levar exatamente
 * essa lista para completar o cadastro, não a base inteira de novo.
 */
import { downloadFile, XLSX_MIME } from '@/shared/lib/download'
import { writeXlsx, type ExportValue } from '@/shared/lib/spreadsheet/writeXlsx'
import { today } from '@/shared/lib/date'
import type { Product } from './types'

const HEADER = ['Código de barras', 'SKU', 'Descrição', 'Estoque', 'Saídas no período']

function toRow(product: Product): ExportValue[] {
  return [
    // Como texto: em número, o Excel come o zero à esquerda do código de barras.
    product.barcode || null,
    product.sku,
    product.description,
    product.stock,
    product.outflow,
  ]
}

export function exportProducts(products: Product[]): void {
  const bytes = writeXlsx({
    name: 'Produtos',
    header: HEADER,
    rows: products.map(toRow),
  })

  downloadFile(bytes, `produtos-${today()}.xlsx`, XLSX_MIME)
}
