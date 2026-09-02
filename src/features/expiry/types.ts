import type { IsoDate } from '@/shared/lib/date'
import type { Situation } from './situation'

/**
 * Um lote em acompanhamento: o produto mais a data de validade daquele lote.
 *
 * O mesmo produto pode aparecer mais de uma vez, com validades diferentes —
 * são coisas distintas, uma ainda se vende e a outra não.
 *
 * Saldo e saídas não moram aqui: são do produto (ver docs/dominio.md).
 */
export interface ExpiryItem {
  id: string
  productId: string
  expiryDate: IsoDate | null
  createdAt: string
}

/** Item com o produto resolvido e a situação já calculada, pronto para a tela. */
export interface ExpiryRow {
  id: string
  productId: string
  sku: string
  description: string
  barcode: string
  expiryDate: IsoDate | null
  stock: number
  outflow: number
  situation: Situation
  daysToExpiry: number | null
  daysToZero: number | null
}

export interface ExpiryQuery {
  search: string
  /** Vazio mostra todas as faixas. */
  situations: Situation[]
}
