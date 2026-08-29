/**
 * Leitor de .xlsx restrito ao que precisamos: os valores das células da
 * primeira aba.
 *
 * Um .xlsx é um zip de XMLs. Descompactamos com fflate e lemos com o DOMParser
 * do próprio navegador — sem depender de uma biblioteca de planilha inteira
 * (que traria escrita, fórmulas, gráficos e dependências vulneráveis) para
 * fazer leitura de texto e número.
 *
 * Datas são reconhecidas pelo formato da célula e devolvidas como texto ISO
 * (`2026-03-29`); ver `dates.ts` para o porquê desse caminho indireto.
 */
import { unzipSync, strFromU8 } from 'fflate'
import { buildDateStyleIndex, serialToIso } from './dates'
import { SpreadsheetError, type CellValue, type SheetData } from './types'

const parser = new DOMParser()

function parseXml(bytes: Uint8Array, nome: string): Document {
  const doc = parser.parseFromString(strFromU8(bytes), 'application/xml')
  if (doc.querySelector('parsererror')) {
    throw new SpreadsheetError(`Não foi possível ler a estrutura do arquivo (${nome}).`)
  }
  return doc
}

/** "A" → 0, "Z" → 25, "AA" → 26. Ignora a parte numérica da referência. */
export function columnIndexFromRef(ref: string): number {
  let index = 0
  for (const char of ref) {
    const code = char.charCodeAt(0)
    if (code < 65 || code > 90) break
    index = index * 26 + (code - 64)
  }
  return index - 1
}

function readSharedStrings(files: Record<string, Uint8Array>): string[] {
  const entry = files['xl/sharedStrings.xml']
  if (!entry) return []

  const doc = parseXml(entry, 'sharedStrings.xml')
  return Array.from(doc.getElementsByTagName('si')).map((si) => {
    // Texto rico vem quebrado em vários <t>; concatenar reconstrói a string.
    const parts = si.getElementsByTagName('t')
    let text = ''
    for (let i = 0; i < parts.length; i++) text += parts[i].textContent ?? ''
    return text
  })
}

/** Descobre o caminho da primeira aba seguindo workbook.xml e seus rels. */
function findFirstSheet(files: Record<string, Uint8Array>): { path: string; name: string } {
  const workbook = files['xl/workbook.xml']
  if (!workbook) {
    throw new SpreadsheetError('Arquivo .xlsx inválido: falta a definição da planilha.')
  }

  const sheet = parseXml(workbook, 'workbook.xml').getElementsByTagName('sheet')[0]
  if (!sheet) throw new SpreadsheetError('A planilha não tem nenhuma aba.')

  const name = sheet.getAttribute('name') ?? 'Planilha1'
  const relId = sheet.getAttribute('r:id') ?? sheet.getAttribute('id')

  const rels = files['xl/_rels/workbook.xml.rels']
  if (relId && rels) {
    for (const rel of Array.from(parseXml(rels, 'workbook.xml.rels').getElementsByTagName('Relationship'))) {
      if (rel.getAttribute('Id') !== relId) continue

      const target = rel.getAttribute('Target') ?? ''
      const path = target.startsWith('/')
        ? target.slice(1)
        : `xl/${target.replace(/^\.\//, '')}`

      if (files[path]) return { path, name }
    }
  }

  // Sem rels utilizável, o caminho convencional resolve a maioria dos arquivos.
  const fallback = Object.keys(files).find((f) => /^xl\/worksheets\/sheet\d+\.xml$/.test(f))
  if (!fallback) throw new SpreadsheetError('Não foi possível localizar a aba na planilha.')
  return { path: fallback, name }
}

interface CellContext {
  sharedStrings: string[]
  /** Índices de estilo que o arquivo marca como data. */
  dateStyles: Set<number>
  /** Arquivos do Mac antigo contam os dias a partir de 1904. */
  date1904: boolean
}

