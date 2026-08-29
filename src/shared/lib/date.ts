/**
 * Datas do domínio: uma validade é um **dia do calendário**, não um instante.
 *
 * O sistema guarda e compara datas como texto `AAAA-MM-DD`, sem hora e sem
 * fuso. Isso não é preguiça — é o que evita a classe de bug mais comum aqui:
 * `new Date('2026-03-29')` é interpretado como meia-noite em UTC, e no Brasil
 * (UTC-3) o `getDate()` local devolve 28. Um produto pareceria vencer um dia
 * antes do que vence.
 *
 * Por isso nada aqui converte para `Date` sem controlar o fuso explicitamente.
 */

/** `AAAA-MM-DD`, o formato usado para guardar e comparar. */
export type IsoDate = string

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/
const BR_RE = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Confere se a combinação existe no calendário — 31/02 não é data. */
function montarIso(ano: number, mes: number, dia: number): IsoDate | null {
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null

  const data = new Date(Date.UTC(ano, mes - 1, dia))
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null
  }

  return `${ano}-${pad(mes)}-${pad(dia)}`
}

/**
 * Interpreta a data como ela aparece numa planilha ou num campo digitado.
 *
 * Aceita ISO (já normalizado pelo leitor de .xlsx) e o formato brasileiro
 * `29/3/2026`. Dia sempre vem antes do mês: uma planilha de ERP brasileiro
 * nunca traz `03/29/2026`, e adivinhar pela ordem transformaria 05/03 em cinco
 * de março ou três de maio conforme o dia — silenciosamente.
 */
export function parseDate(value: unknown): IsoDate | null {
  if (typeof value === 'number') return null
  if (typeof value !== 'string') return null

  const texto = value.trim()
  if (!texto) return null

  const iso = ISO_RE.exec(texto)
  if (iso) return montarIso(Number(iso[1]), Number(iso[2]), Number(iso[3]))

  const br = BR_RE.exec(texto)
  if (!br) return null

  const dia = Number(br[1])
  const mes = Number(br[2])
  let ano = Number(br[3])

  // Ano com dois dígitos: 26 é 2026, não 1926. Validade é sempre próxima.
  if (ano < 100) ano += 2000

  return montarIso(ano, mes, dia)
}

/** Como a data aparece na tela: `29/03/2026`. */
export function formatDate(iso: IsoDate | null | undefined): string {
  if (!iso) return ''

  const match = ISO_RE.exec(iso)
  if (!match) return ''

  return `${match[3]}/${match[2]}/${match[1]}`
}

/** O dia de hoje, no fuso de quem está usando o sistema. */
export function today(): IsoDate {
  const agora = new Date()
  return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`
}

/**
 * Quantos dias faltam até a data. Negativo quer dizer que já passou.
 *
 * Conta dias de calendário, não intervalos de 24 horas: um produto que vence
 * amanhã falta 1 dia, seja agora de manhã ou às 23h. Por isso ambas as datas
 * viram meio-dia UTC antes da subtração — assim nenhum horário de verão de
 * uma hora empurra o resultado para o dia vizinho.
 */
export function daysUntil(iso: IsoDate | null | undefined, base: IsoDate = today()): number | null {
  if (!iso) return null

  const alvo = ISO_RE.exec(iso)
  const origem = ISO_RE.exec(base)
  if (!alvo || !origem) return null

  const msAlvo = Date.UTC(Number(alvo[1]), Number(alvo[2]) - 1, Number(alvo[3]), 12)
  const msOrigem = Date.UTC(Number(origem[1]), Number(origem[2]) - 1, Number(origem[3]), 12)

  return Math.round((msAlvo - msOrigem) / 86_400_000)
}
