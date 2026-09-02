/**
 * A conta que sustenta a tela de validades.
 *
 * Duas perguntas, nesta ordem: em quantos dias o estoque zera pelo ritmo de
 * venda, e quantos dias faltam para vencer. Comparar as duas responde se o
 * produto vai ser vendido a tempo — que é a decisão que o usuário precisa
 * tomar todo dia.
 *
 * Tudo aqui é função pura: nada de data "agora" escondida, nada de estado.
 * A data de referência entra como argumento para o resultado ser reproduzível
 * e testável.
 */
import { daysUntil, type IsoDate } from '@/shared/lib/date'

export type Situation = 'venceu' | 'vence-antes' | 'vende-antes' | 'sem-estimativa'

export interface SituationInput {
  /** Data de validade do lote. Ausente quando ninguém cadastrou ainda. */
  expiryDate: IsoDate | null
  /** Saldo atual do produto. */
  stock: number
  /** Quantidade vendida dentro do período. */
  outflow: number
  /** Janela, em dias, que o relatório de saídas cobre. */
  periodDays: number
}

export interface SituationResult {
  situation: Situation
  /** Dias até vencer; negativo já passou. `null` sem data cadastrada. */
  daysToExpiry: number | null
  /** Dias até o estoque zerar no ritmo atual. `null` sem saídas no período. */
  daysToZero: number | null
}

/**
 * Em quantos dias o estoque zera.
 *
 * `estoque ÷ (saídas ÷ período)`, que é o mesmo que `estoque × período ÷
 * saídas`. Sem saídas não há divisão possível — devolver zero ou infinito
 * seria inventar um número que ninguém mediu, então devolvemos `null` e a
 * interface diz "sem estimativa".
 */
export function daysToZero(stock: number, outflow: number, periodDays: number): number | null {
  if (outflow <= 0 || periodDays <= 0) return null
  if (stock <= 0) return 0

  return Math.floor((stock * periodDays) / outflow)
}

/**
 * Classifica o item numa das quatro faixas.
 *
 * A ordem das perguntas importa: vencido é vencido mesmo que gire rápido, e
 * sem data não há o que comparar por mais bem que o produto venda.
 */
export function classify(input: SituationInput, today?: IsoDate): SituationResult {
  const toExpiry = daysUntil(input.expiryDate, today)
  const toZero = daysToZero(input.stock, input.outflow, input.periodDays)

  const result = { daysToExpiry: toExpiry, daysToZero: toZero }

  // Já passou da data: nenhuma previsão muda esse fato.
  if (toExpiry !== null && toExpiry < 0) {
    return { ...result, situation: 'venceu' }
  }

  // Sem data ou sem saídas, não há duas grandezas para comparar.
  if (toExpiry === null || toZero === null) {
    return { ...result, situation: 'sem-estimativa' }
  }

  // Zera depois de vencer = sobra produto na prateleira no dia do vencimento.
  return { ...result, situation: toZero > toExpiry ? 'vence-antes' : 'vende-antes' }
}

interface SituationMeta {
  label: string
  /** Texto curto que explica o que a faixa quer dizer. */
  hint: string
  /** Token de cor. Ver CLAUDE.md, "Semântica de cor de validade". */
  token: 'expired' | 'warning' | 'ok' | 'unknown'
}

export const SITUATIONS: Record<Situation, SituationMeta> = {
  venceu: { label: 'Venceu', hint: 'a data já passou', token: 'expired' },
  'vence-antes': {
    label: 'Vence antes de vender',
    hint: 'zera depois da validade',
    token: 'warning',
  },
  'vende-antes': {
    label: 'Vende antes de vencer',
    hint: 'gira dentro do prazo',
    token: 'ok',
  },
  'sem-estimativa': {
    label: 'Sem estimativa',
    hint: 'sem saídas no período ou sem data',
    token: 'unknown',
  },
}

/** Ordem de exibição: da pior situação para a melhor. */
export const SITUATION_ORDER: Situation[] = [
  'venceu',
  'vence-antes',
  'vende-antes',
  'sem-estimativa',
]
