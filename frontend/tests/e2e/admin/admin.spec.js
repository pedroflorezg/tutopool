import { test, expect } from '@playwright/test'

test.describe('Panel de administración', () => {
  test('redirige a / si no está autenticado', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).not.toHaveURL('/admin')
  })
})
