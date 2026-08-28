/** Valor bruto de uma célula, antes de qualquer interpretação de domínio. */
export type CellValue = string | number | boolean | null

export interface SheetData {
  /** Nomes das colunas, na ordem, vindos da primeira linha preenchida. */
  headers: string[]
  /** Uma entrada por linha de dados; cada linha tem o mesmo tamanho de `headers`. */
  rows: CellValue[][]
  /** Nome da aba lida. */
  sheetName: string
}

export class SpreadsheetError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpreadsheetError'
  }
}
