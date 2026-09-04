/**
 * Entrega um arquivo gerado no navegador ao usuário.
 *
 * O link é criado, clicado e descartado no mesmo instante: não existe API de
 * "salvar arquivo" que funcione em todo navegador, e um <a download> visível na
 * tela só para isso seria um elemento sem função depois do primeiro clique.
 */
export function downloadFile(bytes: Uint8Array, fileName: string, mimeType: string): void {
  // A cópia evita depender de o Uint8Array vir de um ArrayBuffer comum: em
  // memória compartilhada (SharedArrayBuffer) o Blob recusaria os bytes.
  downloadBlob(new Blob([new Uint8Array(bytes)], { type: mimeType }), fileName)
}

/** Mesma entrega, para quem já tem o arquivo pronto — um anexo, por exemplo. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()

  // Sem revogar, o blob fica na memória da aba até ela ser fechada.
  URL.revokeObjectURL(url)
}

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
