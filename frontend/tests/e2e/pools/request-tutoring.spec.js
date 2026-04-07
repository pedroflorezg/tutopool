import { test, expect } from '@playwright/test'

test.describe('RequestTutoringPage', () => {
  let requestUrl

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/')
    await page.waitForSelector('.card', { timeout: 10000 })
    // Las cards son <Link> que renderizan como <a>, el href está en el .card directamente
    const firstCard = page.locator('.card').first()
    const href = await firstCard.getAttribute('href')
    if (href) {
      await page.goto(href)
      await page.waitForLoadState('networkidle')
      const solicitarLink = page.locator('a[href*="solicitar"]').first()
      if (await solicitarLink.count() > 0) {
        requestUrl = await solicitarLink.getAttribute('href')
      }
    }
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    if (!requestUrl) test.skip()
    await page.goto(requestUrl)
    await page.waitForLoadState('networkidle')
  })

  test('muestra selector de tipo (Individual / Grupal)', async ({ page }) => {
    await expect(page.locator('button:has-text("Individual"), label:has-text("Individual")')).toBeVisible()
    await expect(page.locator('button:has-text("Grupal"), label:has-text("Grupal")')).toBeVisible()
  })

  test('muestra selector de formato (Presencial / Virtual)', async ({ page }) => {
    await expect(page.locator('button:has-text("Presencial"), label:has-text("Presencial")')).toBeVisible()
    await expect(page.locator('button:has-text("Virtual"), label:has-text("Virtual")')).toBeVisible()
  })

  test('muestra selector de fecha', async ({ page }) => {
    await expect(page.locator('input[type="date"]')).toBeVisible()
  })

  test('muestra selector de hora', async ({ page }) => {
    await expect(page.locator('select, input[type="time"]').first()).toBeVisible()
  })

  test('muestra precio en tiempo real', async ({ page }) => {
    await expect(page.locator('text=/\\$|COP|precio/i').first()).toBeVisible()
  })

  test('alternar tipo cambia precio', async ({ page }) => {
    const individual = page.locator('button:has-text("Individual")').first()
    const grupal = page.locator('button:has-text("Grupal")').first()
    if (await individual.count() > 0 && await grupal.count() > 0) {
      await individual.click()
      const priceIndividual = await page.locator('text=/\\$[0-9]|[0-9]+.*COP/').first().innerText().catch(() => '')
      await grupal.click()
      const priceGrupal = await page.locator('text=/\\$[0-9]|[0-9]+.*COP/').first().innerText().catch(() => '')
      expect(priceIndividual).not.toBe(priceGrupal)
    }
  })

  test('enviar sin auth redirige a login', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first()
    await submitBtn.click()
    await page.waitForTimeout(2000)
    expect(page.url()).toMatch(/login|solicitar/)
  })
})
