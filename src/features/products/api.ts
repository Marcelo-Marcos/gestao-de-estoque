/**
 * Camada de acesso a dados do cadastro de produtos.
 *
 * PROVISÓRIO: resolve tudo em memória, com volume parecido com o real (~26 mil
 * produtos) para que a interface seja construída contra o problema verdadeiro,
 * não contra uma lista de dez itens. Quando o back-end existir, só este arquivo
 * muda.
 */
import type { Product, ProductDraft, ProductQuery } from './types'

const LATENCY_MS = 180

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ---- Geração da base de demonstração ------------------------------------ */

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

function generateProducts(count: number): Product[] {
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

let store: Product[] = generateProducts(26680)

/* ---- Consultas ----------------------------------------------------------- */

function matches(product: Product, query: ProductQuery): boolean {
  if (query.onlyWithoutBarcode && product.barcode) return false
  if (!query.search) return true

  const term = query.search.trim().toLowerCase()
  if (!term) return true

  return (
    product.sku.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.barcode.includes(term)
  )
}

export interface ProductPage {
  items: Product[]
  /** Total que atende ao filtro, não o total da base. */
  total: number
}

export async function listProducts(query: ProductQuery): Promise<ProductPage> {
  await delay(LATENCY_MS)
  const items = store.filter((p) => matches(p, query))
  return { items, total: items.length }
}

export async function countProducts(): Promise<number> {
  await delay(30)
  return store.length
}

export async function getAllProducts(): Promise<Product[]> {
  await delay(30)
  return store
}

/* ---- Escrita -------------------------------------------------------------- */

export type SaveError = 'sku_duplicado' | 'barras_duplicado'

export type SaveResult =
  | { data: Product; error: null }
  | { data: null; error: SaveError }

function conflict(draft: ProductDraft, ignoreId?: string): SaveError | null {
  for (const product of store) {
    if (product.id === ignoreId) continue
    if (product.sku === draft.sku) return 'sku_duplicado'
    if (draft.barcode && product.barcode === draft.barcode) return 'barras_duplicado'
  }
  return null
}

export async function createProduct(draft: ProductDraft): Promise<SaveResult> {
  await delay(LATENCY_MS)

  const error = conflict(draft)
  if (error) return { data: null, error }

  const now = new Date().toISOString()
  const product: Product = { id: `p${draft.sku}-${now}`, ...draft, createdAt: now, updatedAt: now }
  store = [product, ...store]
  return { data: product, error: null }
}

export async function updateProduct(id: string, draft: ProductDraft): Promise<SaveResult> {
  await delay(LATENCY_MS)

  const error = conflict(draft, id)
  if (error) return { data: null, error }

  const index = store.findIndex((p) => p.id === id)
  if (index === -1) return { data: null, error: 'sku_duplicado' }

  const updated: Product = { ...store[index], ...draft, updatedAt: new Date().toISOString() }
  store = [...store.slice(0, index), updated, ...store.slice(index + 1)]
  return { data: updated, error: null }
}

export async function deleteProduct(id: string): Promise<void> {
  await delay(LATENCY_MS)
  store = store.filter((p) => p.id !== id)
}

/**
 * Grava os produtos novos da importação, informando o progresso.
 *
 * Processa em lotes e devolve o controle ao navegador entre eles: sem isso,
 * inserir milhares de linhas trava a interface e a barra de progresso não
 * chega a ser desenhada.
 */
export async function bulkCreate(
  drafts: ProductDraft[],
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  const BATCH = 500
  const now = new Date().toISOString()
  const created: Product[] = []

  for (let i = 0; i < drafts.length; i += BATCH) {
    for (const draft of drafts.slice(i, i + BATCH)) {
      created.push({
        id: `p${draft.sku}-${now}-${created.length}`,
        ...draft,
        createdAt: now,
        updatedAt: now,
      })
    }

    onProgress?.(Math.min(i + BATCH, drafts.length), drafts.length)
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  store = [...created, ...store]
  return created.length
}
