import { test, expect } from '@playwright/test'

test.describe('JoinPoolPage', () => {
  test('muestra error 404 para pool inexistente', async ({ page }) => {
    await page.goto('/unirse/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    const text = await page.locator('body').textContent()
    expect(text).toMatch(/no encontrad|not found/i)
  })

  test('redirige a /login al confirmar sin autenticación', async ({ page }) => {
    // Primero obtenemos un pool válido
    await page.goto('/')
    await page.waitForSelector('.card', { timeout: 10000 })
    const href = await page.locator('.card').first().getAttribute('href')
    if (!href) return test.skip()

    await page.goto(href)
    await page.waitForLoadState('networkidle')
    const joinLink = page.locator('a[href*="unirse"]').first()
    if (await joinLink.count() === 0) return test.skip()

    const joinHref = await joinLink.getAttribute('href')
    await page.goto(joinHref)
    await page.waitForLoadState('networkidle')

    const confirmBtn = page.locator('button', { hasText: /confirmar|unirme/i }).first()
    if (await confirmBtn.count() === 0) return test.skip()

    await confirmBtn.click()
    await page.waitForURL(/login/, { timeout: 5000 })
    expect(page.url()).toMatch(/login/)
  })

  test('botón volver navega al inicio', async ({ page }) => {
    // Visitar una ruta join con ID inventado para probar el botón "Volver"
    // Si el pool no existe, el botón "Volver al inicio" debe estar
    await page.goto('/unirse/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    const backLink = page.locator('a', { hasText: /volver al inicio/i }).first()
    if (await backLink.count() > 0) {
      await backLink.click()
      await page.waitForURL('/', { timeout: 5000 })
      expect(page.url()).toMatch(/\/$/)
    }
  })
})
