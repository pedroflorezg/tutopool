import { test, expect } from '@playwright/test'

test.describe('Registro estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/registro')
  })

  test('muestra todos los campos del formulario', async ({ page }) => {
    await expect(page.locator('input[name="nombre"], input[placeholder*="nombre" i], input[id*="nombre" i]').first()).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('muestra error con contraseña muy corta', async ({ page }) => {
    await page.locator('input[type="email"]').fill('nuevo@test.com')
    await page.locator('input[type="password"]').fill('123')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('text=/contraseña|password|mínimo|corta/i').first()).toBeVisible({ timeout: 6000 })
  })

  test('tiene enlace a login', async ({ page }) => {
    const link = page.locator('a[href*="login"], a:has-text("Inicia")')
    await expect(link.first()).toBeVisible()
  })

  test('muestra opciones de OAuth', async ({ page }) => {
    await expect(page.locator('button:has-text("Google"), a:has-text("Google")')).toBeVisible()
  })
})

test.describe('Registro tutor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/registro')
  })

  test('muestra campo de teléfono', async ({ page }) => {
    await expect(page.locator('#reg-telefono')).toBeVisible()
  })

  test('muestra lista de materias para seleccionar', async ({ page }) => {
    await page.waitForTimeout(2000)
    const checkboxes = page.locator('input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible({ timeout: 8000 })
  })
})
