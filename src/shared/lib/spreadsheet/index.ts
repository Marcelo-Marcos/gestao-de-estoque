import { readCsv } from './csv'
import { readXlsx } from './xlsx'
import { SpreadsheetError, type SheetData } from './types'

export { SpreadsheetError }
export type { CellValue, SheetData } from './types'

export const ACCEPTED_EXTENSIONS = ['.xlsx', '.csv', '.txt', '.tsv'] as const

/** Lê a planilha pelo conteúdo, escolhendo o leitor pela extensão do arquivo. */
export async function readSpreadsheet(file: File): Promise<SheetData> {
  const name = file.name.toLowerCase()
  const buffer = await file.arrayBuffer()

  if (name.endsWith('.xlsx')) return readXlsx(buffer)
  if (name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.tsv')) {
    return readCsv(buffer)
  }

  if (name.endsWith('.xls')) {
    throw new SpreadsheetError(
      'O formato .xls (Excel antigo) não é aceito. Abra no Excel e salve como .xlsx ou .csv.',
    )
  }

  throw new SpreadsheetError(
    `Formato não reconhecido. Use ${ACCEPTED_EXTENSIONS.join(', ')}.`,
  )
}
