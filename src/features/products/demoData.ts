/**
 * Base de demonstração.
 *
 * PROVISÓRIO: existe só enquanto não há back-end. Gera um volume parecido com
 * o real (~26 mil produtos) para a interface ser construída contra o problema
 * verdadeiro, não contra uma lista de dez itens. Sai junto com o mock do
 * `api.ts` quando o servidor existir.
 */
import type { Product } from './types'

const LINHAS = [
  'ESB BASE A SOLVENTE',
  'ESB BASE B SOLVENTE',
  'ESB BASE C SOLVENTE',
  'ACR FOSCO CONCRETO',
  'ACR ACETINADO PREMIUM',
  'DUCO BRANCO ACABAMENTO',
  'VERNIZ BI 2:1 C700',
  'RETARDADOR DUCO (NC)',
  'COLORANTE YE2 AMARELO',
  'COLORANTE RD3 VERMELHO',
  'END P/EPOXI COLORSTEEL',
  'PRIMER PU 8:1 BT810',
  'MASSA POLIESTER FINALIZAR',
  'THINNER SUPER ATIVO',
  'SOLVENTE ACRÍLICO ESPECIAL',
  'CITRUS LIMPANTE',
  'BROXA RETANGULAR COPEL',
  'ROLO LÃ SINTÉTICA',
  'FITA CREPE AUTOMOTIVA',
  "LIXA D'ÁGUA GRÃO 400",
]

const VOLUMES = ['0,9L', '3,6L', '18L', '800ML', '5L', '210GR/300ML', '1/32', '2351']
const SUFIXOS = ['BELA', 'REFINISH', 'VEX', 'CORAL', 'PREMIUM', 'ECONÔMICO', 'BT']

/** Gerador determinístico: a mesma base em toda recarga facilita comparar telas. */
function pseudoRandom(seed: number) {
  let state = seed

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

/** Dígito verificador de EAN-13, para os códigos parecerem reais. */
function ean13(base12: string): string {
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(base12[i]) * (i % 2 === 0 ? 1 : 3)
  return base12 + ((10 - (sum % 10)) % 10)
}

export function generateProducts(count: number): Product[] {
  const random = pseudoRandom(20260828)
  const products: Product[] = []
  const timestamp = new Date('2026-01-15T09:00:00Z').toISOString()

  for (let i = 0; i < count; i++) {
    const linha = LINHAS[Math.floor(random() * LINHAS.length)]
    const volume = VOLUMES[Math.floor(random() * VOLUMES.length)]
    const sufixo = SUFIXOS[Math.floor(random() * SUFIXOS.length)]
    const sku = String(10000 + i)

    // Cerca de 1 em 8 produtos sem código de barras, como no cadastro real.
    const temBarras = random() > 0.12
    const barcode = temBarras
      ? ean13(String(789000000000 + Math.floor(random() * 999999999)).slice(0, 12))
      : ''

    products.push({
      id: `p${sku}`,
      sku,
      description: `${linha} ${volume} ${sufixo}`,
      barcode,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }

  return products
}