function cellValue(cell: Element, ctx: CellContext): CellValue {
  const type = cell.getAttribute('t')

  if (type === 'inlineStr') {
    const parts = cell.getElementsByTagName('t')
    let text = ''
    for (let i = 0; i < parts.length; i++) text += parts[i].textContent ?? ''
    return text || null
  }

  const raw = cell.getElementsByTagName('v')[0]?.textContent
  if (raw == null || raw === '') return null

  switch (type) {
    case 's': {
      const index = Number(raw)
      return ctx.sharedStrings[index] ?? null
    }
    case 'b':
      return raw === '1'
    case 'e':
      // Célula em erro (#N/D, #VALOR!) vira vazio: não é dado aproveitável.
      return null
    case 'str':
      return raw
    default: {
      const num = Number(raw)
      if (Number.isNaN(num)) return raw

      // Número em célula formatada como data: converte, senão a validade
      // chegaria como 46110 em vez de 29/03/2026.
      const styleIndex = Number(cell.getAttribute('s') ?? -1)
      if (ctx.dateStyles.has(styleIndex)) {
        return serialToIso(num, ctx.date1904) ?? num
      }

      return num
    }
  }
}

export function readXlsx(buffer: ArrayBuffer): SheetData {
  let files: Record<string, Uint8Array>
  try {
    files = unzipSync(new Uint8Array(buffer))
  } catch {
    throw new SpreadsheetError(
      'O arquivo não parece ser uma planilha .xlsx válida. Se ele foi salvo como .xls antigo, reexporte como .xlsx ou .csv.',
    )
  }

  const sharedStrings = readSharedStrings(files)
  const { path, name } = findFirstSheet(files)
  const doc = parseXml(files[path], path)

  const styles = files['xl/styles.xml'] ? parseXml(files['xl/styles.xml'], 'styles.xml') : null
  const workbook = parseXml(files['xl/workbook.xml'], 'workbook.xml')

  const ctx: CellContext = {
    sharedStrings,
    dateStyles: buildDateStyleIndex(styles),
    date1904: workbook.getElementsByTagName('workbookPr')[0]?.getAttribute('date1904') === '1',
  }

  const matrix: CellValue[][] = []
  let width = 0

  for (const row of Array.from(doc.getElementsByTagName('row'))) {
    const values: CellValue[] = []

    for (const cell of Array.from(row.getElementsByTagName('c'))) {
      // Células vazias são omitidas do XML; a referência (ex.: "C7") diz a
      // posição real, então não dá para confiar na ordem de aparição.
      const ref = cell.getAttribute('r')
      const index = ref ? columnIndexFromRef(ref) : values.length
      if (index < 0) continue

      while (values.length < index) values.push(null)
      values[index] = cellValue(cell, ctx)
    }

    width = Math.max(width, values.length)
    matrix.push(values)
  }

  return { ...toSheetData(matrix, width), sheetName: name }
}

/**
 * Descarta linhas vazias no topo, usa a primeira linha preenchida como
 * cabeçalho e normaliza o comprimento de todas as linhas.
 */
export function toSheetData(matrix: CellValue[][], width: number): Omit<SheetData, 'sheetName'> {
  const isEmpty = (row: CellValue[] | undefined) =>
    !row || row.every((v) => v === null || v === '' || v === undefined)

  let start = 0
  while (start < matrix.length && isEmpty(matrix[start])) start++

  if (start >= matrix.length) {
    throw new SpreadsheetError('A planilha está vazia.')
  }

  const headerRow = matrix[start]
  const headers: string[] = []
  for (let i = 0; i < width; i++) {
    const value = headerRow[i]
    headers.push(value == null ? '' : String(value).trim())
  }

  const rows = matrix
    .slice(start + 1)
    .filter((row) => !isEmpty(row))
    .map((row) => {
      const normalized: CellValue[] = []
      for (let i = 0; i < width; i++) normalized.push(row[i] ?? null)
      return normalized
    })

  return { headers, rows }
}
