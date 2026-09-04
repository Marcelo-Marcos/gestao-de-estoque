/**
 * Empacota o app num arquivo HTML único, para publicar como demonstração.
 *
 * A demonstração roda sem servidor: as rotas vão no fragmento (#/quebra) e o
 * CSS e o JS ficam embutidos, porque o visualizador só recebe uma página.
 *
 * Nada aqui altera o app — o desvio do download vive neste empacotamento
 * justamente para o código da aplicação não conhecer a plataforma onde a
 * demonstração é hospedada.
 *
 * Uso: npm run build:demo
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const SAIDA = process.argv[2] ?? 'dist-demo/gestao-validades.html'

execFileSync('npx', ['vite', 'build', '--base', './', '--outDir', 'dist-demo'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_HASH_ROUTER: 'true' },
})

const dir = 'dist-demo/assets'
const arquivos = readdirSync(dir)
const css = readFileSync(`${dir}/${arquivos.find((f) => f.endsWith('.css'))}`, 'utf8')
const js = readFileSync(`${dir}/${arquivos.find((f) => f.endsWith('.js'))}`, 'utf8')

/**
 * O visualizador da demonstração não deixa a página baixar arquivo sozinha: o
 * download precisa passar pela API dele, que pede confirmação ao usuário.
 *
 * O app entrega a planilha por um <a download>, como qualquer site. Aqui o
 * clique nesse link é desviado. Guardamos o Blob no momento em que a URL é
 * criada porque o app a revoga logo depois do clique — buscar o conteúdo pela
 * URL depois disso chegaria tarde.
 */
const DESVIO_DE_DOWNLOAD = `
;(() => {
  const blobs = new Map()
  const criarUrl = URL.createObjectURL.bind(URL)
  URL.createObjectURL = (objeto) => {
    const url = criarUrl(objeto)
    if (objeto instanceof Blob) blobs.set(url, objeto)
    return url
  }

  const clicar = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    const blob = this.download && blobs.get(this.href)
    if (!blob) return clicar.call(this)

    const filename = this.download
    Promise.resolve(window.claude?.use?.('downloads'))
      .then((downloads) => {
        if (!downloads) {
          window.alert('Nesta demonstração o download depende da confirmação do visualizador, que não está disponível aqui.')
          return
        }
        return downloads.save({ filename, data: blob })
      })
      // Recusar o download é uma resposta legítima do usuário, não um erro.
      .catch(() => {})
  }
})()
`

const html = `<title>Gestão de Validades</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${css}
</style>
<div id="root"></div>
<script>${DESVIO_DE_DOWNLOAD}</script>
<script type="module">
${js}
</script>
`

writeFileSync(SAIDA, html)
console.log(`\n${SAIDA} — ${(html.length / 1024).toFixed(0)} KB`)
