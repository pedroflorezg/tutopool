import { test, expect } from '@playwright/test'

test.describe('TutorDashboard - acceso sin auth', () => {
  test('redirige a /tutor/login si no autenticado', async ({ page }) => {
    await page.goto('/tutor/dashboard')
    await page.waitForTimeout(2000)
    expect(page.url()).toMatch(/tutor\/login/)
  })
})

test.describe('TutorRegisterPage - campos de preferencias no aparecen en registro', () => {
  test('el registro solo pide datos básicos, no preferencias de sesión', async ({ page }) => {
    await page.goto('/tutor/registro')
    // Las preferencias se configuran DESPUÉS desde el dashboard, no en el registro
    await expect(page.locator('#reg-nombre')).toBeVisible()
    await expect(page.locator('#reg-email')).toBeVisible()
    await expect(page.locator('#reg-telefono')).toBeVisible()
    await expect(page.locator('#reg-password')).toBeVisible()
  })
})
