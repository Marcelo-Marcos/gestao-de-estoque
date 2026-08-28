/**
 * Leitor de CSV/TSV tolerante ao que sai de ERP brasileiro: separador por
 * ponto e vírgula, codificação Latin-1 e campos com aspas.
 */
import { SpreadsheetError, type CellValue, type SheetData } from './types'
import { toSheetData } from './xlsx'

/**
 * Exportação de ERP no Brasil costuma vir em Windows-1252, não UTF-8. Ler o
 * arquivo errado transforma "SOLVENTE ACRÍLICO" em "ACRÍLICO"; decodificar em
 * UTF-8 estrito falha nesse caso e nos deixa cair para o encoding certo.
 */
export function decodeText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)

  // BOM de UTF-8: o arquivo declara a própria codificação.
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3))
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}

/** Escolhe o separador pela contagem fora de aspas na primeira linha real. */
export function detectDelimiter(text: string): string {
  const firstLine = text.slice(0, 5000).split(/\r?\n/).find((l) => l.trim()) ?? ''

  let best = ','
  let bestCount = 0

  for (const candidate of [';', ',', '\t', '|']) {
    let count = 0
    let inQuotes = false

    for (let i = 0; i < firstLine.length; i++) {
      const char = firstLine[i]
      if (char === '"') inQuotes = !inQuotes
      else if (char === candidate && !inQuotes) count++
    }

    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }

  return best
}

/** Converte texto para número só quando o campo inteiro é numérico. */
function coerce(field: string): CellValue {
  const trimmed = field.trim()
  if (trimmed === '') return null

  // Zeros à esquerda são significativos em código de barras e SKU: manter texto.
  if (/^0\d/.test(trimmed)) return trimmed
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return trimmed

  const num = Number(trimmed)
  return Number.isFinite(num) ? num : trimmed
}

export function readCsv(buffer: ArrayBuffer): SheetData {
  const text = decodeText(buffer)
  if (!text.trim()) throw new SpreadsheetError('O arquivo está vazio.')

  const delimiter = detectDelimiter(text)

  const matrix: CellValue[][] = []
  let row: CellValue[] = []
  let field = ''
  let inQuotes = false
  let width = 0

  const endField = () => {
    row.push(coerce(field))
    field = ''
  }

  const endRow = () => {
    endField()
    width = Math.max(width, row.length)
    matrix.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        // "" dentro de um campo entre aspas representa uma aspa literal.
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') inQuotes = true
    else if (char === delimiter) endField()
    else if (char === '\n') endRow()
    else if (char === '\r') continue
    else field += char
  }

  // Última linha sem quebra ao final.
  if (field !== '' || row.length > 0) endRow()

  return { ...toSheetData(matrix, width), sheetName: 'CSV' }
}
