/**
 * Escritor de .xlsx restrito ao que precisamos: uma aba, uma linha de
 * cabeçalho e valores de texto, número ou data.
 *
 * Mesmo raciocínio do leitor em `xlsx.ts` — um .xlsx é um zip de XMLs, e
 * montá-lo com fflate custa menos que trazer uma biblioteca de planilha
 * inteira, com fórmulas e gráficos que nunca usaríamos.
 *
 * Os textos vão como `inlineStr` em vez de irem para a tabela de strings
 * compartilhadas: dobra alguns bytes no arquivo e elimina um XML inteiro com
 * índices para manter em sincronia.
 */
import { strToU8, zipSync } from 'fflate'
import type { IsoDate } from '../date'

export type ExportValue = string | number | { date: IsoDate } | null

export interface SheetToWrite {
  /** Nome da aba, como aparece na guia do Excel. */
  name: string
  header: string[]
  rows: ExportValue[][]
}

/** 0 → "A", 25 → "Z", 26 → "AA". */
function columnLetter(index: number): string {
  let letters = ''
  let n = index
  while (n >= 0) {
    letters = String.fromCharCode(65 + (n % 26)) + letters
    n = Math.floor(n / 26) - 1
  }
  return letters
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * XML rejeita caracteres de controle. Eles não deveriam existir nos dados, mas
 * um só, vindo de uma importação mal formada, corromperia a planilha inteira —
 * e o usuário só descobriria ao tentar abrir o arquivo.
 */
function sanitize(value: string): string {
  // A regra existe para pegar caractere de controle escrito sem querer; aqui
  // ele é o alvo declarado da função.
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
}

/**
 * Data em número de série do Excel: dias desde 1899-12-30.
 *
 * A base é 30 e não 31 de dezembro por causa do bug do ano bissexto de 1900,
 * que o Excel mantém por compatibilidade — o mesmo detalhe tratado na leitura,
 * em `dates.ts`.
 */
function dateToSerial(iso: IsoDate): number | null {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return null

  const base = Date.UTC(1899, 11, 30)
  const value = Date.UTC(year, month - 1, day)
  return Math.round((value - base) / 86_400_000)
}

/**
 * O estilo vai em cada célula, não na linha: `<row s="...">` só vale com
 * `customFormat="1"` e ainda assim o Excel ignora para células que já existem.
 * Célula a célula funciona nos dois.
 */
function cellXml(value: ExportValue, ref: string, style?: number): string {
  if (value === null || value === '') return ''

  const s = style === undefined ? '' : ` s="${style}"`

  if (typeof value === 'number') {
    return Number.isFinite(value) ? `<c r="${ref}"${s}><v>${value}</v></c>` : ''
  }

  if (typeof value === 'object') {
    const serial = dateToSerial(value.date)
    // O estilo 1 é o formato de data declarado em STYLES.
    return serial === null ? '' : `<c r="${ref}" s="1"><v>${serial}</v></c>`
  }

  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escapeXml(sanitize(value))}</t></is></c>`
}

function rowXml(values: ExportValue[], rowNumber: number, style?: number): string {
  const cells = values
    .map((value, column) => cellXml(value, `${columnLetter(column)}${rowNumber}`, style))
    .join('')
  return `<row r="${rowNumber}">${cells}</row>`
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const WORKBOOK_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

/**
 * Três estilos apenas: o padrão, um com formato de data brasileiro e um em
 * negrito para o cabeçalho. Sem o de data, toda validade chegaria ao usuário
 * como o número de série cru.
 */
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="3">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

function workbookXml(sheetName: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
}

function sheetXml(sheet: SheetToWrite): string {
  // Estilo 2: negrito, para o cabeçalho não se confundir com dado.
  const header = rowXml(sheet.header, 1, 2)
  const body = sheet.rows.map((row, index) => rowXml(row, index + 2)).join('')

  // Larguras generosas: descrição de produto é longa, e coluna estreita entrega
  // "#####" no lugar do dado.
  const cols = sheet.header
    .map((title, index) => {
      const width = Math.min(Math.max(title.length + 4, 14), 48)
      return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<cols>${cols}</cols>
<sheetData>${header}${body}</sheetData>
</worksheet>`
}

/** Monta o arquivo e devolve os bytes prontos para virar Blob e download. */
export function writeXlsx(sheet: SheetToWrite): Uint8Array {
  // O Excel recusa nome de aba com estes caracteres ou acima de 31 letras.
  const name = (sheet.name.replace(/[\\/*?:[\]]/g, ' ').trim() || 'Planilha').slice(0, 31)

  return zipSync({
    '[Content_Types].xml': strToU8(CONTENT_TYPES),
    '_rels/.rels': strToU8(ROOT_RELS),
    'xl/workbook.xml': strToU8(workbookXml(name)),
    'xl/_rels/workbook.xml.rels': strToU8(WORKBOOK_RELS),
    'xl/styles.xml': strToU8(STYLES),
    'xl/worksheets/sheet1.xml': strToU8(sheetXml({ ...sheet, name })),
  })
}
