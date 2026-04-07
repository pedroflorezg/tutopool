import { test, expect } from '@playwright/test'

test.describe('Login estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('muestra el formulario de login', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('muestra botones de OAuth', async ({ page }) => {
    await expect(page.locator('button:has-text("Google"), a:has-text("Google")')).toBeVisible()
  })

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.fill('input[type="email"]', 'noexiste@test.com')
    await page.fill('input[type="password"]', 'wrongpass123')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/error|inválid|incorrect|credencial/i').first()).toBeVisible({ timeout: 8000 })
  })

  test('tiene enlace a registro', async ({ page }) => {
    const link = page.locator('a[href*="registro"], a:has-text("Registr")')
    await expect(link.first()).toBeVisible()
  })

  test('tiene enlace a recuperar contraseña', async ({ page }) => {
    const link = page.locator('button:has-text("contraseña"), a:has-text("contraseña"), button:has-text("Olvidaste")')
    await expect(link.first()).toBeVisible()
  })
})

test.describe('Login tutor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/login')
  })

  test('muestra formulario de login para tutores', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('tiene enlace a registro de tutor', async ({ page }) => {
    const link = page.locator('a[href*="tutor/registro"], a:has-text("Registr")')
    await expect(link.first()).toBeVisible()
  })
})
