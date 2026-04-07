import { test, expect } from '@playwright/test'

test.describe('Pools públicos', () => {
  test('carga la página principal', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TutoPool/)
  })

  test('muestra listado de pools disponibles', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=/pool|sesión|materia/i').first()).toBeVisible()
  })
})
