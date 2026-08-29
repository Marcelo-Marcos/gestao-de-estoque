/**
 * Reconhecimento de datas em .xlsx.
 *
 * O Excel não guarda data: guarda um número de dias desde uma data de origem,
 * e marca a célula com um *formato* que manda exibir aquele número como data.
 * Sem olhar o formato, "29/03/2026" chega como 46110 — e uma coluna de
 * validade viraria uma coluna de números sem sentido.
 *
 * Por isso é preciso ler xl/styles.xml, descobrir quais estilos são de data e
 * cruzar com o atributo `s` de cada célula.
 */

/**
 * Formatos de data embutidos no Excel, que não aparecem em styles.xml por já
 * serem conhecidos pelo programa. 14-22 são data e hora; 45-47 são duração;
 * 27-36 e 50-58 são as variantes de calendários asiáticos.
 */
const BUILTIN_DATE_FORMAT_IDS = new Set<number>([
  ...[14, 15, 16, 17, 18, 19, 20, 21, 22],
  ...[45, 46, 47],
  ...Array.from({ length: 10 }, (_, i) => 27 + i),
  ...Array.from({ length: 9 }, (_, i) => 50 + i),
])

/**
 * Decide se um código de formato personalizado descreve uma data.
 *
 * Antes de procurar as letras de data, remove o que não é instrução de
 * formato: texto entre aspas, caracteres escapados com barra e blocos entre
 * colchetes (cor, condição, código de idioma). Sem isso, `[$-416]#.##0` seria
 * lido como data por causa do "4" e do "1"... e pior, `"dia"0` viraria data
 * por causa do "d" dentro da palavra.
 */
export function isDateFormatCode(code: string): boolean {
  const limpo = code
    .replace(/\\./g, '')
    .replace(/"[^"]*"/g, '')
    .replace(/\[[^\]]*\]/g, '')

  return /[ymdhs]/i.test(limpo)
}

/**
 * Monta o conjunto de índices de estilo que representam data.
 *
 * O caminho é indireto de propósito, porque assim é o formato do arquivo:
 * a célula aponta para um estilo (`s="3"`), o estilo aponta para um formato
 * numérico (`numFmtId="164"`), e o formato diz se aquilo é data.
 */
export function buildDateStyleIndex(stylesXml: Document | null): Set<number> {
  const dateStyles = new Set<number>()
  if (!stylesXml) return dateStyles

  // Formatos personalizados declarados no próprio arquivo.
  const customDateFormats = new Set<number>()
  for (const numFmt of Array.from(stylesXml.getElementsByTagName('numFmt'))) {
    const id = Number(numFmt.getAttribute('numFmtId'))
    const code = numFmt.getAttribute('formatCode') ?? ''
    if (Number.isFinite(id) && isDateFormatCode(code)) customDateFormats.add(id)
  }

  // cellXfs é a lista de estilos que as células referenciam pelo índice.
  const cellXfs = stylesXml.getElementsByTagName('cellXfs')[0]
  if (!cellXfs) return dateStyles

  Array.from(cellXfs.getElementsByTagName('xf')).forEach((xf, index) => {
    const numFmtId = Number(xf.getAttribute('numFmtId') ?? 0)
    if (BUILTIN_DATE_FORMAT_IDS.has(numFmtId) || customDateFormats.has(numFmtId)) {
      dateStyles.add(index)
    }
  })

  return dateStyles
}

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0')
}

/**
 * Converte o número de série do Excel em uma data ISO (`2026-03-29`).
 *
 * A origem depende do sistema do arquivo. No padrão (1900), a origem efetiva é
 * 30/12/1899 por causa de um erro histórico: o Excel considera 1900 bissexto e
 * aceita um 29/02/1900 que nunca existiu, herdado do Lotus 1-2-3 por
 * compatibilidade. Descontar esse dia extra só vale a partir do dia 61 — antes
 * dele a origem correta é 31/12/1899.
 *
 * Datas de validade ficam na casa dos 45 mil, bem longe dessa borda, mas
 * tratá-la evita um erro de um dia em qualquer planilha antiga.
 */
export function serialToIso(serial: number, date1904 = false): string | null {
  if (!Number.isFinite(serial) || serial < 0) return null

  // O dia 60 é o 29/02/1900 inexistente: não há data correta para devolver.
  if (!date1904 && Math.floor(serial) === 60) return null

  const origemUtc = date1904
    ? Date.UTC(1904, 0, 1)
    : serial < 60
      ? Date.UTC(1899, 11, 31)
      : Date.UTC(1899, 11, 30)

  const dias = Math.floor(serial)
  const fracao = serial - dias

  const data = new Date(origemUtc + dias * 86_400_000)
  if (Number.isNaN(data.getTime())) return null

  const iso = `${data.getUTCFullYear()}-${pad(data.getUTCMonth() + 1)}-${pad(data.getUTCDate())}`

  // Sem parte fracionária é data pura — o caso de validade. Com fração há
  // hora, e descartá-la silenciosamente perderia informação.
  if (fracao === 0) return iso

  const segundosTotais = Math.round(fracao * 86_400)
  const h = Math.floor(segundosTotais / 3600)
  const m = Math.floor((segundosTotais % 3600) / 60)
  const s = segundosTotais % 60

  return `${iso}T${pad(h)}:${pad(m)}:${pad(s)}`
}
