/**
 * Build para o GitHub Pages.
 *
 * Acrescenta ao build normal duas coisas que só aquele servidor pede:
 *
 * 1. `404.html`, cópia do `index.html`. O Pages não sabe que somos uma
 *    aplicação de página única: pedir /validades direto na barra de endereços,
 *    ou recarregar ali, procuraria um arquivo que não existe. Ele então serve
 *    o 404 — que sendo o mesmo HTML, carrega o app, e o roteador resolve o
 *    endereço no navegador.
 *
 * 2. `.nojekyll`, senão o Pages processa a pasta com o Jekyll e descarta os
 *    arquivos começados por underscore.
 *
 * Uso: npm run build:pages
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, writeFileSync } from 'node:fs'

execFileSync('npm', ['run', 'build'], { stdio: 'inherit' })

copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')

console.log('\ndist/ pronto para o GitHub Pages (404.html e .nojekyll incluídos)')
