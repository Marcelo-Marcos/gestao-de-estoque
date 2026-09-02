export interface Product {
  id: string
  /** CÓDIGO no ERP. Identifica o produto e é a chave de comparação na importação. */
  sku: string
  /** desc_produtos. */
  description: string
  /** cod_barras (EAN/GTIN). Opcional: nem todo produto tem. */
  barcode: string
  /**
   * Saldo atual na loja. Vem da importação do relatório de estoque ou é
   * digitado. É o mesmo número que a tela de quebra usa para saber se o item
   * ainda está no estoque — não existe saldo paralelo (ver docs/dominio.md).
   */
  stock: number
  /** Quantidade vendida dentro do período configurado. Do segundo relatório. */
  outflow: number
  createdAt: string
  updatedAt: string
}

/** Campos que o usuário edita; o resto é responsabilidade do sistema. */
export type ProductDraft = Pick<Product, 'sku' | 'description' | 'barcode'>

export interface ProductQuery {
  search: string
  /** Restringe a produtos sem código de barras — útil para completar o cadastro. */
  onlyWithoutBarcode: boolean
}
