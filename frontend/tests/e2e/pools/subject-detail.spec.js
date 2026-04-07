import { test, expect } from '@playwright/test'

test.describe('SubjectDetailPage', () => {
  let subjectUrl

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/')
    await page.waitForSelector('.card', { timeout: 10000 })
    await page.locator('.card').first().click()
    await page.waitForURL(/\/materia\//)
    subjectUrl = page.url()
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto(subjectUrl)
    await page.waitForLoadState('networkidle')
  })

  test('muestra nombre de la materia', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('tiene botón de volver', async ({ page }) => {
    const backBtn = page.locator('button:has-text("Volver"), a:has-text("Volver"), button:has-text("←")')
    await expect(backBtn.first()).toBeVisible()
  })

  test('botón volver navega a home', async ({ page }) => {
    const backBtn = page.locator('button:has-text("Volver"), a:has-text("Volver"), button:has-text("←")').first()
    await backBtn.click()
    await expect(page).toHaveURL('https://tutopool.vercel.app/', { timeout: 8000 })
  })

  test('tiene CTA de solicitar tutoría', async ({ page }) => {
    const cta = page.locator('a[href*="solicitar"], button:has-text("Solicitar")')
    await expect(cta.first()).toBeVisible()
  })

  test('botón unirse redirige a login si no autenticado', async ({ page }) => {
    const joinBtn = page.locator('a[href*="unirse"], button:has-text("Unirme"), button:has-text("Unirse")')
    if (await joinBtn.count() > 0) {
      await joinBtn.first().click()
      await page.waitForTimeout(1500)
      const url = page.url()
      // Debe ir a /unirse/:id o /login
      expect(url).toMatch(/unirse|login/)
    }
  })
})
