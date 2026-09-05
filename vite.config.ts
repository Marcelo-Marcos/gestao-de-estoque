import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/**
 * O caminho onde o app é servido.
 *
 * Na raiz de um domínio próprio é "/". No GitHub Pages o site mora numa
 * subpasta com o nome do repositório, e sem isto todo arquivo seria buscado na
 * raiz do domínio — a página abriria em branco.
 */
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
