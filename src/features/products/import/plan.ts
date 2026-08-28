/**
 * Transforma as linhas da planilha em um plano de importação, antes de gravar
 * qualquer coisa.
 *
 * A regra pedida: importar só o que ainda não tem registro, ignorando o que já
 * existe. Isso exige separar as linhas em categorias e mostrá-las ao usuário
 * *antes* de aplicar — com milhares de linhas, descobrir o resultado depois é
 * tarde demais.
 */
import { cellToText, digitsOnly } from '@/shared/lib/cell'
import type { CellValue } from '@/shared/lib/spreadsheet'
import type { Product, ProductDraft } from '../types'
import type { ColumnMapping } from './columns'

export type RowStatus = 'novo' | 'existente' | 'duplicado' | 'invalido'

export interface PlannedRow {
  /** Número da linha na planilha, contando o cabeçalho — o que o usuário vê no Excel. */
  lineNumber: number
  status: RowStatus
  draft: ProductDraft
  /** Preenchido quando o status exige explicação. */
  reason?: string
}

export interface ImportPlan {
  rows: PlannedRow[]
  counts: Record<RowStatus, number>
  total: number
}

const EMPTY_COUNTS: Record<RowStatus, number> = {
  novo: 0,
  existente: 0,
  duplicado: 0,
  invalido: 0,
}

export function buildImportPlan(
  rows: CellValue[][],
  mapping: ColumnMapping,
  existing: Product[],
): ImportPlan {
  // Índices por SKU e por código de barras: com milhares de linhas, comparar
  // cada linha contra a lista inteira seria trabalho quadrático.
  const bySku = new Set(existing.map((p) => p.sku))
  const byBarcode = new Set(existing.filter((p) => p.barcode).map((p) => p.barcode))

  // A planilha pode repetir o mesmo produto: a segunda ocorrência também é
  // duplicada, mesmo que a primeira seja nova.
  const seenSku = new Set<string>()
  const seenBarcode = new Set<string>()

  const planned: PlannedRow[] = []
  const counts = { ...EMPTY_COUNTS }

  const read = (row: CellValue[], column: number) =>
    column >= 0 ? cellToText(row[column]) : ''

  rows.forEach((row, index) => {
    const lineNumber = index + 2 // +1 pelo cabeçalho, +1 porque o Excel conta de 1
    const sku = digitsOnly(read(row, mapping.sku)) || read(row, mapping.sku)
    const description = read(row, mapping.description)
    const barcode = digitsOnly(read(row, mapping.barcode))

    const draft: ProductDraft = { sku, description, barcode }

    let status: RowStatus
    let reason: string | undefined

    if (!sku) {
      status = 'invalido'
      reason = 'Sem código SKU'
    } else if (!description) {
      status = 'invalido'
      reason = 'Sem descrição'
    } else if (seenSku.has(sku)) {
      status = 'duplicado'
      reason = 'SKU repetido na própria planilha'
    } else if (barcode && seenBarcode.has(barcode)) {
      status = 'duplicado'
      reason = 'Código de barras repetido na própria planilha'
    } else if (bySku.has(sku)) {
      status = 'existente'
      reason = 'Já cadastrado'
    } else if (barcode && byBarcode.has(barcode)) {
      status = 'existente'
      reason = 'Código de barras já cadastrado em outro produto'
    } else {
      status = 'novo'
      seenSku.add(sku)
      if (barcode) seenBarcode.add(barcode)
    }

    counts[status]++
    planned.push({ lineNumber, status, draft, reason })
  })

  return { rows: planned, counts, total: planned.length }
}

export function draftsToImport(plan: ImportPlan): ProductDraft[] {
  return plan.rows.filter((r) => r.status === 'novo').map((r) => r.draft)
}
