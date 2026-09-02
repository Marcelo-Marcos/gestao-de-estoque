/**
 * Período do relatório de saídas, em dias.
 *
 * É a janela que o arquivo importado cobre, e entra direto na previsão de
 * quantos dias o estoque leva para zerar. Errar esse número desloca todas as
 * situações de uma vez, então ele é do usuário — quem exporta o relatório é
 * quem sabe o intervalo.
 */
import { readJson, storageKey, writeJson } from '@/shared/lib/storage'

const PERIOD_KEY = storageKey('periodo')

/** Um ano comercial, que é o intervalo mais comum desses relatórios. */
export const DEFAULT_PERIOD_DAYS = 390

export function readPeriodDays(): number {
  const stored = readJson<unknown>(PERIOD_KEY, null)
  // Um valor fora de faixa quebraria a divisão da previsão em silêncio.
  if (typeof stored !== 'number' || !Number.isFinite(stored) || stored < 1) {
    return DEFAULT_PERIOD_DAYS
  }
  return Math.floor(stored)
}

export function writePeriodDays(days: number): void {
  writeJson(PERIOD_KEY, Math.max(1, Math.floor(days)))
}
