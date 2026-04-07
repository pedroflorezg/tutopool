import { test, expect } from '@playwright/test'

test.describe('AdminPage - protección de ruta', () => {
  test('redirige a / si no está autenticado', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(2000)
    await expect(page).not.toHaveURL('/admin')
  })
})
