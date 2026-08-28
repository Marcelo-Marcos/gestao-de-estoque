/**
 * Reconhecimento das colunas da planilha.
 *
 * O cabeçalho varia entre exportações ("CÓDIGO", "cod_produto", "SKU"), então
 * casamos por palavras conhecidas em vez de posição fixa. Quando o cabeçalho
 * não basta, o conteúdo decide: uma coluna de 13 dígitos é código de barras,
 * mesmo chamada de "campo3".
 */
import { cellToText, digitsOnly } from '@/shared/lib/cell'
import type { CellValue } from '@/shared/lib/spreadsheet'

export type ProductField = 'sku' | 'description' | 'barcode'

export interface FieldSpec {
  field: ProductField
  label: string
  required: boolean
  hint: string
}

export const PRODUCT_FIELDS: FieldSpec[] = [
  {
    field: 'sku',
    label: 'Código SKU',
    required: true,
    hint: 'O código do produto no ERP. É por ele que o sistema sabe se o produto já existe.',
  },
  {
    field: 'description',
    label: 'Descrição do produto',
    required: true,
    hint: 'O nome que aparece nas listagens.',
  },
  {
    field: 'barcode',
    label: 'Código de barras',
    required: false,
    hint: 'EAN/GTIN. Usado pela leitura por câmera.',
  },
]

/** Índice da coluna da planilha para cada campo; -1 significa "não importar". */
export type ColumnMapping = Record<ProductField, number>

export const EMPTY_MAPPING: ColumnMapping = { sku: -1, description: -1, barcode: -1 }

/** Remove acento, pontuação e caixa para comparar cabeçalhos. */
export function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const HEADER_PATTERNS: Record<ProductField, string[]> = {
  // Ordem importa: o primeiro que casar vence, então os termos mais
  // específicos vêm antes dos genéricos.
  barcode: ['codbarras', 'codigodebarras', 'codigobarras', 'barcode', 'ean', 'gtin', 'codbar'],
  sku: ['codigosku', 'sku', 'codproduto', 'codigoproduto', 'codigo', 'codigo1', 'cod', 'id'],
  description: [
    'descprodutos',
    'descricaoproduto',
    'descricao',
    'descproduto',
    'produto',
    'nome',
    'desc',
  ],
}

function matchByHeader(headers: string[], field: ProductField, taken: Set<number>): number {
  const normalized = headers.map(normalizeHeader)

  // Casamento exato primeiro; só depois aceita cabeçalho que apenas contém o termo.
  for (const pass of ['exact', 'partial'] as const) {
    for (const pattern of HEADER_PATTERNS[field]) {
      for (let i = 0; i < normalized.length; i++) {
        if (taken.has(i) || !normalized[i]) continue

        const hit =
          pass === 'exact' ? normalized[i] === pattern : normalized[i].includes(pattern)

        if (hit) return i
      }
    }
  }

  return -1
}

/** Colunas de código de barras têm 8, 12, 13 ou 14 dígitos na maior parte das linhas. */
function looksLikeBarcode(rows: CellValue[][], column: number): boolean {
  const sample = rows.slice(0, 200)
  if (!sample.length) return false

  let hits = 0
  let filled = 0

  for (const row of sample) {
    const text = digitsOnly(cellToText(row[column]))
    if (!text) continue
    filled++
    if ([8, 12, 13, 14].includes(text.length)) hits++
  }

  return filled > 0 && hits / filled > 0.7
}

/** Descrição é a coluna com mais texto não numérico. */
function looksLikeDescription(rows: CellValue[][], column: number): boolean {
  const sample = rows.slice(0, 200)
  let textual = 0
  let filled = 0

  for (const row of sample) {
    const text = cellToText(row[column])
    if (!text) continue
    filled++
    if (/[a-zA-Z]/.test(text) && text.length >= 3) textual++
  }

  return filled > 0 && textual / filled > 0.7
}

/**
 * Monta o mapeamento inicial. O usuário sempre pode corrigir antes de importar
 * — a detecção é um palpite bem informado, não uma decisão final.
 */
export function detectMapping(headers: string[], rows: CellValue[][]): ColumnMapping {
  const mapping: ColumnMapping = { ...EMPTY_MAPPING }
  const taken = new Set<number>()

  // Código de barras primeiro: "CÓDIGO DE BARRAS" contém "codigo" e seria
  // capturado pelo SKU se este viesse antes.
  for (const field of ['barcode', 'sku', 'description'] as const) {
    const index = matchByHeader(headers, field, taken)
    if (index >= 0) {
      mapping[field] = index
      taken.add(index)
    }
  }

  // Cabeçalho não resolveu: deduz pelo conteúdo.
  if (mapping.barcode === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (taken.has(i) || !looksLikeBarcode(rows, i)) continue
      mapping.barcode = i
      taken.add(i)
      break
    }
  }

  if (mapping.description === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (taken.has(i) || !looksLikeDescription(rows, i)) continue
      mapping.description = i
      taken.add(i)
      break
    }
  }

  if (mapping.sku === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (taken.has(i)) continue
      mapping.sku = i
      taken.add(i)
      break
    }
  }

  return mapping
}
