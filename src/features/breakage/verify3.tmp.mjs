import { chromium } from 'playwright'

const shots = process.argv[2]
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

for (const tema of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } })
  const page = await ctx.newPage()
  const erros = []
  page.on('pageerror', (e) => erros.push(String(e)))

  await page.goto('http://localhost:5173/entrar')
  await page.getByLabel(/e-mail/i).fill('operador@exemplo.com.br')
  await page.getByRole('textbox', { name: 'Senha' }).fill('senha123')
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL('**/validades')

  if (tema === 'light') {
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await page.getByRole('button', { name: 'Usar tema claro' }).click()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
  }

  await page.goto('http://localhost:5173/quebra')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /^Registrar/ }).first().click()
  await page.waitForTimeout(300)
  await page.getByRole('searchbox', { name: 'Buscar produto' }).fill('tinta')
  await page.waitForTimeout(600)
  await page.getByRole('button').filter({ hasText: /SKU / }).first().click()
  await page.waitForTimeout(200)
  await page.locator('#loss-expiry').fill('2026-09-20')
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${shots}/${tema}-dialog-topo.png` })

  // Overflow horizontal dentro do diálogo, não só do documento.
  const overflow = await page.evaluate(() => {
    const d = document.querySelector('dialog[open]')
    return d ? d.scrollWidth - d.clientWidth : null
  })
  await page.getByRole('button', { name: 'Vencido', exact: true }).click()
  await page.getByRole('button', { name: /salvar registro/i }).click()
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${shots}/${tema}-lista.png` })

  console.log(`${tema}: overflowDialogo=${overflow} erros=${JSON.stringify(erros)}`)
  await ctx.close()
}
await browser.close()
